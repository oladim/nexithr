/**
 * Paystack Transfers — SERVER ONLY. Pays interviewers out of the NexIT
 * Paystack balance.
 *
 * Needs PAYSTACK_SECRET_KEY and Transfers enabled on the Paystack account
 * (Settings → Preferences → Transfers). Turn OFF "Confirm transfers with OTP"
 * there, otherwise every transfer waits for an OTP and is left "processing".
 *
 * Without a key, transfers aren't attempted: approved payouts wait for an
 * admin to pay by bank and mark them as paid.
 */
import crypto from "crypto";

const BASE = "https://api.paystack.co";
const key = () => process.env.PAYSTACK_SECRET_KEY?.trim() || "";
export const transfersEnabled = () => Boolean(key());

async function call(path, { method = "GET", body } = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.status) return { error: data?.message || `Paystack ${res.status}` };
    return { data: data.data, meta: data.meta };
  } catch (e) {
    return { error: e.message };
  }
}

// A small fallback list for demo / unconfigured mode.
const FALLBACK_BANKS = [
  { name: "Access Bank", code: "044" }, { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" }, { name: "Guaranty Trust Bank", code: "058" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Stanbic IBTC Bank", code: "221" }, { name: "Sterling Bank", code: "232" },
  { name: "United Bank For Africa", code: "033" }, { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

let bankCache = { at: 0, list: null };
export async function listBanks() {
  if (!transfersEnabled()) return { banks: FALLBACK_BANKS, live: false };
  if (bankCache.list && Date.now() - bankCache.at < 12 * 3600 * 1000) return { banks: bankCache.list, live: true };
  const out = [];
  let cursor = "";
  for (let i = 0; i < 6; i++) {
    const r = await call(`/bank?country=nigeria&currency=NGN&use_cursor=true&perPage=100${cursor ? `&next=${encodeURIComponent(cursor)}` : ""}`);
    if (r.error) break;
    for (const b of r.data || []) if (b.active !== false && b.code) out.push({ name: b.name, code: b.code });
    cursor = r.meta?.next || "";
    if (!cursor) break;
  }
  if (!out.length) return { banks: FALLBACK_BANKS, live: false };
  const seen = new Set();
  const list = out.filter((b) => (seen.has(b.code) ? false : seen.add(b.code))).sort((a, b) => a.name.localeCompare(b.name));
  bankCache = { at: Date.now(), list };
  return { banks: list, live: true };
}

// Account number + bank → account holder's name.
export async function resolveAccount(accountNumber, bankCode) {
  if (!transfersEnabled()) return { accountName: null, unverified: true };
  const r = await call(`/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`);
  if (r.error) return { error: "We couldn't verify that account. Check the account number and bank." };
  return { accountName: r.data?.account_name || null };
}

export async function createRecipient({ name, accountNumber, bankCode }) {
  const r = await call("/transferrecipient", {
    method: "POST",
    body: { type: "nuban", name, account_number: accountNumber, bank_code: bankCode, currency: "NGN" },
  });
  if (r.error) return { error: r.error };
  return { recipientCode: r.data?.recipient_code };
}

// Returns { status: "success"|"pending"|"otp"|"failed"|..., transferCode } or { error }.
export async function initiateTransfer({ amountNaira, recipientCode, reference, reason }) {
  const r = await call("/transfer", {
    method: "POST",
    body: { source: "balance", amount: Math.round(Number(amountNaira) * 100), recipient: recipientCode, reference, reason, currency: "NGN" },
  });
  if (r.error) return { error: r.error };
  return { status: r.data?.status, transferCode: r.data?.transfer_code };
}

export async function verifyTransfer(reference) {
  const r = await call(`/transfer/verify/${encodeURIComponent(reference)}`);
  if (r.error) return { error: r.error };
  return { status: r.data?.status, transferCode: r.data?.transfer_code, reason: r.data?.reason || r.data?.failures || null };
}

// x-paystack-signature = HMAC-SHA512(rawBody, secret key)
export function validWebhookSignature(rawBody, signature) {
  if (!key() || !signature) return false;
  const hash = crypto.createHmac("sha512", key()).update(rawBody).digest("hex");
  const a = Buffer.from(hash); const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
