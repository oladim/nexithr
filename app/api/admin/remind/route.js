import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadStatuses, sendReminder } from "@/lib/reminders";
import { STEP_KEYS } from "@/lib/nextStep";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MIN_GAP_MS = 2 * 60 * 1000; // guards against double clicks / repeated bulk sends

/**
 * Admin reminders — tells candidates where they are and what to do next
 * (in-app notification + email).
 *
 * GET  /api/admin/remind                      → how many candidates are at each step
 * POST { candidateIds: [...] }                → remind these candidates
 * POST { stepKey: "ai-take" }                 → remind everyone at that step
 *      (only steps the candidate must act on)
 */
async function guard() {
  const me = await getSessionProfile();
  if (!me) return { res: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  if (me.role !== "admin") return { res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  const admin = getServiceSupabase();
  if (!admin) return { res: NextResponse.json({ error: "Server not configured" }, { status: 500 }) };
  return { admin };
}

export async function GET() {
  const { admin, res } = await guard();
  if (res) return res;
  const rows = await loadStatuses(admin);
  const steps = {};
  for (const r of rows.values()) {
    const k = r.step.key;
    steps[k] = steps[k] || { key: k, title: r.step.title, actionable: r.step.actionable, stage: r.step.step, count: 0 };
    steps[k].count++;
  }
  return NextResponse.json({ steps: STEP_KEYS.filter((k) => steps[k]).map((k) => steps[k]) });
}

export async function POST(request) {
  const { admin, res } = await guard();
  if (res) return res;
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  let rows;
  const bulk = !!body?.stepKey;
  if (bulk) {
    if (!STEP_KEYS.includes(body.stepKey)) return NextResponse.json({ error: "Unknown step" }, { status: 400 });
    rows = [...(await loadStatuses(admin)).values()].filter((r) => r.step.key === body.stepKey);
    if (rows[0] && !rows[0].step.actionable) return NextResponse.json({ error: "Candidates at this step are waiting on the NexIT team — there's nothing for them to do yet." }, { status: 400 });
  } else {
    const ids = [...new Set((body?.candidateIds || []).filter((x) => UUID.test(String(x))))].slice(0, 200);
    if (!ids.length) return NextResponse.json({ error: "candidateIds required" }, { status: 400 });
    rows = [...(await loadStatuses(admin, ids)).values()];
  }

  const now = Date.now();
  const results = [];
  let sent = 0;
  for (const r of rows.slice(0, 1000)) {
    const last = r.cand.last_nudged_at ? new Date(r.cand.last_nudged_at).getTime() : 0;
    if (r.cand.nudge_key === r.step.key && last > 0 && now - last < MIN_GAP_MS) {
      results.push({ id: r.id, ok: false, reason: "Reminded a moment ago" });
      continue;
    }
    const out = await sendReminder(admin, r, { manual: true });
    if (out.ok) sent++;
    results.push({ id: r.id, ok: out.ok, step: r.step.key, title: r.step.title, emailSent: out.emailSent, reason: out.ok ? undefined : "Couldn't deliver" });
  }
  return NextResponse.json({ ok: true, sent, total: rows.length, results });
}
