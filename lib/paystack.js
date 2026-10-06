/**
 * Paystack helper — SERVER ONLY.
 *
 * Reads PAYSTACK_SECRET_KEY from the environment. When it's absent the app runs
 * in a "mock" mode: initialize returns a local callback URL and verify always
 * succeeds, so the whole payment flow is testable without real keys. Swap in
 * real keys (test or live) and it talks to Paystack for real — no code change.
 *
 * Amounts are handled in the main currency unit (Naira); Paystack wants the
 * subunit (kobo), so we multiply by 100 on the way out.
 */

const BASE = "https://api.paystack.co";

export function paystackEnabled() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

export function paystackMode() {
  return paystackEnabled() ? "live" : "mock";
}

// Initialize a transaction. Returns { authorization_url, reference, mock } or { error }.
export async function paystackInit({ email, amountNaira, reference, callbackUrl, metadata }) {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  const amount = Math.round(Number(amountNaira) * 100); // → kobo

  // Mock mode: no key configured. Hand back our own callback so the client can
  // "complete" the payment and the verify step will approve it.
  if (!key) {
    const url = `${callbackUrl}${callbackUrl.includes("?") ? "&" : "?"}reference=${encodeURIComponent(reference)}&mock=1`;
    return { authorization_url: url, reference, mock: true };
  }

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
      mock: false,
    };
  } catch (e) {
    return { error: e.message };
  }
}

// Verify a transaction. Returns { ok, status, amountNaira, raw } or { error }.
export async function paystackVerify(reference) {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();

  // Mock mode: treat any reference as paid.
  if (!key) return { ok: true, status: "success", mock: true };

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
      mock: false,
    };
  } catch (e) {
    return { error: e.message };
  }
}

// A unique-ish reference for a new transaction.
export function newReference(prefix = "nexit") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
