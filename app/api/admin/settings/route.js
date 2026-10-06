import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadSettings, saveSettings } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/admin/settings — current settings (admins only).
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const settings = await loadSettings(admin);
  return NextResponse.json({ settings });
}

const clampPct = (v, d) => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return d;
  return Math.max(0, Math.min(100, n));
};
const money = (v, d) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : d;
};

// POST /api/admin/settings — update pass marks + pricing (admins only).
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const cur = await loadSettings(admin);
  const fields = {
    pass_mark_ai: clampPct(body.pass_mark_ai, cur.pass_mark_ai),
    ai_foundational_mark: clampPct(body.ai_foundational_mark, cur.ai_foundational_mark),
    pass_mark_professional: clampPct(body.pass_mark_professional, cur.pass_mark_professional),
    pass_mark_hr: clampPct(body.pass_mark_hr, cur.pass_mark_hr),
    subscription_annual_amount: money(body.subscription_annual_amount, cur.subscription_annual_amount),
    training_default_amount: money(body.training_default_amount, cur.training_default_amount),
    training_foundational_amount: money(body.training_foundational_amount, cur.training_foundational_amount),
    placement_fee_amount: money(body.placement_fee_amount, cur.placement_fee_amount),
    free_ai_retakes: Number.isFinite(Number(body.free_ai_retakes)) ? Math.max(0, Math.round(Number(body.free_ai_retakes))) : cur.free_ai_retakes,
    ai_result_requires_approval: typeof body.ai_result_requires_approval === "boolean" ? body.ai_result_requires_approval : cur.ai_result_requires_approval,
    oauth_google_enabled: typeof body.oauth_google_enabled === "boolean" ? body.oauth_google_enabled : cur.oauth_google_enabled,
    oauth_apple_enabled: typeof body.oauth_apple_enabled === "boolean" ? body.oauth_apple_enabled : cur.oauth_apple_enabled,
    currency: typeof body.currency === "string" && body.currency.trim() ? body.currency.trim() : cur.currency,
    updated_by: me.id,
  };

  const { error } = await saveSettings(admin, fields);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, settings: { ...cur, ...fields } });
}
