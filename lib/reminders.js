/**
 * Candidate reminders — SERVER ONLY (service-role client).
 *
 *   loadStatuses(admin, ids?)  → Map(candidateId → { state, step, profile, cand })
 *     Bulk-loads everything nextStep() needs, a few queries for any number of
 *     candidates (no per-candidate round trips).
 *   sendReminder(admin, row, { manual })  → emails + in-app notification.
 *   runNudges(admin, settings)  → the daily automatic pass.
 */
import { nextStep, STAGE_LABELS } from "@/lib/nextStep";
import { notifyUser } from "@/lib/notify";
import { ROLE_LABELS } from "@/lib/db";

const CHUNK = 200;
const chunks = (a) => { const out = []; for (let i = 0; i < a.length; i += CHUNK) out.push(a.slice(i, i + CHUNK)); return out; };

async function inChunks(ids, fn) {
  const rows = [];
  for (const part of chunks(ids)) { const { data } = await fn(part); if (data) rows.push(...data); }
  return rows;
}

export async function loadStatuses(admin, ids = null) {
  let cands;
  const cols = "id, target_role, on_board, nudge_key, nudge_count, last_nudged_at";
  if (ids) cands = await inChunks(ids, (p) => admin.from("candidates").select(cols).in("id", p));
  else {
    cands = [];
    for (let from = 0; from < 20000; from += 1000) {
      const { data } = await admin.from("candidates").select(cols).range(from, from + 999);
      if (!data?.length) break;
      cands.push(...data);
      if (data.length < 1000) break;
    }
  }
  const all = cands.map((c) => c.id);
  if (!all.length) return new Map();

  const [profiles, cvs, ais, stages, ivs, reqs] = await Promise.all([
    inChunks(all, (p) => admin.from("profiles").select("id, full_name, email, role").in("id", p)),
    inChunks(all, (p) => admin.from("cvs").select("candidate_id, role_key, status, review_note, uploaded_at").in("candidate_id", p).order("uploaded_at", { ascending: false })),
    inChunks(all, (p) => admin.from("ai_interviews").select("candidate_id, attempts, passed, status").in("candidate_id", p)),
    inChunks(all, (p) => admin.from("stage_attempts").select("candidate_id, stage, attempt_no, passed").in("candidate_id", p)),
    inChunks(all, (p) => admin.from("interviews").select("candidate_id, type, status, scheduled_date, scheduled_time, meet_link").in("candidate_id", p)),
    admin.from("role_requirements").select("role_key, title").then((r) => r.data || []),
  ]);
  const title = Object.fromEntries(reqs.map((r) => [r.role_key, r.title]));
  const by = (rows) => { const m = new Map(); rows.forEach((r) => { if (!m.has(r.candidate_id)) m.set(r.candidate_id, []); m.get(r.candidate_id).push(r); }); return m; };
  const P = new Map(profiles.map((p) => [p.id, p]));
  const CV = by(cvs), AI = new Map(ais.map((a) => [a.candidate_id, a])), ST = by(stages), IV = by(ivs);

  const out = new Map();
  for (const c of cands) {
    const prof = P.get(c.id);
    if (!prof || prof.role !== "candidate") continue;
    const cv = (CV.get(c.id) || []).find((v) => !v.role_key || v.role_key === c.target_role) || null;
    const stg = { Professional: { attempts: 0, passed: false }, HR: { attempts: 0, passed: false } };
    (ST.get(c.id) || []).forEach((s) => {
      const cur = stg[s.stage]; if (!cur) return;
      cur.attempts = Math.max(cur.attempts, s.attempt_no || 1);
      cur.passed = cur.passed || !!s.passed;
    });
    const state = {
      roleKey: c.target_role || null,
      roleTitle: title[c.target_role] || ROLE_LABELS[c.target_role] || null,
      cv: cv ? { status: cv.status, reviewNote: cv.review_note } : null,
      ai: AI.get(c.id) || { attempts: 0, passed: false, status: "released" },
      stages: stg,
      interviews: (IV.get(c.id) || []).map((i) => ({ type: i.type, status: i.status, date: i.scheduled_date, time: i.scheduled_time, meetLink: i.meet_link })),
      onBoard: !!c.on_board,
    };
    out.set(c.id, { id: c.id, cand: c, profile: prof, state, step: nextStep(state) });
  }
  return out;
}

