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

// Start a payment: asks the server to initialize, then redirects the browser to
// the Paystack authorization URL (or, in mock mode, to our own callback). On
// return, /dashboard/billing/callback verifies and applies the effect.
// Returns { error } if it couldn't start.
export async function startPayment({ purpose, roleKey, tier }) {
  try {
    const res = await fetch("/api/payments/paystack/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose, roleKey, tier }),
    });
    const data = await res.json();
    if (!res.ok || !data.authorizationUrl) return { error: data.error || "Couldn't start payment" };
    // Remember where to send the user back after verifying.
    try { sessionStorage.setItem("nexit.returnTo", window.location.pathname); } catch {}
    window.location.href = data.authorizationUrl;
    return { ok: true };
  } catch (e) {
    return { error: e.message };
  }
}
