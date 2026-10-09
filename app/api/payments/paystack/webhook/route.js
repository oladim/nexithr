import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { validWebhookSignature } from "@/lib/paystackTransfers";
import { settleByReference } from "@/lib/payouts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/payments/paystack/webhook — set this URL in Paystack →
// Settings → API Keys & Webhooks. Signed with the secret key; anything
// unsigned is ignored. Handles transfer results for interviewer payouts.
export async function POST(request) {
  const raw = await request.text();
  if (!validWebhookSignature(raw, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let evt;
  try { evt = JSON.parse(raw); } catch { return NextResponse.json({ ok: true }); }
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ ok: true });

  const ref = evt?.data?.reference;
  if (ref && String(ref).startsWith("payout_")) {
    if (evt.event === "transfer.success") await settleByReference(admin, ref, "success");
    if (evt.event === "transfer.failed") await settleByReference(admin, ref, "failed", evt.data?.reason || evt.data?.gateway_response || null);
    if (evt.event === "transfer.reversed") await settleByReference(admin, ref, "reversed", "The transfer was reversed by the bank.");
  }
  return NextResponse.json({ ok: true });
}
