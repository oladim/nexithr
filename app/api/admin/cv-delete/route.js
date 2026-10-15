import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notify";
import { deleteCvRows } from "@/lib/cvStore";
import { ROLE_LABELS } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/cv-delete { cvId, notify? } — admins only.
// Removes one CV record and its stored file. With notify, the candidate is
// told (in-app + email) to upload a new CV for that role.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const cvId = String(body?.cvId || "");
  if (!/^[0-9a-f-]{36}$/i.test(cvId)) return NextResponse.json({ error: "cvId required" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const { data: cv } = await admin.from("cvs").select("*").eq("id", cvId).maybeSingle();
  if (!cv) return NextResponse.json({ error: "That CV no longer exists." }, { status: 404 });

  const r = await deleteCvRows(admin, [cv]);
  if (r.error) return NextResponse.json({ error: r.error }, { status: 500 });

  if (body?.notify) {
    const { data: cand } = await admin.from("candidates").select("target_role").eq("id", cv.candidate_id).maybeSingle();
    const roleKey = cv.role_key || cand?.target_role;
    const forActive = !cv.role_key || cv.role_key === cand?.target_role;
    await notifyUser(admin, {
      userId: cv.candidate_id,
      title: "Please upload your CV again",
      body: `Your CV "${cv.file_name}"${roleKey ? ` for ${ROLE_LABELS[roleKey] || roleKey}` : ""} was removed by the NexIT-Africa team. ` +
        (forActive ? "Upload an up-to-date CV so we can review it and unlock your AI interview." : "Switch to that role in My roles and upload a new CV when you're ready."),
      cta: { label: "Upload CV", path: "/dashboard/cv-upload" },
    }).catch(() => null);
  }
  return NextResponse.json({ ok: true });
}
