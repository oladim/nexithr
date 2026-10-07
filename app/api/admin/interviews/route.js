import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function canManage(access) {
  if (!access || access.role !== "admin") return false;
  return access.superAdmin || access.permissions.includes("interviews");
}

// GET /api/admin/interviews — open Professional/HR bookings plus the approved
// interviewers an admin can assign to each (matched by kind).
export async function GET() {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const [{ data: rows, error }, { data: ivs }] = await Promise.all([
    admin.from("interviews")
      .select("id, candidate_id, type, mode, role, scheduled_date, scheduled_time, interviewer_id, status, meet_link, created_at")
      .in("type", ["Professional", "HR"]).eq("status", "Confirmed")
      .order("created_at", { ascending: false }),
    admin.from("interviewers").select("id, kind"),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = [...new Set([...(rows || []).map((r) => r.candidate_id), ...(ivs || []).map((i) => i.id)])];
  const { data: profs } = ids.length
    ? await admin.from("profiles").select("id, full_name, email, approval_status").in("id", ids)
    : { data: [] };
  const byId = {};
  (profs || []).forEach((p) => (byId[p.id] = p));

  const interviewers = (ivs || [])
    .filter((i) => byId[i.id] && (byId[i.id].approval_status || "approved") === "approved")
    .map((i) => ({ id: i.id, kind: i.kind, name: byId[i.id].full_name || byId[i.id].email || "Interviewer", email: byId[i.id].email || "" }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const bookings = (rows || []).map((r) => ({
    id: r.id,
    candidateId: r.candidate_id,
    candidate: byId[r.candidate_id]?.full_name || "Candidate",
    candidateEmail: byId[r.candidate_id]?.email || "",
    type: r.type,
    role: r.role || "—",
    date: r.scheduled_date || "—",
    time: r.scheduled_time || "",
    meetLink: r.meet_link || null,
    interviewerId: r.interviewer_id || null,
    interviewer: r.interviewer_id ? byId[r.interviewer_id]?.full_name || "Interviewer" : null,
  }));

  return NextResponse.json({ bookings, interviewers });
}

// POST /api/admin/interviews  { interviewId, interviewerId }
// Assign (or re-assign) an interviewer to a booking. The interviewer must be an
// approved interviewer of the matching kind. Both sides are notified.
export async function POST(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { interviewId, interviewerId } = body || {};
  if (!interviewId || !interviewerId) return NextResponse.json({ error: "interviewId and interviewerId are required" }, { status: 400 });

  const { data: row } = await admin.from("interviews")
    .select("id, candidate_id, type, role, scheduled_date, scheduled_time, meet_link, status, interviewer_id")
    .eq("id", interviewId).maybeSingle();
  if (!row) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (row.status !== "Confirmed") return NextResponse.json({ error: "This booking is no longer open." }, { status: 409 });
  if (!["Professional", "HR"].includes(row.type)) return NextResponse.json({ error: "Only Professional and HR bookings take an interviewer." }, { status: 400 });

  const [{ data: iv }, { data: ivProf }, { data: candProf }] = await Promise.all([
    admin.from("interviewers").select("id, kind").eq("id", interviewerId).maybeSingle(),
    admin.from("profiles").select("id, full_name, email, role, approval_status").eq("id", interviewerId).maybeSingle(),
    admin.from("profiles").select("id, full_name, email").eq("id", row.candidate_id).maybeSingle(),
  ]);
  if (!iv || !ivProf || ivProf.role !== "interviewer") return NextResponse.json({ error: "That user isn't an interviewer." }, { status: 400 });
  if ((ivProf.approval_status || "approved") !== "approved") return NextResponse.json({ error: "That interviewer hasn't been approved yet." }, { status: 400 });
  if (iv.kind !== row.type) return NextResponse.json({ error: `A ${row.type} booking needs a ${row.type} interviewer — ${ivProf.full_name || "this person"} is ${iv.kind}.` }, { status: 400 });

  const previous = row.interviewer_id;
  if (previous === interviewerId) return NextResponse.json({ ok: true, unchanged: true, interviewer: ivProf.full_name });

  const { error } = await admin.from("interviews").update({ interviewer_id: interviewerId }).eq("id", interviewId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const when = `${row.scheduled_date || ""}${row.scheduled_time ? `, ${row.scheduled_time}` : ""}`;
  const meetLine = row.meet_link ? `Join on Google Meet: ${row.meet_link}` : "The meeting link will follow.";
  const candName = candProf?.full_name || "a candidate";

  await notifyUser(admin, {
    userId: interviewerId, email: ivProf.email, name: ivProf.full_name,
    title: `New ${row.type} interview — ${candName}`,
    body: `You've been assigned a ${row.type} interview with ${candName} (${row.role || "role"}) on ${when}.\n\n${meetLine}`,
    cta: row.meet_link ? { label: "Join the call", url: row.meet_link } : { label: "Open your dashboard", path: "/interviewer/interview" },
  });
  await notifyUser(admin, {
    userId: row.candidate_id, email: candProf?.email, name: candProf?.full_name,
    title: `Your ${row.type} interviewer is confirmed`,
    body: `${ivProf.full_name || "Your interviewer"} will conduct your ${row.type} interview on ${when}.\n\n${meetLine}`,
    cta: row.meet_link ? { label: "Join the call", url: row.meet_link } : { label: "View your interviews", path: "/dashboard/interview" },
  });
  if (previous) {
    await notifyUser(admin, {
      userId: previous,
      title: `${row.type} interview re-assigned`,
      body: `Your ${row.type} interview with ${candName} on ${when} has been re-assigned to another interviewer. No action is needed.`,
    });
  }

  return NextResponse.json({ ok: true, interviewer: ivProf.full_name || "Interviewer" });
}
