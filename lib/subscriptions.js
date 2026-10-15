/**
 * Subscriptions & revenue — SERVER ONLY (service-role client).
 *
 *   grantSubscription   paid via Paystack, recorded manually by an admin, or complimentary
 *   cancelSubscription  admin unsubscribes a candidate (access ends now)
 *   runSubscriptionReminders  daily: "expires in 7 days", "expires tomorrow", "expired"
 *   revenueSummary      totals for the admin dashboard / revenue page
 *
 * A subscription is simply candidates.subscription_until in the future, so
 * expiry is automatic: nothing has to run for access to stop on the date.
 */
import { notifyUser } from "@/lib/notify";
import { formatNaira } from "@/lib/money";

const DAY = 86400000;
export const SOURCES = ["paystack", "manual", "complimentary"];

export function subscriptionState(until, now = Date.now()) {
  if (!until) return "none";
  const t = new Date(until).getTime();
  if (t <= now) return "expired";
  if (t - now <= 30 * DAY) return "expiring";
  return "active";
}

const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function addPeriod(base, { months, days }) {
  const d = new Date(base);
  if (months) d.setMonth(d.getMonth() + Number(months));
  if (days) d.setTime(d.getTime() + Number(days) * DAY);
  return d;
}

async function profileOf(admin, id) {
  const { data } = await admin.from("profiles").select("id, full_name, email").eq("id", id).maybeSingle();
  return data || { id };
}

/**
 * Give / extend a subscription.
 * opts: { candidateId, source, months?, days?, until?, amount?, currency?, reference?,
 *         paymentId?, note?, actorId?, notify? }
 *  - `until` sets an exact end date; otherwise the period is added to the later
 *    of now and the current expiry (so renewing early never loses days).
 *  - source "manual" records a successful payment row (amount required ≥ 0);
 *    "complimentary" records a ₦0 row so it shows in the history; "paystack"
 *    expects `paymentId` of the already-verified row.
 */
