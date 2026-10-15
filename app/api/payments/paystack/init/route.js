import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadSettings } from "@/lib/db";
import { paystackInit, newReference } from "@/lib/paystack";
import { paymentsStatus } from "@/lib/payments";
import { COMPANY } from "@/lib/company";

export const runtime = "nodejs";

// POST /api/payments/paystack/init  { purpose: "subscription"|"training", roleKey? }
// Creates a pending candidate payment and returns a Paystack authorization URL.
// When online payments are switched off (or Paystack isn't connected) it
// returns { unavailable: true } and the app shows "available soon" + WhatsApp.
const soon = () => NextResponse.json({
  unavailable: true,
  error: `Online payment will be available soon. For details on payment, reach out to us on WhatsApp: ${COMPANY.whatsapp}.`,
}, { status: 503 });

export async function POST(request) {
  const admin0 = getServiceSupabase();
  if (!admin0) return soon();
  const st0 = paymentsStatus(await loadSettings(admin0));
  if (!st0.subscription) return soon();

  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const purpose = body?.purpose;
  const roleKey = body?.roleKey || null;
  if (!["subscription", "training"].includes(purpose)) {
    return NextResponse.json({ error: "purpose must be 'subscription' or 'training'" }, { status: 400 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const settings = await loadSettings(admin);
  const tier = body?.tier === "foundational" ? "foundational" : "intensive";
  let amount = Number(settings.subscription_annual_amount);
  if (purpose === "training" && !paymentsStatus(settings).training) return soon();
  if (purpose === "training") {
    if (!roleKey) return NextResponse.json({ error: "roleKey is required for training" }, { status: 400 });
    const { data: role } = await admin.from("role_requirements").select("training_amount, foundational_amount, title, enabled").eq("role_key", roleKey).maybeSingle();
    if (!role) return NextResponse.json({ error: "Unknown role" }, { status: 400 });
    if (tier === "foundational") {
      amount = role.foundational_amount != null ? Number(role.foundational_amount) : Number(settings.training_foundational_amount);
    } else {
      amount = role.training_amount != null ? Number(role.training_amount) : Number(settings.training_default_amount);
    }
  }

  const reference = newReference(purpose === "subscription" ? "sub" : "trn");
  const origin = request.nextUrl?.origin || process.env.NEXT_PUBLIC_SITE_URL || "";
  const callbackUrl = `${origin}/dashboard/billing/callback`;

  // Record the pending payment first (so verify can trust it).
  const { error: insErr } = await admin.from("candidate_payments").insert({
    candidate_id: me.id,
    purpose,
    role_key: roleKey,
    amount,
    currency: settings.currency || "NGN",
    reference,
    status: "pending",
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  const init = await paystackInit({
    email: me.email || me.authEmail,
    amountNaira: amount,
    reference,
    callbackUrl,
    metadata: { candidateId: me.id, purpose, roleKey },
  });
  if (init.unavailable) { await admin.from("candidate_payments").delete().eq("reference", reference); return soon(); }
  if (init.error) return NextResponse.json({ error: init.error }, { status: 502 });

  return NextResponse.json({
    ok: true,
    authorizationUrl: init.authorization_url,
    reference: init.reference,
    amount,
    currency: settings.currency || "NGN",
  });
}
