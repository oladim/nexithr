import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadSettings } from "@/lib/db";
import { payoutSummary, sendPayout } from "@/lib/payouts";
import { transfersEnabled } from "@/lib/paystackTransfers";
import { alertAdmins } from "@/lib/adminAlert";
import { notifyUser } from "@/lib/notify";
import { formatNaira } from "@/lib/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function interviewer() {
  const me = await getSessionProfile();
  if (!me) return { res: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  if (me.role !== "interviewer") return { res: NextResponse.json({ error: "Interviewers only" }, { status: 403 }) };
  const admin = getServiceSupabase();
  if (!admin) return { res: NextResponse.json({ error: "Server not configured" }, { status: 500 }) };
  return { me, admin };
}

// GET /api/payouts — the interviewer's earnings, withdrawals, bank account
// and the payout rules currently set by the admin.
export async function GET() {
  const { me, admin, res } = await interviewer();
  if (res) return res;
  const [s, summary, { data: earnings }, { data: requests }, { data: acct }] = await Promise.all([
    loadSettings(admin),
    payoutSummary(admin, me.id),
    admin.from("interviewer_earnings").select("id, description, stage, amount, created_at").eq("interviewer_id", me.id).order("created_at", { ascending: false }).limit(50),
    admin.from("payout_requests").select("id, amount, status, note, bank_name, account_number, created_at, paid_at").eq("interviewer_id", me.id).order("created_at", { ascending: false }).limit(30),
    admin.from("payout_accounts").select("bank_code, bank_name, account_number, account_name").eq("interviewer_id", me.id).maybeSingle(),
  ]);
  return NextResponse.json({
    summary,
    earnings: earnings || [],
    requests: (requests || []).map((r) => ({ ...r, account_number: r.account_number ? `••••${String(r.account_number).slice(-4)}` : null })),
    account: acct ? { ...acct, account_number_masked: `••••${acct.account_number.slice(-4)}` } : null,
    rules: {
      enabled: s.interviewer_payouts_enabled !== false,
      manualApproval: s.payout_manual_approval !== false,
      minAmount: Number(s.payout_min_amount ?? 0),
      feeProfessional: Number(s.interviewer_fee_professional ?? 0),
      feeHr: Number(s.interviewer_fee_hr ?? 0),
      automatic: transfersEnabled(),
    },
  });
}

const ERRORS = {
  NO_ACCOUNT: "Add your bank account before requesting a payout.",
  BAD_AMOUNT: "Enter a valid amount.",
  BELOW_MIN: "That's below the minimum payout amount.",
  OPEN_REQUEST: "You already have a payout in progress. You can request another once it's paid.",
  INSUFFICIENT: "That's more than your available balance.",
};

// POST /api/payouts { amount } — request a withdrawal.
export async function POST(request) {
  const { me, admin, res } = await interviewer();
  if (res) return res;
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const amount = Math.round(Number(body?.amount) * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: ERRORS.BAD_AMOUNT }, { status: 400 });

  const s = await loadSettings(admin);
  if (s.interviewer_payouts_enabled === false) return NextResponse.json({ error: "Payouts are paused at the moment. Your balance is safe — please try again later." }, { status: 403 });
  const manual = s.payout_manual_approval !== false;

  const { data: id, error } = await admin.rpc("request_payout", {
    uid: me.id, amt: amount, min_amt: Number(s.payout_min_amount ?? 0), initial: manual ? "pending" : "approved",
  });
  if (error) {
    const code = Object.keys(ERRORS).find((k) => (error.message || "").includes(k));
    return NextResponse.json({ error: code ? ERRORS[code] : error.message }, { status: code ? 400 : 500 });
  }
  const { data: req } = await admin.from("payout_requests").select("*").eq("id", id).maybeSingle();

  await alertAdmins(admin, {
    key: `payout:${id}`,
    category: "payments",
    subject: `${manual ? "Payout request to approve" : "Payout sent automatically"} — ${formatNaira(amount)} for ${me.full_name || "an interviewer"}`,
    summary: manual
      ? `${me.full_name || "An interviewer"} requested a withdrawal of ${formatNaira(amount)}. Approve it in Admin → Payouts to send it.`
      : `${me.full_name || "An interviewer"} requested ${formatNaira(amount)}. Manual approval is off, so it is being sent now.`,
    details: [["Interviewer", `${me.full_name || "—"} (${me.email || me.authEmail || ""})`], ["Amount", formatNaira(amount)], ["Bank", `${req?.bank_name || ""} ••••${String(req?.account_number || "").slice(-4)}`]],
    cta: { label: "Open payouts", path: "/admin/payouts" },
  });

  let status = req?.status || "pending";
  if (!manual && req) status = (await sendPayout(admin, req)).status;
  if (manual) {
    await notifyUser(admin, {
      userId: me.id, sendEmail: false,
      title: "Payout requested",
      body: `We've received your request for ${formatNaira(amount)}. You'll be notified when it's approved and sent.`,
    });
  }
  return NextResponse.json({ ok: true, id, status });
}
