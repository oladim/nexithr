import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notify";
import { ROLE_LABELS } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["new", "reviewing", "planned", "available", "declined"];
const LABEL = { new: "Received", reviewing: "Under review", planned: "Planned", available: "Now available", declined: "Not planned" };

function canManage(access) {
  return access?.role === "admin" && (access.superAdmin || access.permissions.includes("course_requests"));
}

// GET /api/admin/course-requests — every request with the candidate's name.
export async function GET() {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: rows, error } = await admin.from("course_requests").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = [...new Set((rows || []).map((r) => r.candidate_id))];
  const { data: profs } = ids.length ? await admin.from("profiles").select("id, full_name, email").in("id", ids) : { data: [] };
  const by = Object.fromEntries((profs || []).map((p) => [p.id, p]));
  return NextResponse.json({
    requests: (rows || []).map((r) => ({
      id: r.id, topic: r.topic, level: r.level, message: r.message, status: r.status, adminNote: r.admin_note,
      createdAt: r.created_at, updatedAt: r.updated_at,
      role: ROLE_LABELS[r.role_key] || r.role_key || "—",
      candidate: by[r.candidate_id]?.full_name || "Candidate", email: by[r.candidate_id]?.email || "",
    })),
  });
}

// PATCH /api/admin/course-requests  { id, status, note }
// Update a request; the candidate is told the new status (and the note).
export async function PATCH(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { id, status } = body || {};
  const note = String(body?.note || "").trim().slice(0, 1500);
  if (!id || !STATUSES.includes(status)) return NextResponse.json({ error: "id and a valid status are required" }, { status: 400 });
  if (status === "declined" && !note) return NextResponse.json({ error: "Add a short note explaining why — the candidate will see it." }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const { data: row, error } = await admin.from("course_requests")
    .update({ status, admin_note: note || null, handled_by: access.id || null, updated_at: new Date().toISOString() })
    .eq("id", id).select("candidate_id, topic").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await notifyUser(admin, {
    userId: row.candidate_id,
    title: `Your course request: ${LABEL[status]}`,
    body: `Update on your request for “${row.topic}”: ${LABEL[status].toLowerCase()}.${note ? `\n\n${note}` : ""}`,
    cta: { label: status === "available" ? "Go to training" : "View your requests", path: "/dashboard/training/specific" },
  });
  return NextResponse.json({ ok: true });
}
