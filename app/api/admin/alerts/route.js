import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { sendEmail, emailEnabled } from "@/lib/email";
import { loadSettings } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const canManage = (a) => a?.role === "admin" && (a.superAdmin || a.permissions.includes("settings"));

// GET /api/admin/alerts — the 25 most recent alert emails (sent or failed).
export async function GET() {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const { data } = await admin.from("admin_alerts").select("category, subject, sent, error, created_at").order("created_at", { ascending: false }).limit(25);
  return NextResponse.json({ alerts: data || [], emailConfigured: emailEnabled() });
}

// POST /api/admin/alerts — send a test email to the configured inbox.
export async function POST() {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  if (!emailEnabled()) return NextResponse.json({ error: "Email isn't configured on the server. Set RESEND_API_KEY and EMAIL_FROM, then redeploy." }, { status: 400 });
  const s = await loadSettings(admin);
  const to = s.admin_alert_email || "support@nexitafrica.com";
  const r = await sendEmail({
    to,
    subject: "[NexIT] Test alert",
    heading: "Admin alerts are working",
    paragraphs: ["This is a test from NexIT-Africa. Activity alerts (sign-ups, CV uploads, bookings, results, payments, training and jobs) will arrive at this address."],
  });
  if (!r.sent) return NextResponse.json({ error: `Couldn't send: ${r.reason || "unknown error"}` }, { status: 502 });
  return NextResponse.json({ ok: true, to });
}
