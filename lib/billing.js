"use client";

// Client helpers for pricing display + starting a Paystack checkout.

export function formatMoney(amount, currency = "NGN") {
  const n = Number(amount) || 0;
  const sym = currency === "NGN" ? "₦" : "";
  return `${sym}${n.toLocaleString()}`;
}

// A Google Calendar "add event" URL (client-safe; no server deps).
export function googleCalendarAddUrl({ summary, details, startISO, endISO }) {
  const fmt = (iso) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary || "Interview",
    details: details || "",
    dates: `${fmt(startISO)}/${fmt(endISO)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// On return from Paystack, /dashboard/billing/callback verifies and applies the effect.
// Starts a Paystack payment. When online payments aren't available, opens the
// "Payment available soon" notice (components/PaymentSoon.js) instead and
// returns { unavailable: true }. Returns { ok } on redirect or { error }.
export async function startPayment({ purpose, roleKey, tier }) {
  const soon = () => {
    try { window.dispatchEvent(new CustomEvent("nexit:payment-soon", { detail: { purpose } })); } catch { /* ignore */ }
    return { unavailable: true };
  };
  try {
    const res = await fetch("/api/payments/paystack/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose, roleKey, tier }),
    });
    const data = await res.json().catch(() => ({}));
    if (data?.unavailable) return soon();
    if (!res.ok || !data.authorizationUrl) return { error: data.error || "Couldn't start payment" };
    // Remember where to send the user back after verifying.
    try { sessionStorage.setItem("nexit.returnTo", window.location.pathname); } catch {}
    window.location.href = data.authorizationUrl;
    return { ok: true };
  } catch (e) {
    return soon();
  }
}
