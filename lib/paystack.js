/**
 * Paystack helper — SERVER ONLY.
 *
 * Reads PAYSTACK_SECRET_KEY from the environment. There is NO mock mode: without
 * a key no payment can start or be verified (candidates are told payments are
 * coming soon instead). Use Paystack test keys for testing.
 *
 * Amounts are handled in the main currency unit (Naira); Paystack wants the
 * subunit (kobo), so we multiply by 100 on the way out.
 */

const BASE = "https://api.paystack.co";

export function paystackEnabled() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

export function paystackMode() {
  return paystackEnabled() ? "live" : "off";
}

// Initialize a transaction. Returns { authorization_url, reference } or { error }.
export async function paystackInit({ email, amountNaira, reference, callbackUrl, metadata }) {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  const amount = Math.round(Number(amountNaira) * 100); // → kobo

  if (!key) return { error: "Payments aren't available yet." , unavailable: true };

  try {
    const res = await fetch(`${BASE}/transaction/initialize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, amount, reference, callback_url: callbackUrl, metadata, currency: "NGN" }),
    });
    const data = await res.json();
    if (!res.ok || !data?.status) return { error: data?.message || `Paystack ${res.status}` };
    return {
      authorization_url: data.data.authorization_url,
      reference: data.data.reference || reference,
      access_code: data.data.access_code,
    };
  } catch (e) {
    return { error: e.message };
  }
}

// Verify a transaction. Returns { ok, status, amountNaira, raw } or { error }.
export async function paystackVerify(reference) {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();

  if (!key) return { error: "Payments aren't available yet." };

  try {
    const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const data = await res.json();
    if (!res.ok || !data?.status) return { error: data?.message || `Paystack ${res.status}` };
    const d = data.data;
    return {
      ok: d.status === "success",
      status: d.status,
      amountNaira: typeof d.amount === "number" ? d.amount / 100 : null,
      raw: d,
    };
  } catch (e) {
    return { error: e.message };
  }
}

// A unique-ish reference for a new transaction.
export function newReference(prefix = "nexit") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
