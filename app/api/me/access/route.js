import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadCandidateAccess } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/me/access — the signed-in candidate's subscription + training access
// + last AI attempt time (for the retake cooldown). Safe defaults otherwise.
export async function GET() {
  const me = await getSessionProfile();
  if (!me) {
    return NextResponse.json({ subscribed: false, subscriptionUntil: null, lastAiAttemptAt: null, trainingRoles: [] });
  }
  const admin = getServiceSupabase();
  if (!admin) {
    return NextResponse.json({ subscribed: false, subscriptionUntil: null, lastAiAttemptAt: null, trainingRoles: [] });
  }
  const access = await loadCandidateAccess(admin, me.id);
  return NextResponse.json(access);
}
