import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadSettings, DEFAULT_SETTINGS } from "@/lib/db";
import { paystackMode } from "@/lib/paystack";
import { maintenanceFromSettings } from "@/lib/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/settings — public, non-sensitive config the candidate UI needs:
// pass marks, pricing, enabled roles. Falls back to defaults in demo mode.
export async function GET() {
  const admin = getServiceSupabase();
  if (!admin) {
    return NextResponse.json({
      settings: toClient(DEFAULT_SETTINGS),
      roles: [],
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || null,
      paystackMode: paystackMode(),
    });
  }

  const s = await loadSettings(admin);
  let roles = [];
  try {
    const { data } = await admin.from("role_requirements").select("*").order("title", { ascending: true });
    roles = (data || []).map((r) => ({
      roleKey: r.role_key,
      title: r.title,
      enabled: r.enabled !== false,
      trainingAmount: r.training_amount != null ? Number(r.training_amount) : null,
      foundationalAmount: r.foundational_amount != null ? Number(r.foundational_amount) : null,
    }));
  } catch { /* pre-0009 schema */ }

  return NextResponse.json({
    settings: toClient(s),
    roles,
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || null,
    paystackMode: paystackMode(),
  });
}

function toClient(s) {
  return {
    passMarkAi: Number(s.pass_mark_ai ?? 85),
    aiFoundationalMark: Number(s.ai_foundational_mark ?? 60),
    passMarkProfessional: Number(s.pass_mark_professional ?? 70),
    passMarkHr: Number(s.pass_mark_hr ?? 70),
    currency: s.currency || "NGN",
    subscriptionAnnualAmount: Number(s.subscription_annual_amount ?? 29999),
    trainingDefaultAmount: Number(s.training_default_amount ?? 450000),
    trainingFoundationalAmount: Number(s.training_foundational_amount ?? 150000),
    placementFeeAmount: Number(s.placement_fee_amount ?? 0),
    freeAiRetakes: Number(s.free_ai_retakes ?? 1),
    aiResultRequiresApproval: !!s.ai_result_requires_approval,
    oauthGoogleEnabled: !!s.oauth_google_enabled,
    oauthAppleEnabled: !!s.oauth_apple_enabled,
    maintenance: maintenanceFromSettings(s),
  };
}