// One reminder: where they are + what to do next.
export async function sendReminder(admin, row, { manual = false } = {}) {
  const { step, profile, state } = row;
  const stageName = STAGE_LABELS[(step.step || 1) - 1];
  const progress = `Step ${step.step} of ${step.of}: ${stageName}${state.roleTitle ? ` · ${state.roleTitle}` : ""}.`;
  const r = await notifyUser(admin, {
    userId: row.id,
    email: profile.email,
    name: profile.full_name,
    title: step.actionable ? `Your next step: ${step.title}` : step.title,
    emailSubject: step.actionable ? `Reminder — ${step.title}` : `Your NexIT-Africa status — ${step.title}`,
    body: `${progress} ${step.body}`,
    cta: step.cta,
  });
  const now = new Date().toISOString();
  const sameStep = row.cand.nudge_key === step.key;
  await admin.from("candidates").update({
    nudge_key: step.key,
    // Manual reminders don't use up the automatic allowance.
    nudge_count: manual ? (sameStep ? row.cand.nudge_count || 0 : 0) : (sameStep ? (row.cand.nudge_count || 0) + 1 : 1),
    last_nudged_at: now,
  }).eq("id", row.id).then(() => null, () => null);
  return { ok: r.inApp || r.emailSent, emailSent: r.emailSent, inApp: r.inApp, step: step.key };
}

/**
 * Daily automatic pass. For each candidate whose next step is something THEY
 * need to do:
 *   - a new step starts the clock (no message yet);
 *   - after `nudge_after_days` on the same step → first reminder;
 *   - then every `nudge_interval_days`, at most `nudge_max_per_step` times.
 * Waiting-on-NexIT steps (CV under review, results pending) and finished
 * candidates are never nudged.
 */
export async function runNudges(admin, s, { dryRun = false } = {}) {
  if (s.nudges_enabled === false) return { skipped: "disabled" };
  const afterMs = Math.max(1, Number(s.nudge_after_days ?? 3)) * 86400000;
  const everyMs = Math.max(1, Number(s.nudge_interval_days ?? 4)) * 86400000;
  const max = Math.max(0, Number(s.nudge_max_per_step ?? 3));
  const now = Date.now();
  const rows = await loadStatuses(admin);
  const out = { checked: rows.size, started: 0, sent: 0, failed: 0, byStep: {} };

  for (const row of rows.values()) {
    const { cand, step } = row;
    if (cand.nudge_key !== step.key) {
      // Entered a new step — start counting from now.
      if (!dryRun) await admin.from("candidates").update({ nudge_key: step.key, nudge_count: 0, last_nudged_at: new Date(now).toISOString() }).eq("id", cand.id);
      out.started++;
      continue;
    }
    if (!step.actionable || step.key === "done" || step.key.endsWith("-upcoming")) continue; // upcoming interviews get their own reminder
    const count = cand.nudge_count || 0;
    if (count >= max) continue;
    const last = cand.last_nudged_at ? new Date(cand.last_nudged_at).getTime() : 0;
    if (now - last < (count === 0 ? afterMs : everyMs)) continue;
    if (dryRun) { out.sent++; out.byStep[step.key] = (out.byStep[step.key] || 0) + 1; continue; }
    const r = await sendReminder(admin, row);
    if (r.ok) { out.sent++; out.byStep[step.key] = (out.byStep[step.key] || 0) + 1; } else out.failed++;
  }
  return out;
}
