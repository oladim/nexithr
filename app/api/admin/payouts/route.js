import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { hasPerm } from "@/lib/permissions";
import { sendPayout, refreshPayout, payoutSummary } from "@/lib/payouts";
import { transfersEnabled } from "@/lib/paystackTransfers";
import { notifyUser } from "@/lib/notify";
import { formatNaira } from "@/lib/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guard() {
  const access = await getSessionAccess();
  if (!access) return { res: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  if (access.role !== "admin" || !hasPerm(access, "payouts")) return { res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  const admin = getServiceSupabase();
  if (!admin) return { res: NextResponse.json({ error: "Server not configured" }, { status: 500 }) };
  return { access, admin };
}

// GET /api/admin/payouts?status=pending — withdrawal requests + totals.
export async function GET(request) {
  const { admin, res } = await guard();
  if (res) return res;
  const status = new URL(request.url).searchParams.get("status") || "";
  let q = admin.from("payout_requests").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && status !== "all") q = q.eq("status", status);
  const [{ data: rows, error }, { data: all }] = await Promise.all([q, admin.from("payout_requests").select("status, amount")]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = [...new Set((rows || []).map((r) => r.interviewer_id))];
  const { data: profs } = ids.length ? await admin.from("profiles").select("id, full_name, email").in("id", ids) : { data: [] };
  const byId = Object.fromEntries((profs || []).map((p) => [p.id, p]));
  const totals = {};
  for (const r of all || []) {
    totals[r.status] = totals[r.status] || { count: 0, amount: 0 };
    totals[r.status].count++; totals[r.status].amount += Number(r.amount);
  }
  return NextResponse.json({
    automatic: transfersEnabled(),
    totals,
    requests: (rows || []).map((r) => ({ ...r, interviewer: byId[r.interviewer_id] || null })),
  });
}

// POST /api/admin/payouts { id, action: approve|reject|mark_paid|retry|refresh, note? }
export async function POST(request) {
  const { access, admin, res } = await guard();
  if (res) return res;
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { id, action } = body || {};
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : "";
  const { data: req } = await admin.from("payout_requests").select("*").eq("id", id).maybeSingle();
  if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  const now = new Date().toISOString();
  const stamp = { decided_by: access.id, decided_at: now, updated_at: now };

  if (action === "approve") {
    if (req.status !== "pending") return NextResponse.json({ error: "Only pending requests can be approved." }, { status: 409 });
    await admin.from("payout_requests").update({ status: "approved", ...stamp }).eq("id", id);
    const r = await sendPayout(admin, { ...req, status: "approved" });
    if (r.manual) {
      await notifyUser(admin, { userId: req.interviewer_id, title: "Payout approved", body: `Your withdrawal of ${formatNaira(req.amount)} was approved and will be paid to your bank account shortly.`, cta: { label: "View earnings", path: "/interviewer/earnings" } });
    }
    return NextResponse.json({ ok: true, status: r.status, error: r.error || null });
  }

  if (action === "reject") {
    if (!["pending", "approved", "failed"].includes(req.status)) return NextResponse.json({ error: "This request can't be rejected now." }, { status: 409 });
    if (!note) return NextResponse.json({ error: "Add a reason so the interviewer knows why." }, { status: 400 });
    await admin.from("payout_requests").update({ status: "rejected", note, ...stamp }).eq("id", id);
    await notifyUser(admin, { userId: req.interviewer_id, title: "Payout request declined", body: `Your withdrawal of ${formatNaira(req.amount)} was declined: ${note} The amount is back in your available balance.`, cta: { label: "View earnings", path: "/interviewer/earnings" } });
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  if (action === "mark_paid") {
    if (!["approved", "failed", "processing"].includes(req.status)) return NextResponse.json({ error: "Approve the request first." }, { status: 409 });
    if (req.status === "failed") {
      const s = await payoutSummary(admin, req.interviewer_id);
      if (s.available < Number(req.amount)) return NextResponse.json({ error: "The interviewer no longer has enough balance for this amount." }, { status: 409 });
    }
    await admin.from("payout_requests").update({ status: "paid", paid_at: now, note: note || "Paid manually by bank transfer.", ...stamp }).eq("id", id);
    await notifyUser(admin, { userId: req.interviewer_id, title: "Payout sent", body: `${formatNaira(req.amount)} has been paid to your bank account ending ${String(req.account_number || "").slice(-4)}.`, cta: { label: "View earnings", path: "/interviewer/earnings" } });
    return NextResponse.json({ ok: true, status: "paid" });
  }

  if (action === "retry") {
    if (req.status !== "failed") return NextResponse.json({ error: "Only failed payouts can be retried." }, { status: 409 });
    const s = await payoutSummary(admin, req.interviewer_id);
    if (s.available < Number(req.amount)) return NextResponse.json({ error: "The interviewer no longer has enough balance for this amount." }, { status: 409 });
    // A fresh reference — Paystack rejects a reused one.
    const reference = `payout_${crypto.randomUUID().replace(/-/g, "")}`;
    await admin.from("payout_requests").update({ status: "approved", reference, note: null, ...stamp }).eq("id", id);
    const r = await sendPayout(admin, { ...req, reference, status: "approved" });
    return NextResponse.json({ ok: true, status: r.status, error: r.error || null });
  }

  if (action === "refresh") {
    const r = await refreshPayout(admin, req);
    return NextResponse.json({ ok: true, status: r?.status || req.status });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
