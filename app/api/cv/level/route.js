import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notify";
import { alertAdmins } from "@/lib/adminAlert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function latestCv(admin, uid) {
  const { data } = await admin.from("cvs").select("id, status, suggested_role, original_role, review_note")
    .eq("candidate_id", uid).order("uploaded_at", { ascending: false }).limit(1).maybeSingle();
  return data;
}

// GET /api/cv/level — the pending level suggestion for the signed-in candidate.
export async function GET() {
  const me = await getSessionProfile();
  if (!me || me.role !== "candidate") return NextResponse.json({ suggestion: null });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ suggestion: null });
  const cv = await latestCv(admin, me.id).catch(() => null);
  if (!cv || cv.status !== "Level suggested" || !cv.suggested_role) return NextResponse.json({ suggestion: null });
  const { data: rows } = await admin.from("role_requirements").select("role_key, title, focus, min_experience").in("role_key", [cv.suggested_role, cv.original_role].filter(Boolean));
  const to = rows?.find((r) => r.role_key === cv.suggested_role);
  const from = rows?.find((r) => r.role_key === cv.original_role);
  return NextResponse.json({ suggestion: { to, from, note: cv.review_note || "" } });
}

// POST /api/cv/level { accept: boolean }
//   accept → target role becomes the suggested level and the CV is approved.
//   keep   → the review goes back to the NexIT reviewer to decide.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "candidate") return NextResponse.json({ error: "Candidates only" }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const accept = body?.accept === true;

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const cv = await latestCv(admin, me.id);
  if (!cv || cv.status !== "Level suggested" || !cv.suggested_role) return NextResponse.json({ error: "There's no level suggestion to respond to." }, { status: 409 });

  const { data: rows } = await admin.from("role_requirements").select("role_key, title, enabled").in("role_key", [cv.suggested_role, cv.original_role].filter(Boolean));
  const to = rows?.find((r) => r.role_key === cv.suggested_role);
  const from = rows?.find((r) => r.role_key === cv.original_role);
  const now = new Date().toISOString();

  if (accept) {
    if (!to || to.enabled === false) return NextResponse.json({ error: "That level isn't open any more. Please contact support." }, { status: 409 });
    const { error: e1 } = await admin.from("candidates").update({ target_role: to.role_key }).eq("id", me.id);
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
    await admin.from("cvs").update({ status: "Approved", level_response: "accepted", level_responded_at: now }).eq("id", cv.id);
    await notifyUser(admin, {
      userId: me.id, sendEmail: false,
      title: `You're now applying as ${to.title}`,
      body: "Your CV is approved at this level and your AI interview is unlocked. Good luck!",
      cta: { label: "Take the AI interview", path: "/dashboard/interview/ai" },
    });
    await alertAdmins(admin, {
      key: `level:${cv.id}:accepted`, category: "cvs",
      subject: `Level suggestion accepted — ${me.full_name || "candidate"} is now ${to.title}`,
      summary: `${me.full_name || "A candidate"} accepted the suggested level. Their CV is approved and the AI interview is unlocked.`,
      details: [["From", from?.title || cv.original_role || "—"], ["To", to.title]],
      cta: { label: "Open CV reviews", path: "/admin/cv-reviews" },
    });
    return NextResponse.json({ ok: true, accepted: true, roleKey: to.role_key, title: to.title });
  }

  await admin.from("cvs").update({ status: "Pending review", level_response: "declined", level_responded_at: now }).eq("id", cv.id);
  await alertAdmins(admin, {
    key: `level:${cv.id}:declined:${now}`, category: "cvs",
    subject: `Level suggestion declined — ${me.full_name || "candidate"} wants to stay ${from?.title || "at their level"}`,
    summary: `${me.full_name || "A candidate"} kept their original level. Their CV is back in the review queue — approve it at ${from?.title || "that level"} or reject it with a note.`,
    details: [["Applied for", from?.title || "—"], ["Suggested", to?.title || "—"]],
    cta: { label: "Open CV reviews", path: "/admin/cv-reviews" },
  });
  return NextResponse.json({ ok: true, accepted: false });
}
