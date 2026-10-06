import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

const STAGES = ["AI", "Professional", "HR"];

// POST /api/admin/advance-stage  { candidateId, stage } — admins only.
// Optional manual override: marks a stage as passed so the candidate can
// proceed, regardless of their actual score. (Passing normally advances on its
// own; this is for admin discretion.)
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { candidateId, stage } = body || {};
  if (!candidateId || !STAGES.includes(stage)) {
    return NextResponse.json({ error: "candidateId and a valid stage are required" }, { status: 400 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  if (stage === "AI") {
    const { data: cur } = await admin.from("ai_interviews").select("attempts, last_score").eq("candidate_id", candidateId).maybeSingle();
    await admin.from("ai_interviews").upsert({
      candidate_id: candidateId,
      attempts: cur?.attempts ?? 1,
      last_score: cur?.last_score ?? 85,
      passed: true,
      feedback: "Advanced by admin.",
      updated_at: new Date().toISOString(),
    });
  } else {
    const { data: prev } = await admin
      .from("stage_attempts")
      .select("attempt_no")
      .eq("candidate_id", candidateId)
      .eq("stage", stage)
      .order("attempt_no", { ascending: false })
      .limit(1)
      .maybeSingle();
    await admin.from("stage_attempts").insert({
      candidate_id: candidateId,
      stage,
      attempt_no: (prev?.attempt_no ?? 0) + 1,
      passed: true,
      verdict: "Advanced by admin",
      avg: null,
      strengths: [],
      improvements: [],
      summary: "This stage was approved by an administrator.",
    });
    if (stage === "HR") await admin.from("candidates").update({ on_board: true }).eq("id", candidateId);
  }

  const { data: prof } = await admin.from("profiles").select("email, full_name").eq("id", candidateId).single();
  await admin.from("notifications").insert({
    user_id: candidateId,
    title: `${stage} stage approved`,
    body: `An administrator has approved your ${stage} stage. You can proceed to the next step.`,
    read: false,
  });
  await sendEmail({
    to: prof?.email,
    subject: `NexIT-Africa — your ${stage} stage was approved`,
    text: `Hi ${prof?.full_name || "there"},\n\nAn administrator has approved your ${stage} stage. You can now proceed to the next step.\n\n— The NexIT-Africa team`,
  });

  return NextResponse.json({ ok: true, stage });
}
