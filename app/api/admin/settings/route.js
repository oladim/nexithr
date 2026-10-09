import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadSettings, saveSettings } from "@/lib/db";
import { ALERT_CATEGORIES } from "@/lib/adminAlert";
import { maintenanceStatus, maintenanceFromSettings, fmtWindow, fmtWhen, SERVER_TZ } from "@/lib/maintenance";

const ALERT_KEYS = ALERT_CATEGORIES.map((c) => c.key);

export const runtime = "nodejs";

// GET /api/admin/settings — current settings (admins only).
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const settings = await loadSettings(admin);
  return NextResponse.json({ settings });
}

const clampPct = (v, d) => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return d;
  return Math.max(0, Math.min(100, n));
};
const money = (v, d) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : d;
};

// POST /api/admin/settings — update pass marks + pricing (admins only).
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const cur = await loadSettings(admin);
  const fields = {
    pass_mark_ai: clampPct(body.pass_mark_ai, cur.pass_mark_ai),
    ai_foundational_mark: clampPct(body.ai_foundational_mark, cur.ai_foundational_mark),
    pass_mark_professional: clampPct(body.pass_mark_professional, cur.pass_mark_professional),
    pass_mark_hr: clampPct(body.pass_mark_hr, cur.pass_mark_hr),
    subscription_annual_amount: money(body.subscription_annual_amount, cur.subscription_annual_amount),
    training_default_amount: money(body.training_default_amount, cur.training_default_amount),
    training_foundational_amount: money(body.training_foundational_amount, cur.training_foundational_amount),
    placement_fee_amount: money(body.placement_fee_amount, cur.placement_fee_amount),
    free_ai_retakes: Number.isFinite(Number(body.free_ai_retakes)) ? Math.max(0, Math.round(Number(body.free_ai_retakes))) : cur.free_ai_retakes,
    ai_result_requires_approval: typeof body.ai_result_requires_approval === "boolean" ? body.ai_result_requires_approval : cur.ai_result_requires_approval,
    oauth_google_enabled: typeof body.oauth_google_enabled === "boolean" ? body.oauth_google_enabled : cur.oauth_google_enabled,
    oauth_apple_enabled: typeof body.oauth_apple_enabled === "boolean" ? body.oauth_apple_enabled : cur.oauth_apple_enabled,
    currency: typeof body.currency === "string" && body.currency.trim() ? body.currency.trim() : cur.currency,
    admin_alerts_enabled: typeof body.admin_alerts_enabled === "boolean" ? body.admin_alerts_enabled : cur.admin_alerts_enabled,
    admin_alert_email: typeof body.admin_alert_email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.admin_alert_email.trim()) ? body.admin_alert_email.trim().toLowerCase() : cur.admin_alert_email,
    admin_alert_categories: Array.isArray(body.admin_alert_categories) ? body.admin_alert_categories.filter((c) => ALERT_KEYS.includes(c)) : cur.admin_alert_categories,
    updated_by: me.id,
  };

  // ---- platform switches (0028) ----
  const bool = (k) => (typeof body[k] === "boolean" ? body[k] : cur[k]);
  const int = (k, lo, hi) => {
    const n = Math.round(Number(body[k]));
    return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : cur[k];
  };
  const text = (k, max = 400) => (typeof body[k] === "string" ? body[k].trim().slice(0, max) : (cur[k] || ""));
  Object.assign(fields, {
    signups_enabled: bool("signups_enabled"),
    signups_closed_message: text("signups_closed_message"),
    require_email_verification: bool("require_email_verification"),
    ai_interview_enabled: bool("ai_interview_enabled"),
    ai_interview_paused_message: text("ai_interview_paused_message"),
    ai_retake_cooldown_enabled: bool("ai_retake_cooldown_enabled"),
    ai_retake_cooldown_days: int("ai_retake_cooldown_days", 1, 365),
    interview_reminders_enabled: bool("interview_reminders_enabled"),
    interview_reminder_hours: int("interview_reminder_hours", 1, 168),
    training_payments_enabled: bool("training_payments_enabled"),
    interviewer_payouts_enabled: bool("interviewer_payouts_enabled"),
    payout_manual_approval: bool("payout_manual_approval"),
    interviewer_fee_professional: money(body.interviewer_fee_professional, cur.interviewer_fee_professional),
    interviewer_fee_hr: money(body.interviewer_fee_hr, cur.interviewer_fee_hr),
    payout_min_amount: money(body.payout_min_amount, cur.payout_min_amount),
  });

  // ---- maintenance ----
  const iso = (v, d) => {
    if (v === null || v === "") return null;
    if (typeof v !== "string") return d;
    const t = new Date(v);
    return Number.isNaN(t.getTime()) ? d : t.toISOString();
  };
  fields.maintenance_enabled = typeof body.maintenance_enabled === "boolean" ? body.maintenance_enabled : !!cur.maintenance_enabled;
  fields.maintenance_start = body.maintenance_start !== undefined ? iso(body.maintenance_start, cur.maintenance_start) : cur.maintenance_start;
  fields.maintenance_end = body.maintenance_end !== undefined ? iso(body.maintenance_end, cur.maintenance_end) : cur.maintenance_end;
  fields.maintenance_message = typeof body.maintenance_message === "string" ? body.maintenance_message.trim().slice(0, 600) : (cur.maintenance_message || "");
  if (fields.maintenance_start && fields.maintenance_end && new Date(fields.maintenance_end) <= new Date(fields.maintenance_start)) {
    return NextResponse.json({ error: "Maintenance end must be after the start." }, { status: 400 });
  }
  if (fields.maintenance_enabled && fields.maintenance_end && new Date(fields.maintenance_end) <= new Date()) {
    return NextResponse.json({ error: "The expected end time is already in the past." }, { status: 400 });
  }
  if (!fields.maintenance_enabled) { fields.maintenance_start = null; fields.maintenance_end = null; }

  const { error, skipped = [] } = await saveSettings(admin, fields);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const saved = { ...cur, ...fields };
  for (const k of skipped) saved[k] = cur[k];

  // Tell candidates, interviewers and employers when maintenance is
  // switched on, re-scheduled, or switched off.
  let notified = 0;
  if (!skipped.includes("maintenance_enabled")) {
    const before = maintenanceFromSettings(cur);
    const after = maintenanceFromSettings(saved);
    const changed = before.enabled !== after.enabled || (after.enabled && (before.start !== after.start || before.end !== after.end || before.message !== after.message));
    if (changed) notified = await notifyEveryone(admin, before, after);
  }

  return NextResponse.json({
    ok: true,
    settings: saved,
    notified,
    warning: skipped.length ? `Not saved (database is missing columns — run the latest migrations): ${skipped.join(", ")}` : null,
  });
}

// In-app notification to every non-admin account.
async function notifyEveryone(admin, before, after) {
  let title, body;
  const when = fmtWindow(after, SERVER_TZ);
  const st = maintenanceStatus(after);
  if (!after.enabled) {
    title = "Maintenance complete";
    body = "NexIT-Africa is back online. Thanks for your patience — you can pick up where you left off.";
  } else if (st === "scheduled") {
    title = before.enabled ? "Maintenance schedule updated" : "Scheduled maintenance";
    body = `NexIT-Africa will be unavailable ${when}. You won't be able to make changes in your portal during this time.${after.message ? " " + after.message : ""}`;
  } else {
    title = "Maintenance in progress";
    body = `NexIT-Africa is under maintenance${after.end ? ` until about ${fmtWhen(after.end, SERVER_TZ)}` : ""}. Your portal is paused until we're done.${after.message ? " " + after.message : ""}`;
  }
  let count = 0;
  try {
    const { data: users } = await admin.from("profiles").select("id").neq("role", "admin");
    const rows = (users || []).map((u) => ({ user_id: u.id, title, body }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await admin.from("notifications").insert(rows.slice(i, i + 500));
      if (!error) count += rows.slice(i, i + 500).length;
    }
  } catch { /* best effort */ }
  return count;
}
