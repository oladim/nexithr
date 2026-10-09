import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { PRIVACY_VERSION } from "@/lib/policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/me/consent — has the signed-in user accepted the CURRENT Privacy
// Policy? People who ticked the box at sign-up are recorded from their signup
// metadata the first time this is checked.
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const admin = getServiceSupabase();
  let version = me.privacy_accepted_version || null;
  let at = me.privacy_accepted_at || null;

  if (!version && admin) {
    try {
      const { data } = await admin.auth.admin.getUserById(me.id);
      const meta = data?.user?.user_metadata || {};
      if (meta.privacy_accepted_version) {
        version = String(meta.privacy_accepted_version);
        at = data.user.created_at || new Date().toISOString();
        await admin.from("profiles").update({ privacy_accepted_version: version, privacy_accepted_at: at }).eq("id", me.id);
      }
    } catch { /* column or admin API unavailable — treat as not accepted */ }
  }
  return NextResponse.json({ currentVersion: PRIVACY_VERSION, acceptedVersion: version, acceptedAt: at, accepted: version === PRIVACY_VERSION });
}

// POST /api/me/consent — record acceptance of the current policy version.
export async function POST() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const at = new Date().toISOString();
  const { error } = await admin.from("profiles").update({ privacy_accepted_version: PRIVACY_VERSION, privacy_accepted_at: at }).eq("id", me.id);
  if (error) return NextResponse.json({ error: /column/i.test(error.message) ? "Run the 0026_privacy_consent.sql migration first." : error.message }, { status: 500 });
  return NextResponse.json({ ok: true, accepted: true, acceptedVersion: PRIVACY_VERSION, acceptedAt: at });
}
