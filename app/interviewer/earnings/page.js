"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconCheck, IconClock, IconLock, IconCard } from "@/components/Icons";
import { formatNaira } from "@/lib/money";

// Demo data (no backend) so the page can be explored.
const DEMO = {
  summary: { earned: 45000, paid: 20000, inFlight: 0, available: 25000 },
  earnings: [
    { id: "e1", description: "Professional interview — Amara Okafor", stage: "Professional", amount: 5000, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: "e2", description: "HR interview — Tunde Bello", stage: "HR", amount: 5000, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: "e3", description: "Professional interview — Chioma Eze", stage: "Professional", amount: 5000, created_at: new Date(Date.now() - 9 * 86400000).toISOString() },
  ],
  requests: [{ id: "r1", amount: 20000, status: "paid", bank_name: "Guaranty Trust Bank", account_number: "••••6789", created_at: new Date(Date.now() - 12 * 86400000).toISOString(), paid_at: new Date(Date.now() - 12 * 86400000).toISOString() }],
  account: { bank_code: "058", bank_name: "Guaranty Trust Bank", account_name: "Demo Interviewer", account_number_masked: "••••6789" },
  rules: { enabled: true, manualApproval: true, minAmount: 5000, feeProfessional: 5000, feeHr: 5000, automatic: false },
};

const STATUS = {
  pending: ["Awaiting approval", "pending"],
  approved: ["Approved — sending", "approved"],
  processing: ["Processing", "approved"],
  paid: ["Paid", "paid"],
  failed: ["Failed — retrying", "failed"],
  rejected: ["Declined", "failed"],
};
const date = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

