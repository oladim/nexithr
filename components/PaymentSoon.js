"use client";

import { useEffect, useState } from "react";
import { COMPANY } from "@/lib/company";
import { IconX } from "@/components/Icons";

// "Payment will be available soon" — shown whenever a candidate tries to pay
// while online payments are switched off. Mounted once in the dashboard
// layout; opened by startPayment() via the "nexit:payment-soon" event.
export function PaymentSoonNote({ compact = false }) {
  return (
    <div className={`pay-soon-note ${compact ? "compact" : ""}`}>
      <p>Online payment will be available soon.</p>
      <p>For details on payment, please reach out to us on WhatsApp:</p>
      <a className="btn-solid pay-soon-wa" href={COMPANY.whatsappHref} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon /> Chat on WhatsApp · {COMPANY.whatsapp}
      </a>
    </div>
  );
}

export default function PaymentSoon() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener("nexit:payment-soon", on);
    return () => window.removeEventListener("nexit:payment-soon", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  if (!open) return null;
  return (
    <div className="pay-soon-scrim" onClick={() => setOpen(false)}>
      <div className="pay-soon" role="dialog" aria-modal="true" aria-labelledby="pay-soon-h" onClick={(e) => e.stopPropagation()}>
        <button className="pay-soon-x" onClick={() => setOpen(false)} aria-label="Close"><IconX width={18} height={18} /></button>
        <h3 id="pay-soon-h">Payment coming soon</h3>
        <PaymentSoonNote />
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.6 4.1 3.6 1.5.7 2.1.7 2.9.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}
