import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadSettings } from "@/lib/db";
import { notifyUser } from "@/lib/notify";
import { fmtWhen, SERVER_TZ } from "@/lib/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET|POST /api/cron/interview-reminders  (Authorization: Bearer CRON_SECRET)
// Run hourly by the Netlify scheduled function in netlify/functions/.
// Emails + notifies the candidate and the assigned interviewer once, when an
// interview starts within the admin-set window (default 24 hours).
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
  if (s.interview_reminders_enabled === false) return NextResponse.json({ ok: true, skipped: "disabled" });

  const hours = Math.max(1, Number(s.interview_reminder_hours ?? 24));
  const now = new Date();
  const until = new Date(now.getTime() + hours * 3600 * 1000);
  const { data: due, error } = await admin.from("interviews")
    .select("id, candidate_id, interviewer_id, type, mode, role, start_at, meet_link")
    .eq("status", "Confirmed").is("reminder_sent_at", null)
    .gte("start_at", now.toISOString()).lte("start_at", until.toISOString())
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const iv of due || []) {
    // Claim the row first so overlapping runs never double-send.
    const { data: claimed } = await admin.from("interviews")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", iv.id).is("reminder_sent_at", null).select("id");
    if (!claimed?.length) continue;

    const when = fmtWhen(iv.start_at, SERVER_TZ);
    const where = iv.meet_link ? ` Join here: ${iv.meet_link}` : "";
    await notifyUser(admin, {
      userId: iv.candidate_id,
      title: `Reminder: your ${iv.type} interview is coming up`,
      body: `Your ${iv.type} interview${iv.role ? ` for ${iv.role}` : ""} is on ${when}.${where} Please join on time from a quiet place with a working camera and microphone.`,
      cta: iv.meet_link ? { label: "Join the interview", url: iv.meet_link } : { label: "View my interviews", path: "/dashboard/interview" },
    });
    if (iv.interviewer_id) {
      await notifyUser(admin, {
        userId: iv.interviewer_id,
        title: `Reminder: ${iv.type} interview on ${when}`,
        body: `You're assigned to a ${iv.type} interview${iv.role ? ` (${iv.role})` : ""} on ${when}.${where}`,
        cta: { label: "Open my interviews", path: "/interviewer/interview" },
      });
    }
    sent++;
  }
  return NextResponse.json({ ok: true, checked: (due || []).length, sent, windowHours: hours });
}

export const GET = run;
export const POST = run;
