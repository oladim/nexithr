import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadSettings } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/auth/autoconfirm { userId }
// Only when an admin has switched "Require email verification" OFF: confirms
// an account created in the last 10 minutes so the new user can sign in
// straight away. Does nothing otherwise.
export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const userId = typeof body?.userId === "string" ? body.userId : "";
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return NextResponse.json({ error: "Invalid user" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ confirmed: false });
  const s = await loadSettings(admin);
  if (s.require_email_verification !== false) return NextResponse.json({ confirmed: false, reason: "verification-required" });

  const { data, error } = await admin.auth.admin.getUserById(userId);
  const u = data?.user;
  if (error || !u) return NextResponse.json({ confirmed: false });
  if (u.email_confirmed_at) return NextResponse.json({ confirmed: true });
  if (Date.now() - new Date(u.created_at).getTime() > 10 * 60 * 1000) return NextResponse.json({ confirmed: false, reason: "too-old" });

  const { error: uErr } = await admin.auth.admin.updateUserById(userId, { email_confirm: true });
  if (uErr) return NextResponse.json({ confirmed: false });
  return NextResponse.json({ confirmed: true });
}
