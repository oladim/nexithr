import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { listBanks, resolveAccount } from "@/lib/paystackTransfers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/payouts/account — Nigerian banks for the account form.
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "interviewer") return NextResponse.json({ error: "Interviewers only" }, { status: 403 });
  return NextResponse.json(await listBanks());
}

// POST /api/payouts/account { bankCode, accountNumber, confirm? }
// Without `confirm`: looks up the account holder's name to show the user.
// With `confirm: true`: saves it (only after the name check passes).
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "interviewer") return NextResponse.json({ error: "Interviewers only" }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const accountNumber = String(body?.accountNumber || "").replace(/\D/g, "");
  const bankCode = String(body?.bankCode || "").trim();
  if (!/^\d{10}$/.test(accountNumber)) return NextResponse.json({ error: "Enter your 10-digit NUBAN account number." }, { status: 400 });
  const { banks } = await listBanks();
  const bank = banks.find((b) => b.code === bankCode);
  if (!bank) return NextResponse.json({ error: "Choose your bank." }, { status: 400 });

  const r = await resolveAccount(accountNumber, bankCode);
  if (r.error) return NextResponse.json({ error: r.error }, { status: 400 });
  // Unverified (no Paystack key): fall back to the name on the profile.
  const accountName = r.accountName || (body?.accountName || me.full_name || "").trim();
  if (!accountName) return NextResponse.json({ error: "Enter the account name." }, { status: 400 });
  if (!body?.confirm) return NextResponse.json({ accountName, verified: !r.unverified, bankName: bank.name });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  // A payout already on its way keeps the account it was requested with.
  const { error } = await admin.from("payout_accounts").upsert({
    interviewer_id: me.id, bank_code: bankCode, bank_name: bank.name,
    account_number: accountNumber, account_name: accountName,
    recipient_code: null, updated_at: new Date().toISOString(),
  }, { onConflict: "interviewer_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, account: { bank_name: bank.name, account_name: accountName, account_number_masked: `••••${accountNumber.slice(-4)}` } });
}
