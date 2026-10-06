import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

// GET /api/admin/ai-results — AI interviews awaiting reviewer approval.
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data } = await admin
    .from("ai_interviews")
    .select("candidate_id, last_score, band, passed, feedback, updated_at, status, profiles:candidate_id(full_name, email)")
    .eq("status", "pending_review")
    .order("updated_at", { ascending: true });

  const rows = (data || []).map((r) => ({
    candidateId: r.candidate_id,
    name: r.profiles?.full_name || "Candidate",
    email: r.profiles?.email,
    score: r.last_score,
    band: r.band,
    passed: r.passed,
    summary: r.feedback,
    at: r.updated_at,
  }));
  return NextResponse.json({ pending: rows });
}

// POST /api/admin/ai-results { candidateId, action: "release" | "override_ready" }
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { candidateId, action } = body || {};
  if (!candidateId || !["release", "override_ready"].includes(action)) {
    return NextResponse.json({ error: "candidateId and a valid action are required" }, { status: 400 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const patch = { status: "released", confirmed_by: me.id, confirmed_at: new Date().toISOString() };
  if (action === "override_ready") { patch.passed = true; patch.band = "ready"; }

  const { error } = await admin.from("ai_interviews").update(patch).eq("candidate_id", candidateId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: prof } = await admin.from("profiles").select("email, full_name").eq("id", candidateId).single();
  await admin.from("notifications").insert({
    user_id: candidateId,
    title: "Your readiness report is ready",
    body: "A NexIT reviewer has confirmed your AI interview. Open your report to see your results and personalised training plan.",
    read: false,
  });
  await sendEmail({
    to: prof?.email,
    subject: "NexIT-Africa — your readiness report is ready",
    text: `Hi ${prof?.full_name || "there"},\n\nA reviewer has confirmed your AI interview. Sign in to see your readiness report and your personalised training plan.\n\n— The NexIT-Africa team`,
  });

  return NextResponse.json({ ok: true, action });
}