export default function InterviewerEarnings() {
  const { supabaseEnabled } = useAuth();
  const [d, setD] = useState(supabaseEnabled ? null : DEMO);
  const [err, setErr] = useState("");
  const [showAcct, setShowAcct] = useState(false);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    if (!supabaseEnabled) return;
    try {
      const r = await fetch("/api/payouts", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Couldn't load earnings");
      setD(j);
    } catch (e) { setErr(e.message); }
  }, [supabaseEnabled]);
  useEffect(() => { load(); }, [load]);

  const open = useMemo(() => (d?.requests || []).find((r) => ["pending", "approved", "processing"].includes(r.status)), [d]);

  if (!d) return <div className="page-head"><h1>Earnings</h1><p>{err || "Loading…"}</p></div>;
  const { summary, rules } = d;
  const canRequest = rules.enabled && d.account && !open && summary.available >= rules.minAmount;

  const request = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    const amt = Number(amount);
    if (!amt || amt <= 0) { setErr("Enter an amount."); return; }
    if (amt < rules.minAmount) { setErr(`The minimum payout is ${formatNaira(rules.minAmount)}.`); return; }
    if (amt > summary.available) { setErr("That's more than your available balance."); return; }
    if (!supabaseEnabled) { setMsg("Demo mode — request recorded locally only."); setAmount(""); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/payouts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: amt }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Couldn't request payout");
      setMsg(j.status === "paid" ? "Sent! The money should arrive within minutes."
        : j.status === "pending" ? "Request sent. You'll be notified when it's approved and paid."
        : j.status === "failed" ? "We couldn't send it automatically — our team has been alerted."
        : "Approved and on its way to your bank.");
      setAmount("");
      await load();
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  };

  return (
    <>
      <div className="page-head">
        <h1>Earnings &amp; payouts</h1>
        <p>You earn {formatNaira(rules.feeProfessional)} per Professional and {formatNaira(rules.feeHr)} per HR interview once you submit your verdict.</p>
      </div>

      {!rules.enabled && (
        <div className="consent-warn" style={{ margin: "0 0 16px" }}>
          <IconLock /><span><b>Payouts are paused.</b> You keep earning and your balance is safe — you can withdraw once payouts reopen.</span>
        </div>
      )}

      <div className="po-kpis">
        <div className="wallet-hero po-hero">
          <div>
            <div className="sub">Available to withdraw</div>
            <div className="big">{formatNaira(summary.available)}</div>
            <div className="sub">Earned {formatNaira(summary.earned)} · Paid out {formatNaira(summary.paid)}{summary.inFlight ? ` · In progress ${formatNaira(summary.inFlight)}` : ""}</div>
          </div>
        </div>

        <div className="card pad po-request">
          <h3 className="card-title">Withdraw</h3>
          {!d.account ? (
            <>
              <p className="po-muted">Add the bank account you want to be paid into.</p>
              <button type="button" className="btn-solid" onClick={() => setShowAcct(true)}><IconCard width={16} height={16} /> Add bank account</button>
            </>
          ) : open ? (
            <div className="po-open">
              <IconClock width={18} height={18} />
              <span>{formatNaira(open.amount)} is {STATUS[open.status]?.[0].toLowerCase()}. You can request again once it&apos;s paid.</span>
            </div>
          ) : (
            <form onSubmit={request} className="po-form">
              <div className="field field-simple">
                <label htmlFor="po-amt">Amount (₦)</label>
                <input id="po-amt" type="number" min={rules.minAmount} max={summary.available} step="1" inputMode="numeric" value={amount}
                  onChange={(e) => setAmount(e.target.value)} placeholder={String(summary.available)} disabled={!rules.enabled || busy} />
              </div>
              <div className="po-form-row">
                <button type="button" className="tb-link" onClick={() => setAmount(String(summary.available))} disabled={!rules.enabled}>Withdraw all</button>
                <span className="po-muted">Minimum {formatNaira(rules.minAmount)}</span>
              </div>
              <button className="btn-solid" disabled={!canRequest || busy}>{busy ? "Sending…" : "Request payout"}</button>
              <p className="po-muted" style={{ margin: 0 }}>
                {rules.manualApproval ? "Requests are reviewed by NexIT before they're paid, usually within 1–2 working days." : rules.automatic ? "Payouts are sent automatically to your bank." : "Approved payouts are paid to your bank by NexIT."}
              </p>
            </form>
          )}
          {err && <div className="auth-error" style={{ marginTop: 10 }}>{err}</div>}
          {msg && <div className="role-note ok" style={{ marginTop: 10 }}>{msg}</div>}
          {d.account && (
            <div className="po-acct">
              <div><b>{d.account.bank_name}</b><span>{d.account.account_name} · {d.account.account_number_masked}</span></div>
              <button type="button" className="tb-link" onClick={() => setShowAcct(true)}>Change</button>
            </div>
          )}
        </div>
      </div>

      {showAcct && <BankForm demo={!supabaseEnabled} current={d.account} onClose={() => setShowAcct(false)} onSaved={async (acct) => { setShowAcct(false); if (supabaseEnabled) await load(); else setD((x) => ({ ...x, account: acct })); }} />}

      <div className="iv-2col">
        <div className="card pad">
          <h3 className="card-title">Earnings</h3>
          {d.earnings.length === 0 ? <p className="po-muted">No earnings yet — you&apos;re paid after you submit a verdict for an interview you were assigned.</p> : (
            <div className="po-list">
              {d.earnings.map((e) => (
                <div className="po-row" key={e.id}>
                  <span className="po-ico ok"><IconCheck width={14} height={14} /></span>
                  <div className="po-grow"><b>{e.description || `${e.stage} interview`}</b><span>{date(e.created_at)}</span></div>
                  <b className="po-amt">+{formatNaira(e.amount)}</b>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card pad">
          <h3 className="card-title">Payouts</h3>
          {d.requests.length === 0 ? <p className="po-muted">No payouts yet.</p> : (
            <div className="po-list">
              {d.requests.map((r) => (
                <div className="po-row" key={r.id}>
                  <div className="po-grow">
                    <b>{formatNaira(r.amount)}</b>
                    <span>{date(r.created_at)}{r.bank_name ? ` · ${r.bank_name} ${r.account_number || ""}` : ""}</span>
                    {r.note && ["rejected", "failed"].includes(r.status) && <span className="po-note">{r.note}</span>}
                  </div>
                  <span className={`pill-status ${STATUS[r.status]?.[1] || ""}`}>{STATUS[r.status]?.[0] || r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function BankForm({ demo, current, onClose, onSaved }) {
  const [banks, setBanks] = useState([]);
  const [bankCode, setBankCode] = useState(current?.bank_code || "");
  const [acct, setAcct] = useState("");
  const [name, setName] = useState("");
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (demo) { setBanks([{ code: "058", name: "Guaranty Trust Bank" }, { code: "044", name: "Access Bank" }, { code: "057", name: "Zenith Bank" }]); return; }
    fetch("/api/payouts/account").then((r) => r.json()).then((j) => setBanks(j.banks || [])).catch(() => setErr("Couldn't load banks."));
  }, [demo]);
  useEffect(() => { setName(""); setVerified(false); }, [bankCode, acct]);

  const post = async (confirm) => {
    setErr(""); setBusy(true);
    try {
      if (demo) {
        const bank = banks.find((b) => b.code === bankCode);
        if (!confirm) { setName("Demo Interviewer"); setVerified(true); }
        else onSaved({ bank_code: bankCode, bank_name: bank?.name, account_name: name, account_number_masked: `••••${acct.slice(-4)}` });
        return;
      }
      const r = await fetch("/api/payouts/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bankCode, accountNumber: acct, accountName: name, confirm }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Couldn't verify account");
      if (!confirm) { setName(j.accountName || ""); setVerified(!!j.verified); }
      else onSaved(j.account);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const ready = bankCode && /^\d{10}$/.test(acct);
  return (
    <div className="tb-search-scrim" onMouseDown={onClose}>
      <div className="po-modal" role="dialog" aria-modal="true" aria-labelledby="po-bank-title" onMouseDown={(e) => e.stopPropagation()}>
        <h3 id="po-bank-title" className="card-title">{current ? "Change bank account" : "Add bank account"}</h3>
        <p className="po-muted">Payouts go to a Nigerian bank account in your name.</p>
        <div className="field field-simple">
          <label htmlFor="po-bank">Bank</label>
          <select id="po-bank" value={bankCode} onChange={(e) => setBankCode(e.target.value)}>
            <option value="">Choose your bank…</option>
            {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>
        <div className="field field-simple">
          <label htmlFor="po-acct">Account number (NUBAN)</label>
          <input id="po-acct" inputMode="numeric" maxLength={10} value={acct} onChange={(e) => setAcct(e.target.value.replace(/\D/g, ""))} placeholder="10 digits" />
        </div>
        {name && (
          verified
            ? <div className="role-note ok" style={{ marginTop: 4 }}>Account name: <b>{name}</b> — is this you?</div>
            : <div className="field field-simple"><label htmlFor="po-name">Account name</label><input id="po-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
        )}
        {err && <div className="auth-error" style={{ marginTop: 10 }}>{err}</div>}
        <div className="mt-btns">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          {!name
            ? <button type="button" className="btn-solid" disabled={!ready || busy} onClick={() => post(false)}>{busy ? "Checking…" : "Verify account"}</button>
            : <button type="button" className="btn-solid" disabled={busy} onClick={() => post(true)}>{busy ? "Saving…" : "Yes, save account"}</button>}
        </div>
      </div>
    </div>
  );
}
