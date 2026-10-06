import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { generateSecret, otpauthUrl, verifyTotp } from "@/lib/totp";

export const runtime = "nodejs";

// GET /api/2fa — current 2FA status for the signed-in user.
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json({ enabled: !!me.totp_enabled });
}

// POST /api/2fa { action, code }
//   action "setup"   → create (or reuse) a pending secret, return QR + otpauth.
//   action "enable"  → verify `code` against the pending secret, turn 2FA on.
//   action "disable" → verify `code`, turn 2FA off and delete the secret.
//   action "verify"  → verify `code` at login time (2FA already enabled).
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const action = body?.action;
  const code = body?.code;

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const getSecret = async () => {
    const { data } = await admin.from("user_totp").select("secret").eq("user_id", me.id).maybeSingle();
    return data?.secret || null;
  };

  if (action === "setup") {
    if (me.totp_enabled) return NextResponse.json({ error: "2FA is already enabled." }, { status: 400 });
    let secret = await getSecret();
    if (!secret) {
      secret = generateSecret();
      const { error } = await admin.from("user_totp").upsert({ user_id: me.id, secret }, { onConflict: "user_id" });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const url = otpauthUrl({ secret, label: me.email || me.authEmail || "account" });
    let qr = null;
    try { qr = await QRCode.toDataURL(url, { margin: 1, width: 220 }); } catch { /* fall back to manual entry */ }
    return NextResponse.json({ otpauthUrl: url, qr, secret });
  }

  if (action === "enable") {
    const secret = await getSecret();
    if (!secret) return NextResponse.json({ error: "Start setup first." }, { status: 400 });
    if (!verifyTotp(secret, code)) return NextResponse.json({ error: "That code didn't match. Try again." }, { status: 400 });
    const { error } = await admin.from("profiles").update({ totp_enabled: true }).eq("id", me.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, enabled: true });
  }

  if (action === "disable") {
    if (!me.totp_enabled) return NextResponse.json({ ok: true, enabled: false });
    const secret = await getSecret();
    if (!secret || !verifyTotp(secret, code)) return NextResponse.json({ error: "Enter a valid current code to turn 2FA off." }, { status: 400 });
    await admin.from("profiles").update({ totp_enabled: false }).eq("id", me.id);
    await admin.from("user_totp").delete().eq("user_id", me.id);
    return NextResponse.json({ ok: true, enabled: false });
  }

  if (action === "verify") {
    if (!me.totp_enabled) return NextResponse.json({ ok: true }); // nothing to verify
    const secret = await getSecret();
    if (!secret || !verifyTotp(secret, code)) return NextResponse.json({ error: "Invalid authentication code." }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
