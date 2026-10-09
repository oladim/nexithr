// Interviewer earnings + payouts — SERVER ONLY (service-role client).
import { transfersEnabled, createRecipient, initiateTransfer, verifyTransfer } from "@/lib/paystackTransfers";
import { notifyUser } from "@/lib/notify";
import { formatNaira } from "@/lib/money";

// Credit the fee for one completed piece of work. Idempotent per sourceKey.
export async function creditEarning(admin, { interviewerId, sourceKey, candidateId, stage, settings, candidateName }) {
  const fee = Number(stage === "HR" ? settings?.interviewer_fee_hr : settings?.interviewer_fee_professional) || 0;
  if (!interviewerId || fee <= 0) return null;
  const { data, error } = await admin.from("interviewer_earnings").upsert({
    interviewer_id: interviewerId,
    source_key: sourceKey,
    candidate_id: candidateId || null,
    stage,
    description: `${stage} interview${candidateName ? ` — ${candidateName}` : ""}`,
    amount: fee,
  }, { onConflict: "interviewer_id,source_key", ignoreDuplicates: true }).select().maybeSingle();
  if (error) return null;
  return data;
}

export async function payoutSummary(admin, uid) {
  const [{ data: earn }, { data: reqs }] = await Promise.all([
    admin.from("interviewer_earnings").select("amount").eq("interviewer_id", uid),
    admin.from("payout_requests").select("amount, status").eq("interviewer_id", uid),
  ]);
  const sum = (rows) => (rows || []).reduce((a, r) => a + Number(r.amount || 0), 0);
  const earned = sum(earn);
  const paid = sum((reqs || []).filter((r) => r.status === "paid"));
  const inFlight = sum((reqs || []).filter((r) => ["pending", "approved", "processing"].includes(r.status)));
  return { earned, paid, inFlight, available: Math.max(0, earned - paid - inFlight) };
}

const STATUS_FROM_PAYSTACK = { success: "paid", failed: "failed", reversed: "failed", abandoned: "failed", rejected: "failed", blocked: "failed" };

// Send an approved request through Paystack. Without a Paystack key the
// request stays "approved" for an admin to pay by bank and mark as paid.
export async function sendPayout(admin, request) {
  if (!transfersEnabled()) {
    await admin.from("payout_requests").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", request.id);
    return { status: "approved", manual: true };
  }
  const { data: acct } = await admin.from("payout_accounts").select("*").eq("interviewer_id", request.interviewer_id).maybeSingle();
  if (!acct) return fail(admin, request, "No bank account on file.");

  let recipient = acct.recipient_code;
  if (!recipient) {
    const r = await createRecipient({ name: acct.account_name, accountNumber: acct.account_number, bankCode: acct.bank_code });
    if (r.error || !r.recipientCode) return fail(admin, request, `Couldn't register the bank account with Paystack: ${r.error || "unknown error"}`);
    recipient = r.recipientCode;
    await admin.from("payout_accounts").update({ recipient_code: recipient }).eq("interviewer_id", acct.interviewer_id);
  }

  const t = await initiateTransfer({
    amountNaira: request.amount, recipientCode: recipient, reference: request.reference,
    reason: "NexIT-Africa interviewer payout",
  });
  if (t.error) return fail(admin, request, `Paystack: ${t.error}`);

  const status = STATUS_FROM_PAYSTACK[t.status] || "processing"; // pending / otp / queued → processing
  const note = t.status === "otp" ? "Waiting for OTP — turn off 'Confirm transfers with OTP' in Paystack to pay automatically." : null;
  await admin.from("payout_requests").update({
    status, transfer_code: t.transferCode || null, note,
    paid_at: status === "paid" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq("id", request.id);
  if (status === "paid") await notifyPaid(admin, request);
  return { status };
}

async function fail(admin, request, note) {
  await admin.from("payout_requests").update({ status: "failed", note, updated_at: new Date().toISOString() }).eq("id", request.id);
  await notifyUser(admin, {
    userId: request.interviewer_id,
    title: "Payout couldn't be sent",
    body: `Your withdrawal of ${formatNaira(request.amount)} couldn't be sent yet. Our team has been alerted and will retry — the amount is back in your available balance.`,
    cta: { label: "View earnings", path: "/interviewer/earnings" },
  });
  return { status: "failed", error: note };
}

async function notifyPaid(admin, request) {
  await notifyUser(admin, {
    userId: request.interviewer_id,
    title: "Payout sent",
    body: `${formatNaira(request.amount)} has been sent to your bank account${request.account_number ? ` ending ${String(request.account_number).slice(-4)}` : ""}. It usually arrives within minutes.`,
    cta: { label: "View earnings", path: "/interviewer/earnings" },
  });
}

// Apply a final Paystack transfer status (from the webhook or a refresh).
export async function settleByReference(admin, reference, paystackStatus, reason) {
  const { data: req } = await admin.from("payout_requests").select("*").eq("reference", reference).maybeSingle();
  if (!req || ["paid", "rejected"].includes(req.status)) return req;
  const status = STATUS_FROM_PAYSTACK[paystackStatus];
  if (!status) return req;
  await admin.from("payout_requests").update({
    status,
    note: status === "failed" ? (reason || "Transfer failed at the bank.") : null,
    paid_at: status === "paid" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq("id", req.id);
  if (status === "paid") await notifyPaid(admin, req);
  else await fail(admin, req, reason || "Transfer failed at the bank.");
  return { ...req, status };
}

export async function refreshPayout(admin, req) {
  if (!transfersEnabled() || !req.reference) return req;
  const v = await verifyTransfer(req.reference);
  if (v.error) return req;
  return settleByReference(admin, req.reference, v.status, typeof v.reason === "string" ? v.reason : null);
}
