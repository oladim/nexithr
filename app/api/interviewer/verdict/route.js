import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { synthesizeNotes } from "@/lib/stageResult";
import { notifyUser } from "@/lib/notify";
import { getOrIssueCertificate } from "@/lib/certificate";

export const runtime = "nodejs";

const STAGES = ["Professional", "HR"];
const MAX_ATTEMPTS = 3;

// POST /api/interviewer/verdict
//   { candidateId, stage, decision: "advance"|"reject", rating, strengths, improvements, note }
// The interviewer's authoritative decision for a human stage. Records their
// note, then writes the candidate's stage result (service role) from the real
// panel notes — passing HR puts them on the board. Only the assigned kind of
// interviewer (or an admin) can submit.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const isAdmin = me.role === "admin";
  if (me.role !== "interviewer" && !isAdmin) return NextResponse.json({ error: "Interviewers only" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { candidateId, stage, decision } = body || {};
  const rating = Math.max(1, Math.min(5, Math.round(Number(body?.rating) || 0))) || null;
  if (!candidateId || !STAGES.includes(stage)) return NextResponse.json({ error: "candidateId and a valid stage are required" }, { status: 400 });
  if (!["advance", "reject"].includes(decision)) return NextResponse.json({ error: "A decision is required" }, { status: 400 });
  if (!rating) return NextResponse.json({ error: "Please rate the candidate." }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Interviewer must match the stage they're grading (admins bypass).
  if (!isAdmin) {
    const { data: iv } = await admin.from("interviewers").select("kind").eq("id", me.id).maybeSingle();
    if (!iv) return NextResponse.json({ error: "Your interviewer profile isn't set up." }, { status: 403 });
    if (iv.kind !== stage) return NextResponse.json({ error: `This is an HR/Professional mismatch — you can only grade ${iv.kind} interviews.` }, { status: 403 });
    // Must be the interviewer an admin assigned to this candidate's booking.
    const { data: mine } = await admin.from("interviews").select("id").eq("candidate_id", candidateId).eq("type", stage).eq("interviewer_id", me.id).limit(1);
    if (!(mine || []).length) return NextResponse.json({ error: "You haven't been assigned to this candidate's interview." }, { status: 403 });
  }

  // Prerequisites.
  const { data: ai } = await admin.from("ai_interviews").select("passed").eq("candidate_id", candidateId).maybeSingle();
  if (!ai?.passed) return NextResponse.json({ error: "This candidate hasn't passed the AI interview yet." }, { status: 409 });
  if (stage === "HR") {
    const { data: pro } = await admin.from("stage_attempts").select("id").eq("candidate_id", candidateId).eq("stage", "Professional").eq("passed", true).limit(1);
    if (!(pro || []).length) return NextResponse.json({ error: "This candidate hasn't passed the Professional stage yet." }, { status: 409 });
  }

  // Already passed? Don't re-grade.
  const { data: already } = await admin.from("stage_attempts").select("id").eq("candidate_id", candidateId).eq("stage", stage).eq("passed", true).limit(1);
  if ((already || []).length) return NextResponse.json({ error: "This stage is already passed." }, { status: 409 });

  // 1) Save this interviewer's note.
  await admin.from("interviewer_notes").upsert({
    interviewer_id: me.id, candidate_id: candidateId, stage,
    rating, strengths: body?.strengths || null, improvements: body?.improvements || null, note: body?.note || null,
  }, { onConflict: "interviewer_id,candidate_id,stage" });

  // 2) Synthesize the panel's notes for this stage into the result.
  const { data: notes } = await admin
    .from("interviewer_notes")
    .select("rating, strengths, improvements")
    .eq("candidate_id", candidateId).eq("stage", stage);
  const synth = synthesizeNotes((notes || []).map((n) => ({ rating: n.rating, strengths: n.strengths, improvements: n.improvements }))) || {
    avg: rating, strengths: [], improvements: [], summary: "", count: 1,
  };
  const passed = decision === "advance";
  const verdict = passed ? "Recommended to advance" : "Not recommended";

  // 3) Record the attempt (authoritative).
  const { data: prev } = await admin.from("stage_attempts").select("attempt_no").eq("candidate_id", candidateId).eq("stage", stage).order("attempt_no", { ascending: false }).limit(1).maybeSingle();
  const attemptNo = (prev?.attempt_no ?? 0) + 1;
  if (attemptNo > MAX_ATTEMPTS) return NextResponse.json({ error: "This candidate has no attempts left for this stage." }, { status: 409 });

  const { error: insErr } = await admin.from("stage_attempts").insert({
    candidate_id: candidateId, stage, attempt_no: attemptNo,
    passed, verdict, avg: synth.avg,
    strengths: synth.strengths, improvements: synth.improvements,
    summary: synth.summary || (passed ? "The panel recommends advancing this candidate." : "The panel does not recommend advancing at this stage."),
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  // 4) Close the booked interview(s) for this stage.
  await admin.from("interviews").update({ status: "Completed" }).eq("candidate_id", candidateId).eq("type", stage).eq("status", "Confirmed");

  // 5) Passing HR puts them on the board.
  if (passed && stage === "HR") {
    await admin.from("candidates").update({ on_board: true }).eq("id", candidateId);
    // All stages passed → issue their certificate (best-effort; it is also
    // issued on first view if this fails).
    try { await getOrIssueCertificate(admin, candidateId); } catch { /* ignore */ }
  }

  // 6) Notify the candidate.
  await notifyUser(admin, {
    userId: candidateId,
    title: passed ? `${stage} interview passed` : `${stage} interview — not passed`,
    body: passed
      ? (stage === "HR" ? "Congratulations — you've passed all stages and you're now on the candidate board. Your NexIT Verified Professional (N|VP) certificate is ready to print from your dashboard." : "You've passed the Professional interview. You can now book your HR interview.")
      : `Your ${stage} interview wasn't passed this time. You can review the feedback and retry with an assessment token.`,
    cta: passed && stage === "HR"
      ? { label: "Print my certificate", path: "/dashboard/certificate" }
      : { label: "View your result", path: `/dashboard/interview/${stage.toLowerCase()}` },
  });

  return NextResponse.json({ ok: true, passed, attemptNo, result: { verdict, avg: synth.avg, strengths: synth.strengths, improvements: synth.improvements, summary: synth.summary, passed } });
}
