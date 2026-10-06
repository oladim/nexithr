import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { computeStageResult } from "@/lib/stageResult";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";

const STAGES = ["Professional", "HR"];
const MAX_ATTEMPTS = 3; // first attempt + 2 retries

// POST /api/interview/stage-complete { kind } — the signed-in candidate's
// server-authoritative stage result. The verdict is computed server-side (the
// client can't choose pass/fail), prerequisites are enforced, the attempt is
// recorded, and passing HR puts the candidate on the board — all with the
// service role so RLS can lock these tables from direct browser writes.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "candidate") return NextResponse.json({ error: "Candidates only" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const kind = body?.kind;
  if (!STAGES.includes(kind)) return NextResponse.json({ error: "Invalid stage" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // ---- Prerequisites (server-enforced) ----
  const { data: ai } = await admin.from("ai_interviews").select("passed").eq("candidate_id", me.id).maybeSingle();
  if (!ai?.passed) return NextResponse.json({ error: "You must pass the AI interview first." }, { status: 403 });
  if (kind === "HR") {
    const { data: pro } = await admin.from("stage_attempts").select("id").eq("candidate_id", me.id).eq("stage", "Professional").eq("passed", true).limit(1);
    if (!(pro || []).length) return NextResponse.json({ error: "You must pass the Professional interview first." }, { status: 403 });
  }

  // Already passed this stage? Don't record a duplicate.
  const { data: already } = await admin.from("stage_attempts").select("id").eq("candidate_id", me.id).eq("stage", kind).eq("passed", true).limit(1);
  if ((already || []).length) return NextResponse.json({ error: "You've already passed this stage." }, { status: 409 });

  // Attempt number + cap.
  const { data: prev } = await admin.from("stage_attempts").select("attempt_no").eq("candidate_id", me.id).eq("stage", kind).order("attempt_no", { ascending: false }).limit(1).maybeSingle();
  const attemptNo = (prev?.attempt_no ?? 0) + 1;
  if (attemptNo > MAX_ATTEMPTS) return NextResponse.json({ error: "No attempts left for this stage." }, { status: 403 });

  // ---- Authoritative verdict ----
  const result = computeStageResult(kind, attemptNo);

  const { error: insErr } = await admin.from("stage_attempts").insert({
    candidate_id: me.id, stage: kind, attempt_no: attemptNo,
    passed: result.passed, verdict: result.verdict, avg: result.avg,
    strengths: result.strengths, improvements: result.improvements, summary: result.summary,
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  if (result.passed && kind === "HR") {
    await admin.from("candidates").update({ on_board: true }).eq("id", me.id);
  }

  // Notify the candidate of the outcome (in-app + email).
  await notifyUser(admin, {
    userId: me.id, email: me.email || me.authEmail, name: me.full_name,
    title: result.passed ? `${kind} interview passed` : `${kind} interview — not passed yet`,
    body: result.passed
      ? (kind === "HR" ? "Congratulations — you've passed all stages and you're now on the candidate board." : "You've passed the Professional interview. You can now book your HR interview.")
      : `Your ${kind} interview didn't pass this time. You can retry with an assessment token.`,
    cta: { label: "Open your dashboard", path: "/dashboard/interview" },
  });

  return NextResponse.json({ ok: true, result, passed: result.passed, attemptNo });
}