export async function grantSubscription(admin, opts) {
  const { candidateId, source = "manual", note = "", actorId = null, notify = true } = opts;
  if (!SOURCES.includes(source)) return { error: "Unknown source" };
  const { data: cand } = await admin.from("candidates").select("id, subscription_until, subscription_started_at").eq("id", candidateId).maybeSingle();
  if (!cand) return { error: "Candidate not found" };

  const now = new Date();
  const current = cand.subscription_until ? new Date(cand.subscription_until) : null;
  const active = current && current > now;
  let until;
  if (opts.until) {
    until = new Date(opts.until);
    if (isNaN(until.getTime())) return { error: "Invalid end date" };
    if (until <= now) return { error: "The end date must be in the future" };
  } else {
    const months = Number(opts.months) || 0;
    const days = Number(opts.days) || 0;
    if (months <= 0 && days <= 0) return { error: "Choose how long the subscription lasts" };
    if (months > 60 || days > 1830) return { error: "That's longer than 5 years" };
    until = addPeriod(active ? current : now, { months, days });
  }
  const start = active ? new Date(cand.subscription_started_at || now) : now;

  // Payment record.
  let paymentId = opts.paymentId || null;
  const amount = source === "complimentary" ? 0 : Math.max(0, Number(opts.amount) || 0);
  if (source !== "paystack") {
    const ref = (opts.reference || "").trim().slice(0, 120) || `${source === "manual" ? "man" : "comp"}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const { data: pay, error } = await admin.from("candidate_payments").insert({
      candidate_id: candidateId,
      purpose: "subscription",
      amount,
      currency: opts.currency || "NGN",
      reference: ref,
      status: "success",
      provider: source,
      paid_at: now.toISOString(),
      note: note || null,
      recorded_by: actorId,
      period_start: (active ? current : now).toISOString(),
      period_end: until.toISOString(),
    }).select("id").single();
    if (error) return { error: /duplicate|unique/i.test(error.message) ? "That payment reference is already recorded" : error.message };
    paymentId = pay.id;
  } else if (paymentId) {
    await admin.from("candidate_payments").update({ period_start: (active ? current : now).toISOString(), period_end: until.toISOString() }).eq("id", paymentId);
  }

  const { error: upErr } = await admin.from("candidates").update({
    subscription_until: until.toISOString(),
    subscription_started_at: start.toISOString(),
    subscription_source: source,
    subscription_cancelled_at: null,
    subscription_reminder: null,
  }).eq("id", candidateId);
  if (upErr) return { error: upErr.message };

  await admin.from("subscription_events").insert({
    candidate_id: candidateId,
    action: active ? "extended" : "subscribed",
    source,
    until_before: current ? current.toISOString() : null,
    until_after: until.toISOString(),
    amount,
    payment_id: paymentId,
    actor_id: actorId,
    note: note || null,
  });

  if (notify) {
    const p = await profileOf(admin, candidateId);
    await notifyUser(admin, {
      userId: candidateId,
      email: p.email,
      name: p.full_name,
      title: active ? "Subscription extended" : "Subscription active",
      body: `Your NexIT-Africa subscription is active until ${fmtDate(until)}. You have unlimited AI interview retakes, suggested training and can add another role.`,
      cta: { label: "Go to training", path: "/dashboard/training" },
    }).catch(() => {});
  }
  return { ok: true, until: until.toISOString(), extended: !!active, paymentId };
}

/** End a subscription now. */
export async function cancelSubscription(admin, { candidateId, actorId = null, note = "", notify = true }) {
  const { data: cand } = await admin.from("candidates").select("id, subscription_until").eq("id", candidateId).maybeSingle();
  if (!cand) return { error: "Candidate not found" };
  const now = new Date();
  const was = cand.subscription_until ? new Date(cand.subscription_until) : null;
  if (!was || was <= now) return { error: "This candidate has no active subscription" };
  const { error } = await admin.from("candidates").update({
    subscription_until: now.toISOString(),
    subscription_cancelled_at: now.toISOString(),
  }).eq("id", candidateId);
  if (error) return { error: error.message };
  await admin.from("subscription_events").insert({
    candidate_id: candidateId, action: "cancelled", source: "manual",
    until_before: was.toISOString(), until_after: now.toISOString(), actor_id: actorId, note: note || null,
  });
  if (notify) {
    const p = await profileOf(admin, candidateId);
    await notifyUser(admin, {
      userId: candidateId, email: p.email, name: p.full_name,
      title: "Subscription ended",
      body: `Your NexIT-Africa subscription has been ended${note ? ` (${note})` : ""}. Your progress is kept; you can subscribe again at any time. Questions? Contact support@nexitafrica.com.`,
      cta: { label: "View billing", path: "/dashboard/training" },
    }).catch(() => {});
  }
  return { ok: true };
}

/**
 * Daily: remind before expiry and tell people when it has expired.
 * Each reminder is sent once per expiry date (tracked in subscription_reminder).
 */
export async function runSubscriptionReminders(admin, settings = {}, { dryRun = false } = {}) {
  const now = Date.now();
  const from = new Date(now - 2 * DAY).toISOString();
  const to = new Date(now + 8 * DAY).toISOString();
  const { data: rows } = await admin.from("candidates")
    .select("id, subscription_until, subscription_reminder, subscription_cancelled_at")
    .gte("subscription_until", from).lte("subscription_until", to).limit(2000);
  const price = settings.subscription_annual_amount != null ? formatNaira(settings.subscription_annual_amount) : null;
  const out = { checked: rows?.length || 0, sent: [] };
  for (const r of rows || []) {
    if (r.subscription_cancelled_at) continue; // ended by an admin — no renewal nags
    const t = new Date(r.subscription_until).getTime();
    const left = t - now;
    const dateKey = r.subscription_until.slice(0, 10);
    let stage = null;
    if (left <= 0) stage = "expired";
    else if (left <= 1.5 * DAY) stage = "1d";
    else if (left <= 7 * DAY) stage = "7d";
    if (!stage) continue;
    const key = `${stage}:${dateKey}`;
    const order = { "7d": 1, "1d": 2, expired: 3 };
    const prev = (r.subscription_reminder || "").split(":");
    if (prev[1] === dateKey && order[prev[0]] >= order[stage]) continue; // already sent this (or a later) one
    out.sent.push({ candidateId: r.id, stage });
    if (dryRun) continue;
    const p = await profileOf(admin, r.id);
    const when = fmtDate(r.subscription_until);
    const body = stage === "expired"
      ? `Your NexIT-Africa subscription expired on ${when}. Renew to keep unlimited AI interview retakes, suggested training and extra roles${price ? ` (${price} / year)` : ""}.`
      : `Your NexIT-Africa subscription expires ${stage === "1d" ? "tomorrow" : "in 7 days"}, on ${when}. Renew to keep unlimited AI interview retakes, suggested training and extra roles${price ? ` (${price} / year)` : ""}.`;
    await notifyUser(admin, {
      userId: r.id, email: p.email, name: p.full_name,
      title: stage === "expired" ? "Your subscription has expired" : "Your subscription is ending soon",
      body,
      cta: { label: "Renew subscription", path: "/dashboard/training" },
    }).catch(() => {});
    await admin.from("candidates").update({ subscription_reminder: key }).eq("id", r.id);
    await admin.from("subscription_events").insert({
      candidate_id: r.id, action: stage === "expired" ? "expired" : "reminded", source: "system",
      until_before: r.subscription_until, until_after: r.subscription_until, note: stage,
    });
  }
  return out;
}

const monthKey = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

/** Revenue numbers for the dashboard. Only successful, non-zero payments count. */
export async function revenueSummary(admin, { months = 12 } = {}) {
  const { data: pays } = await admin.from("candidate_payments")
    .select("amount, purpose, provider, paid_at, created_at, status")
    .eq("status", "success").limit(20000);
  const now = new Date();
  const thisMonth = monthKey(now);
  const since30 = now.getTime() - 30 * DAY;
  const series = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    series.push({ key: monthKey(d), label: d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }), amount: 0, count: 0 });
  }
  const byKey = Object.fromEntries(series.map((s) => [s.key, s]));
  const t = { total: 0, month: 0, last30: 0, count: 0, byPurpose: { subscription: 0, training: 0 }, byProvider: { paystack: 0, manual: 0, complimentary: 0 }, complimentaryCount: 0 };
  for (const p of pays || []) {
    const amt = Number(p.amount) || 0;
    const at = new Date(p.paid_at || p.created_at);
    if (p.provider === "complimentary") t.complimentaryCount++;
    t.byProvider[p.provider] = (t.byProvider[p.provider] || 0) + amt;
    if (amt <= 0) continue;
    t.total += amt; t.count++;
    t.byPurpose[p.purpose] = (t.byPurpose[p.purpose] || 0) + amt;
    if (monthKey(at) === thisMonth) t.month += amt;
    if (at.getTime() >= since30) t.last30 += amt;
    const s = byKey[monthKey(at)];
    if (s) { s.amount += amt; s.count++; }
  }

  const nowIso = now.toISOString();
  const soonIso = new Date(now.getTime() + 30 * DAY).toISOString();
  const [{ count: active }, { count: expiring }, { count: expired }] = await Promise.all([
    admin.from("candidates").select("id", { count: "exact", head: true }).gt("subscription_until", nowIso),
    admin.from("candidates").select("id", { count: "exact", head: true }).gt("subscription_until", nowIso).lte("subscription_until", soonIso),
    admin.from("candidates").select("id", { count: "exact", head: true }).lte("subscription_until", nowIso),
  ]);
  const { count: pending } = await admin.from("candidate_payments").select("id", { count: "exact", head: true }).eq("status", "pending");
  return { ...t, series, subscribers: { active: active || 0, expiring: expiring || 0, expired: expired || 0 }, pending: pending || 0 };
}
