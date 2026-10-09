import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadSettings } from "@/lib/db";
import { maintenanceFromSettings, maintenanceStatus } from "@/lib/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/maintenance — public maintenance state polled by every portal.
export async function GET() {
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ maintenance: { enabled: false }, status: "off" });
  const m = maintenanceFromSettings(await loadSettings(admin));
  return NextResponse.json({ maintenance: m, status: maintenanceStatus(m), now: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } });
}
