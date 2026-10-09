// Server-only: email the NexIT team inbox about important activity.
// Pass a SERVICE-ROLE client. Never throws; returns { sent, skipped, reason }.
import { sendEmail } from "@/lib/email";
import { loadSettings } from "@/lib/db";
import { abs } from "@/lib/notify";

import { ALERT_CATEGORIES } from "@/lib/alertCategories";
export { ALERT_CATEGORIES };

const FALLBACK = process.env.ADMIN_ALERT_EMAIL || "support@nexitafrica.com";

/**
 * alertAdmins(admin, {
 *   key,        // unique event id — the same key never emails twice
 *   category,   // one of ALERT_CATEGORIES
 *   subject,    // email subject (prefixed with [NexIT])
 *   summary,    // one-line description
 *   details,    // [[label, value], …] shown as a list
 *   cta,        // { label, path } — usually an admin page
 * })
 */
export async function alertAdmins(admin, { key, category, subject, summary, details = [], cta } = {}) {
  if (!admin || !subject) return { sent: false, skipped: true, reason: "no-client" };
  try {
    const settings = await loadSettings(admin);
    if (settings.admin_alerts_enabled === false) return { sent: false, skipped: true, reason: "disabled" };
    const cats = Array.isArray(settings.admin_alert_categories) ? settings.admin_alert_categories : null;
    if (cats && category && !cats.includes(category)) return { sent: false, skipped: true, reason: "category-off" };
    const to = (settings.admin_alert_email || FALLBACK).trim();

    // De-duplicate (and log) by event key.
    if (key) {
      const { data: row, error } = await admin.from("admin_alerts")
        .insert({ event_key: key, category: category || "other", subject })
        .select("event_key").maybeSingle();
      if (error && /duplicate key|already exists/i.test(error.message || "")) return { sent: false, skipped: true, reason: "duplicate" };
      if (!row && !error) return { sent: false, skipped: true, reason: "duplicate" };
      // If the log table is missing (migration not run) we still send.
    }

    const lines = details.filter(([, v]) => v != null && v !== "").map(([k, v]) => `${k}: ${v}`);
    const res = await sendEmail({
      to,
      subject: `[NexIT] ${subject}`,
      heading: subject,
      paragraphs: [summary, lines.join("\n"), `Logged ${new Date().toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })} (Lagos time).`].filter(Boolean),
      cta: cta ? { label: cta.label || "Open admin", url: abs(cta.path || "/admin") } : undefined,
    });
    if (key) await admin.from("admin_alerts").update({ sent: !!res.sent, error: res.sent ? null : (res.reason || null) }).eq("event_key", key);
    return { sent: !!res.sent, reason: res.reason };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}
