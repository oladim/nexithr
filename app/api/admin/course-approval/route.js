import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/course-approval
//   { kind: "course" | "module", id, approved: boolean, includeModules?: boolean }
// Approve (publish to candidates) or withdraw a course or a module. Requires
// the "Approve courses & modules" permission (super-admins always have it).
// The approval flag can only be changed here — the browser can't set it.
export async function POST(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const allowed = access.role === "admin" && (access.superAdmin || access.permissions.includes("course_approval"));
  if (!allowed) return NextResponse.json({ error: "You don't have permission to approve courses. Ask a super-admin to add “Approve courses & modules” to your group." }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { kind, id, includeModules } = body || {};
  const approved = body?.approved === true;
  if (!["course", "module"].includes(kind) || !id) return NextResponse.json({ error: "kind and id are required" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const stamp = approved ? { approved: true, approved_by: access.id || null, approved_at: new Date().toISOString() } : { approved: false, approved_by: null, approved_at: null };
  const table = kind === "course" ? "specific_courses" : "course_modules";

  const { data: row } = await admin.from(table).select("id").eq("id", id).maybeSingle();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await admin.from(table).update(stamp).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let modules = 0;
  if (kind === "course" && approved && includeModules) {
    const { data: mods, error: mErr } = await admin.from("course_modules").update(stamp).eq("course_id", id).eq("approved", false).select("id");
    if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });
    modules = (mods || []).length;
  }
  return NextResponse.json({ ok: true, approved, modules });
}
