"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { formatNaira } from "@/lib/money";

const TABS = [
  ["pending", "To approve"],
  ["approved", "Approved"],
  ["processing", "Processing"],
  ["failed", "Failed"],
  ["paid", "Paid"],
  ["rejected", "Declined"],
  ["all", "All"],
];
const LABEL = { pending: "Awaiting approval", approved: "Approved", processing: "Processing", paid: "Paid", failed: "Failed", rejected: "Declined" };
const PILL = { pending: "pending", approved: "approved", processing: "approved", paid: "paid", failed: "failed", rejected: "failed" };

const DEMO = {
  automatic: false,
  totals: { pending: { count: 1, amount: 15000 }, paid: { count: 3, amount: 60000 } },
  requests: [
    { id: "d1", amount: 15000, status: "pending", bank_name: "Guaranty Trust Bank", account_number: "0123456789", account_name: "Grace Okon", created_at: new Date().toISOString(), interviewer: { full_name: "Grace Okon", email: "grace@example.com" } },
    { id: "d2", amount: 20000, status: "paid", bank_name: "Access Bank", account_number: "0987654321", account_name: "Kola Ade", created_at: new Date(Date.now() - 4 * 86400000).toISOString(), paid_at: new Date(Date.now() - 3 * 86400000).toISOString(), interviewer: { full_name: "Kola Ade", email: "kola@example.com" } },
  ],
};

export default function AdminPayouts() {
  const { supabaseEnabled } = useAuth();
  const [tab, setTab] = useState("pending");
  const [d, setD] = useState(supabaseEnabled ? null : DEMO);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    if (!supabaseEnabled) return;
    try {
      const r = await fetch(`/api/admin/payouts?status=${tab}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Couldn't load payouts");
      setD(j); setErr("");
    } catch (e) { setErr(e.message); }
  }, [supabaseEnabled, tab]);
  useEffect(() => { load(); }, [load]);

  const act = async (row, action) => {
    let note = "";
    if (action === "reject") {
      note = window.prompt(`Why are you declining ${formatNaira(row.amount)} for ${row.interviewer?.full_name || "this interviewer"}? They'll see this reason.`) || "";
      if (!note.trim()) return;
    }
    if (action === "mark_paid" && !window.confirm(`Confirm you've paid ${formatNaira(row.amount)} to ${row.account_name} (${row.bank_name} ${row.account_number})?`)) return;
    if (action === "approve" && !window.confirm(d?.automatic
      ? `Approve and send ${formatNaira(row.amount)} to ${row.account_name} via Paystack now?`
      : `Approve ${formatNaira(row.amount)}? Paystack isn't connected, so pay it by bank transfer and then click "Mark as paid".`)) return;
    setMsg(""); setErr("");
    if (!supabaseEnabled) { setMsg("Demo mode — nothing was sent."); return; }
    setBusy(row.id + action);
    try {
      const r = await fetch("/api/admin/payouts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: row.id, action, note }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Action failed");
      setMsg(j.error ? `Updated, but: ${j.error}` : `Done — now ${LABEL[j.status] || j.status}.`);
      await load();
    } catch (e) { setErr(e.message); }
    setBusy("");
  };

  const rows = (d?.requests || []).filter((r) => supabaseEnabled || tab === "all" || r.status === tab);
  const t = d?.totals || {};

  return (
    <>
      <div className="page-head">
        <h1>Interviewer payouts</h1>
        <p>Approve withdrawals and track transfers. Fees, minimum payout and approval rules are in <Link href="/admin/settings#other" className="link">Settings</Link>.</p>
      </div>

      <div className={`consent-warn ${d?.automatic ? "po-ok" : ""}`} style={{ margin: "0 0 16px" }}>
        <span>
          {d?.automatic
            ? <><b>Paystack Transfers connected.</b> Approved payouts are sent automatically from your Paystack balance; results arrive by webhook.</>
            : <><b>Paystack isn&apos;t connected</b> (no PAYSTACK_SECRET_KEY), so payouts aren&apos;t sent automatically. Pay approved requests by bank transfer, then click <b>Mark as paid</b>.</>}
        </span>
      </div>

      <div className="po-tiles">
        {[["pending", "To approve"], ["processing", "Processing"], ["failed", "Failed"], ["paid", "Paid out"]].map(([k, l]) => (
          <button type="button" key={k} className={`po-tile ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>
            <span>{l}</span>
            <b>{formatNaira(t[k]?.amount || 0)}</b>
            <small>{t[k]?.count || 0} request{(t[k]?.count || 0) === 1 ? "" : "s"}</small>
          </button>
        ))}
      </div>

      <div className="po-tabs" role="tablist">
        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}
      </div>

      {err && <div className="auth-error" style={{ marginBottom: 10 }}>{err}</div>}
      {msg && <div className="role-note ok" style={{ marginBottom: 10 }}>{msg}</div>}

      <div className="card pad">
        {!d ? <p className="po-muted">Loading…</p> : rows.length === 0 ? <p className="po-muted">Nothing here.</p> : (
          <div className="po-list">
            {rows.map((r) => (
              <div className="po-row po-admin-row" key={r.id}>
                <div className="po-grow">
                  <b>{r.interviewer?.full_name || "Interviewer"} · {formatNaira(r.amount)}</b>
                  <span>{r.account_name} · {r.bank_name} {r.account_number} · requested {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}{r.paid_at ? ` · paid ${new Date(r.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}</span>
                  {r.note && <span className="po-note">{r.note}</span>}
                </div>
                <span className={`pill-status ${PILL[r.status]}`}>{LABEL[r.status]}</span>
                <div className="po-actions">
                  {r.status === "pending" && <>
                    <button className="btn-solid" disabled={!!busy} onClick={() => act(r, "approve")}>{d.automatic ? "Approve & send" : "Approve"}</button>
                    <button className="btn-outline" disabled={!!busy} onClick={() => act(r, "reject")}>Decline</button>
                  </>}
                  {r.status === "approved" && <>
                    <button className="btn-solid" disabled={!!busy} onClick={() => act(r, "mark_paid")}>Mark as paid</button>
                    <button className="btn-outline" disabled={!!busy} onClick={() => act(r, "reject")}>Decline</button>
                  </>}
                  {r.status === "processing" && <>
                    <button className="btn-outline" disabled={!!busy} onClick={() => act(r, "refresh")}>Check status</button>
                    <button className="btn-outline" disabled={!!busy} onClick={() => act(r, "mark_paid")}>Mark as paid</button>
                  </>}
                  {r.status === "failed" && <>
                    {d.automatic && <button className="btn-solid" disabled={!!busy} onClick={() => act(r, "retry")}>Retry transfer</button>}
                    <button className="btn-outline" disabled={!!busy} onClick={() => act(r, "mark_paid")}>Mark as paid</button>
                    <button className="btn-outline" disabled={!!busy} onClick={() => act(r, "reject")}>Decline</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
