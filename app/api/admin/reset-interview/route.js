import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

const STAGES = ["AI", "Professional", "HR", "all"];

// POST /api/admin/reset-interview
// { candidateId, stage: "AI"|"Professional"|"HR"|"all", message? } — admins only.
//
// Clears the relevant interview record(s) so the candidate can retake, then
// notifies them (in-app + email). Resetting a later stage keeps earlier passes
// intact; resetting HR also removes the candidate from the board.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { candidateId, stage, message } = body || {};
  if (!candidateId || !STAGES.includes(stage)) {
    return NextResponse.json({ error: "candidateId and a valid stage are required" }, { status: 400 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const doAI = stage === "AI" || stage === "all";
  const doPro = stage === "Professional" || stage === "all";
  const doHR = stage === "HR" || stage === "all";

  const errors = [];
  const run = async (p) => { const { error } = await p; if (error) errors.push(error.message); };

  if (doAI) {
    // Clear the AI interview result + any scheduled AI interview.
    await run(admin.from("ai_interviews").delete().eq("candidate_id", candidateId));
    await run(admin.from("interviews").delete().eq("candidate_id", candidateId).eq("type", "AI"));
  }
  if (doPro) {
    await run(admin.from("stage_attempts").delete().eq("candidate_id", candidateId).eq("stage", "Professional"));
    await run(admin.from("interviews").delete().eq("candidate_id", candidateId).eq("type", "Professional"));
  }
  if (doHR) {
    await run(admin.from("stage_attempts").delete().eq("candidate_id", candidateId).eq("stage", "HR"));
    await run(admin.from("interviews").delete().eq("candidate_id", candidateId).eq("type", "HR"));
  }
  // Passing HR boards the candidate; resetting HR (or all) must un-board them.
  if (doHR) {
    await run(admin.from("candidates").update({ on_board: false }).eq("id", candidateId));
  }

  if (errors.length) {
    return NextResponse.json({ error: `Reset partially failed: ${errors.join("; ")}` }, { status: 500 });
  }

  // Notify the candidate.
  const { data: prof } = await admin.from("profiles").select("email, full_name").eq("id", candidateId).single();
  const stageLabel =
    stage === "all" ? "interviews" : stage === "AI" ? "AI interview" : `${stage} interview`;
  const defaultMsg =
    stage === "all"
      ? "Your interview stages have been reset. Please retake your interviews when you're ready."
      : `Your ${stageLabel} has been reset. Please retake it when you're ready.`;
  const finalMsg = (message && message.trim()) || defaultMsg;
  const title = stage === "all" ? "Interviews reset — please retake" : `${stageLabel} reset — please retake`;

  await admin.from("notifications").insert({ user_id: candidateId, title, body: finalMsg, read: false });

  const email = await sendEmail({
    to: prof?.email,
    subject: `NexIT-Africa — your ${stageLabel} was reset`,
    text: `Hi ${prof?.full_name || "there"},\n\n${finalMsg}\n\nSign in to NexIT-Africa to retake.\n\n— The NexIT-Africa team`,
  });

  return NextResponse.json({
    ok: true,
    stage,
    emailSent: email.sent,
    emailReason: email.sent ? undefined : email.reason,
  });
}
