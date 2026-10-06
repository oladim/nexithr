import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadSettings, DEFAULT_SPOTLIGHTS } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/landing/spotlights — public. The hero's scrolling spotlights
// (enabled, ordered, limited by the admin "how many" setting). Falls back to
// the bundled defaults in demo mode or before any are created.
export async function GET() {
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ spotlights: DEFAULT_SPOTLIGHTS });

  try {
    const s = await loadSettings(admin);
    const count = Number(s.landing_spotlight_count ?? 6);
    let q = admin
      .from("landing_spotlights")
      .select("id, quote, name, role, image_url, sort")
      .eq("enabled", true)
      .order("sort", { ascending: true });
    if (count > 0) q = q.limit(count);
    const { data } = await q;
    const rows = (data && data.length) ? data : DEFAULT_SPOTLIGHTS.slice(0, count > 0 ? count : undefined);
    return NextResponse.json({ spotlights: rows });
  } catch {
    return NextResponse.json({ spotlights: DEFAULT_SPOTLIGHTS });
  }
}
