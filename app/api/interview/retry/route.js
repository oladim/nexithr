import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const STAGES = ["Professional", "HR"];
const MAX_ATTEMPTS = 3;

// POST /api/interview/retry { kind } — spend one assessment token to retry a
// human stage. Server-authoritative: it verifies the token balance and attempt
// cap, decrements the balance, writes the ledger entry, and clears the booked
// interview — all with the service role, so candidates can't grant themselves
// tokens or a free retry from the browser.
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

  const { data: cand } = await admin.from("candidates").select("tokens").eq("id", me.id).maybeSingle();
  const tokens = cand?.tokens ?? 0;
  if (tokens <= 0) return NextResponse.json({ error: "You have no assessment tokens left." }, { status: 402 });

  // Don't allow retrying a stage that's already passed, or beyond the cap.
  const { data: attempts } = await admin.from("stage_attempts").select("attempt_no, passed").eq("candidate_id", me.id).eq("stage", kind).order("attempt_no", { ascending: false });
  if ((attempts || []).some((a) => a.passed)) return NextResponse.json({ error: "You've already passed this stage." }, { status: 409 });
  const used = attempts?.[0]?.attempt_no ?? 0;
  if (used >= MAX_ATTEMPTS) return NextResponse.json({ error: "No retries left for this stage." }, { status: 403 });

  const [{ error: e1 }, { error: e2 }, { error: e3 }] = await Promise.all([
    admin.from("candidates").update({ tokens: tokens - 1 }).eq("id", me.id),
    admin.from("token_transactions").insert({ candidate_id: me.id, type: "spend", amount: -1, reason: `${kind} retry` }),
    admin.from("interviews").delete().eq("candidate_id", me.id).eq("type", kind),
  ]);
  if (e1 || e2 || e3) return NextResponse.json({ error: (e1 || e2 || e3).message }, { status: 500 });

  return NextResponse.json({ ok: true, tokens: tokens - 1 });
}
