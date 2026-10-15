// Server-side: can candidates pay online right now? SERVER ONLY.
// Online payments need BOTH the admin switch (Settings → Payments → "Online
// payments") and a Paystack secret key. There is no mock mode.
import { paystackEnabled } from "@/lib/paystack";

export function paymentsStatus(s = {}) {
  const online = s.payments_enabled === true && paystackEnabled();
  return {
    subscription: online,
    training: online && s.training_payments_enabled !== false,
    paystackConfigured: paystackEnabled(),
  };
}
