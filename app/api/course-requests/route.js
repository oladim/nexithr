import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notify";
import { ROLE_LABELS } from "@/lib/db";
import { alertAdmins } from "@/lib/adminAlert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEVELS = ["foundational", "intensive", "any"];

// GET /api/course-requests — the signed-in candidate's own requests.
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "candidate") return NextResponse.json({ error: "Candidates only" }, { status: 403 });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const { data, error } = await admin.from("course_requests")
    .select("id, topic, level, message, status, admin_note, created_at, updated_at")
    .eq("candidate_id", me.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data || [] });
}

// POST /api/course-requests  { topic, level, message }
// A candidate asks NexIT for a course. Admins are notified.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "candidate") return NextResponse.json({ error: "Candidates only" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const topic = String(body?.topic || "").trim().slice(0, 160);
  const message = String(body?.message || "").trim().slice(0, 1500);
  const level = LEVELS.includes(body?.level) ? body.level : "any";
  if (topic.length < 3) return NextResponse.json({ error: "Tell us which course or topic you'd like (at least 3 characters)." }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Light spam guard: at most 5 open requests per candidate.
  const { count } = await admin.from("course_requests").select("id", { count: "exact", head: true })
    .eq("candidate_id", me.id).in("status", ["new", "reviewing", "planned"]);
  if ((count || 0) >= 5) return NextResponse.json({ error: "You already have 5 open requests. We'll update you on those first." }, { status: 429 });

  const { data: cand } = await admin.from("candidates").select("target_role").eq("id", me.id).maybeSingle();
  const { data: row, error } = await admin.from("course_requests")
    .insert({ candidate_id: me.id, role_key: cand?.target_role || null, topic, level, message: message || null })
    .select("id, topic, level, message, status, admin_note, created_at, updated_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Tell the admins (in-app + email).
  try {
    const { data: admins } = await admin.from("profiles").select("id, email, full_name").eq("role", "admin");
    const roleLabel = ROLE_LABELS[cand?.target_role] || cand?.target_role || "no target role";
    for (const a of admins || []) {
      await notifyUser(admin, {
        userId: a.id, email: a.email, name: a.full_name,
        title: `Course request — ${topic}`,
        body: `${me.full_name || "A candidate"} (${roleLabel}) asked for a ${level === "any" ? "" : `${level} `}course: “${topic}”.${message ? `\n\n${message}` : ""}`,
        cta: { label: "Review course requests", path: "/admin/course-requests" },
      });
    }
  } catch { /* best-effort */ }

  await alertAdmins(admin, {
    key: `coursereq:${row.id}`,
    category: "training",
    subject: `Course request — ${topic}`,
    summary: `${me.full_name || "A candidate"} asked NexIT to offer a course.`,
    details: [["Candidate", `${me.full_name || "—"} (${me.email || me.authEmail || ""})`], ["Topic", topic], ["Tier", level], ["Note", message]],
    cta: { label: "Review course requests", path: "/admin/course-requests" },
  });
  return NextResponse.json({ ok: true, request: row });
}
