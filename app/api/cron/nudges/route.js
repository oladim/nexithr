import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadSettings } from "@/lib/db";
import { runNudges } from "@/lib/reminders";
import { runSubscriptionReminders } from "@/lib/subscriptions";
import { purgeStorageTrash } from "@/lib/cvStore";
import { maintenanceStatus, maintenanceFromSettings } from "@/lib/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET|POST /api/cron/nudges  (Authorization: Bearer CRON_SECRET)
// Run daily by netlify/functions/nudges.mjs. Reminds candidates who have been
// sitting on a step they need to act on (upload a CV, take the AI interview,
// book an interview …). Timings come from Admin → Settings → Reminders.
// ?dry=1 reports who would be reminded without sending anything.
function authorized(request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const got = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got); const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function run(request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const s = await loadSettings(admin);
  if (maintenanceStatus(maintenanceFromSettings(s)) === "active") return NextResponse.json({ ok: true, skipped: "maintenance" });
  const dryRun = new URL(request.url).searchParams.get("dry") === "1";
  try {
    const r = await runNudges(admin, s, { dryRun });
    // Subscription expiry reminders (7 days, 1 day, expired).
    const subs = await runSubscriptionReminders(admin, s, { dryRun }).catch((e) => ({ error: e.message }));
    // Housekeeping: delete replaced CV files still queued for removal.
    const purged = dryRun ? 0 : await purgeStorageTrash(admin, 500).catch(() => 0);
    return NextResponse.json({ ok: true, dryRun, ...r, subscriptions: subs, purgedFiles: purged });
  } catch (e) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export const GET = run;
export const POST = run;
