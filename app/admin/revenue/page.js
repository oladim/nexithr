"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { formatNaira } from "@/lib/money";
import { IconSearch } from "@/components/Icons";

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const METHOD = { paystack: "Paystack", manual: "Manual payment", complimentary: "Complimentary" };
const STATE = { active: "Active", expiring: "Expiring soon", expired: "Expired", none: "Not subscribed" };
const STATE_PILL = { active: "paid", expiring: "pending", expired: "failed", none: "" };
const PAY_PILL = { success: "paid", pending: "pending", failed: "failed" };

const DEMO_SUMMARY = (() => {
  const now = new Date();
  const series = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { key: `${i}`, label: d.toLocaleDateString("en-GB", { month: "short" }), amount: [0, 0, 29999, 59998, 29999, 479999, 89997, 59998, 509998, 119996, 89997, 149995][i], count: 0 };
  });
  return { total: 1679973, month: 149995, last30: 179994, count: 24, byPurpose: { subscription: 719976, training: 959997 }, byProvider: { paystack: 1559976, manual: 119997, complimentary: 0 }, complimentaryCount: 2, series, subscribers: { active: 21, expiring: 3, expired: 4 }, pending: 1, currency: "NGN", annualPrice: 29999 };
})();
const DEMO_PAYMENTS = [
  { id: "p1", created_at: new Date().toISOString(), paid_at: new Date().toISOString(), candidate: { full_name: "Amara Okafor", email: "amara@example.com" }, what: "Annual subscription", amount: 29999, status: "success", provider: "paystack", reference: "sub_demo1", period_end: new Date(Date.now() + 365 * 864e5).toISOString() },
  { id: "p2", created_at: new Date(Date.now() - 2 * 864e5).toISOString(), paid_at: new Date(Date.now() - 2 * 864e5).toISOString(), candidate: { full_name: "Tunde Bello", email: "tunde@example.com" }, what: "Specific training — Cloud Engineer (intensive)", amount: 450000, status: "success", provider: "paystack", reference: "trn_demo2" },
  { id: "p3", created_at: new Date(Date.now() - 5 * 864e5).toISOString(), paid_at: new Date(Date.now() - 5 * 864e5).toISOString(), candidate: { full_name: "Ngozi Eze", email: "ngozi@example.com" }, what: "Annual subscription", amount: 29999, status: "success", provider: "manual", reference: "Bank transfer 0042", recordedBy: "Admin", note: "Paid at office" },
  { id: "p4", created_at: new Date(Date.now() - 9 * 864e5).toISOString(), paid_at: new Date(Date.now() - 9 * 864e5).toISOString(), candidate: { full_name: "Kemi Ade", email: "kemi@example.com" }, what: "Annual subscription", amount: 0, status: "success", provider: "complimentary", reference: "comp_demo", recordedBy: "Admin", note: "Scholarship" },
];
const DEMO_SUBS = [
  { id: "s1", candidate: { full_name: "Amara Okafor", email: "amara@example.com" }, state: "active", subscription_until: new Date(Date.now() + 340 * 864e5).toISOString(), subscription_started_at: new Date(Date.now() - 25 * 864e5).toISOString(), daysLeft: 340, subscription_source: "paystack", totalPaid: 29999 },
  { id: "s2", candidate: { full_name: "Ngozi Eze", email: "ngozi@example.com" }, state: "expiring", subscription_until: new Date(Date.now() + 6 * 864e5).toISOString(), subscription_started_at: new Date(Date.now() - 359 * 864e5).toISOString(), daysLeft: 6, subscription_source: "manual", totalPaid: 29999 },
  { id: "s3", candidate: { full_name: "Kemi Ade", email: "kemi@example.com" }, state: "expired", subscription_until: new Date(Date.now() - 3 * 864e5).toISOString(), subscription_started_at: new Date(Date.now() - 368 * 864e5).toISOString(), daysLeft: -3, subscription_source: "complimentary", totalPaid: 0 },
];

export default function AdminRevenue() {
  const { supabaseEnabled } = useAuth();
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState(supabaseEnabled ? null : DEMO_SUMMARY);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [grant, setGrant] = useState(null); // null | {} | { candidate }
  const [history, setHistory] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      try {
        const r = await fetch("/api/admin/revenue?view=summary", { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Couldn't load revenue");
        setSummary(j);
      } catch (e) { setErr(e.message); }
    })();
  }, [supabaseEnabled, reload]);

  const done = (text) => { setMsg(text); setErr(""); setReload((n) => n + 1); };

  return (
    <>
      <div className="page-head rv-head">
        <div>
          <h1>Revenue &amp; subscriptions</h1>
          <p>Who has paid, what they paid for, and every subscription with its expiry date. Subscriptions end automatically on their expiry date; candidates get reminders 7 days and 1 day before, and when it expires.</p>
        </div>
        <button className="btn-solid" onClick={() => setGrant({})}>+ Add subscription</button>
      </div>

      {!supabaseEnabled && <div className="role-note" style={{ marginBottom: 12 }}>Demo data. Connect Supabase to see real payments.</div>}
      {err && <div className="auth-error" style={{ marginBottom: 10 }}>{err}</div>}
      {msg && <div className="role-note ok" style={{ marginBottom: 10 }}>{msg}</div>}

      <div className="po-tiles">
        <div className="po-tile rv-static"><span>Total revenue</span><b>{summary ? formatNaira(summary.total) : "…"}</b><small>{summary?.count || 0} paid transactions</small></div>
        <div className="po-tile rv-static"><span>This month</span><b>{summary ? formatNaira(summary.month) : "…"}</b><small>Last 30 days: {summary ? formatNaira(summary.last30) : "…"}</small></div>
        <button type="button" className="po-tile" onClick={() => setTab("subscribers")}><span>Active subscribers</span><b>{summary?.subscribers.active ?? "…"}</b><small>{summary?.subscribers.expiring ?? 0} expire within 30 days</small></button>
        <button type="button" className="po-tile" onClick={() => setTab("payments")}><span>Pending payments</span><b>{summary?.pending ?? "…"}</b><small>Started on Paystack, not completed</small></button>
      </div>

      <div className="po-tabs" role="tablist">
        {[["overview", "Overview"], ["payments", "Payments"], ["subscribers", "Subscribers"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); setMsg(""); }}>{l}</button>
        ))}
      </div>

      {tab === "overview" && <Overview s={summary} />}
      {tab === "payments" && <Payments live={supabaseEnabled} reload={reload} />}
      {tab === "subscribers" && <Subscribers live={supabaseEnabled} reload={reload} onGrant={(c) => setGrant({ candidate: c })} onHistory={setHistory} onDone={done} onError={setErr} />}

      {grant && <GrantModal live={supabaseEnabled} preset={grant.candidate} price={summary?.annualPrice || 0} onClose={() => setGrant(null)} onDone={(t) => { setGrant(null); done(t); }} />}
      {history && <HistoryModal live={supabaseEnabled} row={history} onClose={() => setHistory(null)} />}
    </>
  );
}

/* ------------------------------- overview ------------------------------- */
function Overview({ s }) {
  if (!s) return <div className="card pad"><p className="po-muted">Loading…</p></div>;
  const max = Math.max(...s.series.map((m) => m.amount), 1);
  const split = [
    ["Subscriptions", s.byPurpose.subscription || 0, "#0a66d8"],
    ["Specific training", s.byPurpose.training || 0, "#2ecc71"],
  ];
  const splitTotal = split.reduce((a, x) => a + x[1], 0) || 1;
  return (
    <div className="rv-grid">
      <div className="card pad">
        <h3 className="card-title">Revenue by month</h3>
        <div className="rv-bars" role="img" aria-label="Revenue for the last 12 months">
          {s.series.map((m) => (
            <div className="rv-bar" key={m.key} title={`${m.label}: ${formatNaira(m.amount)}`}>
              <span className="rv-val">{m.amount ? compact(m.amount) : ""}</span>
              <div className="rv-fill" style={{ height: `${Math.max(m.amount ? 3 : 0, (m.amount / max) * 100)}%` }} />
              <small>{m.label}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="card pad">
        <h3 className="card-title">What people paid for</h3>
        <div className="rv-split">
          {split.map(([l, v, c]) => (
            <div key={l} className="rv-split-row">
              <div className="rv-split-top"><span><i style={{ background: c }} />{l}</span><b>{formatNaira(v)}</b></div>
              <div className="rv-track"><div style={{ width: `${(v / splitTotal) * 100}%`, background: c }} /></div>
            </div>
          ))}
        </div>
        <h3 className="card-title" style={{ marginTop: 18 }}>How they paid</h3>
        <ul className="rv-list">
          <li><span>Paystack</span><b>{formatNaira(s.byProvider.paystack || 0)}</b></li>
          <li><span>Manual (bank transfer, cash…)</span><b>{formatNaira(s.byProvider.manual || 0)}</b></li>
          <li><span>Complimentary (no payment)</span><b>{s.complimentaryCount} given</b></li>
        </ul>
      </div>
    </div>
  );
}
const compact = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : `${n}`);

/* ------------------------------- payments ------------------------------- */
function Payments({ live, reload }) {
  const [f, setF] = useState({ status: "success", purpose: "all", provider: "all", q: "", from: "", to: "" });
  const [d, setD] = useState(live ? null : { payments: DEMO_PAYMENTS, total: DEMO_PAYMENTS.reduce((a, p) => a + p.amount, 0) });
  const [err, setErr] = useState("");
  const qs = new URLSearchParams({ view: "payments", ...f }).toString();

  useEffect(() => {
    if (!live) return;
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/admin/revenue?${qs}`, { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Couldn't load payments");
        setD(j); setErr("");
      } catch (e) { setErr(e.message); }
    }, 250);
    return () => clearTimeout(t);
  }, [live, qs, reload]);

  const rows = live ? d?.payments || [] : (d?.payments || []).filter((p) =>
    (f.status === "all" || p.status === f.status) && (f.provider === "all" || p.provider === f.provider) &&
    (!f.q || `${p.candidate?.full_name} ${p.candidate?.email} ${p.reference}`.toLowerCase().includes(f.q.toLowerCase())));
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <>
      <div className="cvr-toolbar">
        <label className="cvr-search">
          <IconSearch width={16} height={16} />
          <input type="search" placeholder="Search name, email or reference…" value={f.q} onChange={set("q")} aria-label="Search payments" />
        </label>
        <select value={f.purpose} onChange={set("purpose")} aria-label="Paid for">
          <option value="all">Everything</option><option value="subscription">Subscriptions</option><option value="training">Specific training</option>
        </select>
        <select value={f.provider} onChange={set("provider")} aria-label="Method">
          <option value="all">All methods</option><option value="paystack">Paystack</option><option value="manual">Manual</option><option value="complimentary">Complimentary</option>
        </select>
        <select value={f.status} onChange={set("status")} aria-label="Status">
          <option value="success">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="all">All statuses</option>
        </select>
        <input type="date" className="rv-date" value={f.from} onChange={set("from")} aria-label="From date" />
        <input type="date" className="rv-date" value={f.to} onChange={set("to")} aria-label="To date" />
      </div>
      <div className="cvr-count">
        {rows.length} payment{rows.length === 1 ? "" : "s"}{f.status !== "pending" && f.status !== "failed" ? ` · ${formatNaira(rows.filter((r) => r.status === "success").reduce((a, r) => a + Number(r.amount || 0), 0))} received` : ""}
        {live && <a className="link-btn" style={{ marginLeft: 10 }} href={`/api/admin/revenue?${qs}&format=csv`}>Download CSV</a>}
      </div>
      {err && <div className="auth-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div className="card pad">
        {!d ? <p className="po-muted">Loading…</p> : rows.length === 0 ? <p className="po-muted">No payments match.</p> : (
          <div className="tbl-scroll">
            <table className="tbl">
              <thead><tr><th>Date</th><th>Who</th><th>Paid for</th><th>Amount</th><th>Method</th><th>Status</th><th>Reference</th></tr></thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>{fmt(p.paid_at || p.created_at)}</td>
                    <td><b>{p.candidate?.full_name || "—"}</b><div className="rv-sub">{p.candidate?.email}</div></td>
                    <td>{p.what}{p.period_end && <div className="rv-sub">Covers until {fmt(p.period_end)}</div>}</td>
                    <td className="po-amt">{formatNaira(p.amount)}</td>
                    <td>{METHOD[p.provider] || p.provider}{p.recordedBy && <div className="rv-sub">by {p.recordedBy}</div>}</td>
                    <td><span className={`pill-status ${PAY_PILL[p.status] || ""}`}>{p.status === "success" ? "Paid" : p.status[0].toUpperCase() + p.status.slice(1)}</span></td>
                    <td className="rv-ref">{p.reference}{p.note && <div className="rv-sub">{p.note}</div>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------ subscribers ----------------------------- */
function Subscribers({ live, reload, onGrant, onHistory, onDone, onError }) {
  const [state, setState] = useState("active");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(live ? null : DEMO_SUBS);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    if (!live) return;
    try {
      const r = await fetch(`/api/admin/revenue?view=subscribers&state=${state}&q=${encodeURIComponent(q)}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Couldn't load subscribers");
      setRows(j.subscribers);
    } catch (e) { onError(e.message); }
  }, [live, state, q, onError]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load, reload]);

  const cancel = async (r) => {
    const reason = window.prompt(`End ${r.candidate?.full_name || "this candidate"}'s subscription now? Access stops immediately and they're notified.\n\nReason (optional, shared with the candidate):`);
    if (reason === null) return;
    if (!live) { onDone("Demo mode — nothing changed."); return; }
    setBusy(r.id);
    try {
      const res = await fetch("/api/admin/revenue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel", candidateId: r.id, note: reason }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Couldn't unsubscribe");
      onDone(`${r.candidate?.full_name || "Candidate"} has been unsubscribed.`);
      load();
    } catch (e) { onError(e.message); }
    setBusy("");
  };

  const shown = live ? rows || [] : (rows || []).filter((r) => (state === "all" || r.state === state || (state === "active" && r.state === "expiring")) && (!q || `${r.candidate?.full_name} ${r.candidate?.email}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <div className="cvr-toolbar">
        <label className="cvr-search">
          <IconSearch width={16} height={16} />
          <input type="search" placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search subscribers" />
        </label>
      </div>
      <div className="cvr-chips" role="tablist" aria-label="Subscription status">
        {[["active", "Active"], ["expiring", "Expiring in 30 days"], ["expired", "Expired"], ["all", "All"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={state === k} className={`cvr-chip ${state === k ? "on" : ""}`} onClick={() => setState(k)}>{l}</button>
        ))}
        {live && <a className="link-btn" style={{ marginLeft: "auto" }} href={`/api/admin/revenue?view=subscribers&state=${state}&q=${encodeURIComponent(q)}&format=csv`}>Download CSV</a>}
      </div>
      <div className="card pad">
        {!rows ? <p className="po-muted">Loading…</p> : shown.length === 0 ? <p className="po-muted">No subscribers here.</p> : (
          <div className="tbl-scroll">
            <table className="tbl">
              <thead><tr><th>Candidate</th><th>Status</th><th>Expires</th><th>Started</th><th>How</th><th>Total paid</th><th /></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td><b>{r.candidate?.full_name || "—"}</b><div className="rv-sub">{r.candidate?.email}</div></td>
                    <td><span className={`pill-status ${STATE_PILL[r.state]}`}>{STATE[r.state]}</span>{r.subscription_cancelled_at && r.state === "expired" && <div className="rv-sub">Ended by admin</div>}</td>
                    <td>{fmt(r.subscription_until)}<div className="rv-sub">{r.daysLeft > 0 ? `${r.daysLeft} day${r.daysLeft === 1 ? "" : "s"} left` : `${Math.abs(r.daysLeft)} day${Math.abs(r.daysLeft) === 1 ? "" : "s"} ago`}</div></td>
                    <td>{fmt(r.subscription_started_at)}</td>
                    <td>{METHOD[r.subscription_source] || "—"}</td>
                    <td className="po-amt">{formatNaira(r.totalPaid)}</td>
                    <td>
                      <div className="rv-actions">
                        <button className="mini-btn" onClick={() => onGrant({ id: r.id, full_name: r.candidate?.full_name, email: r.candidate?.email, subscriptionUntil: r.subscription_until, state: r.state })}>{r.state === "expired" ? "Renew" : "Extend"}</button>
                        {r.state !== "expired" && <button className="mini-btn rv-danger" disabled={busy === r.id} onClick={() => cancel(r)}>Unsubscribe</button>}
                        <button className="link-btn" onClick={() => onHistory(r)}>History</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------------------- add / extend modal ---------------------------- */
function GrantModal({ live, preset, price, onClose, onDone }) {
  const [cand, setCand] = useState(preset || null);
  const [q, setQ] = useState("");
  const [found, setFound] = useState([]);
  const [paid, setPaid] = useState(true);
  const [length, setLength] = useState("12");
  const [until, setUntil] = useState("");
  const [amount, setAmount] = useState(price ? String(price) : "");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (!preset) inputRef.current?.focus(); }, [preset]);

  useEffect(() => {
    if (cand || q.trim().length < 2) { setFound([]); return; }
    if (!live) { setFound(DEMO_SUBS.map((s) => ({ id: s.id, ...s.candidate, subscriptionUntil: s.subscription_until, state: s.state })).filter((c) => `${c.full_name} ${c.email}`.toLowerCase().includes(q.toLowerCase()))); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/admin/revenue?find=${encodeURIComponent(q)}`, { cache: "no-store" });
        const j = await r.json();
        setFound(j.candidates || []);
      } catch { setFound([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [q, cand, live]);

  const active = cand?.subscriptionUntil && new Date(cand.subscriptionUntil) > new Date();
  const preview = (() => {
    if (length === "custom") return until ? new Date(until) : null;
    const base = active ? new Date(cand.subscriptionUntil) : new Date();
    base.setMonth(base.getMonth() + Number(length));
    return base;
  })();
  const minDate = new Date(Date.now() + 864e5).toISOString().slice(0, 10);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!cand) return setErr("Choose a candidate.");
    if (paid && !(Number(amount) > 0)) return setErr("Enter the amount they paid.");
    if (length === "custom" && !until) return setErr("Pick the end date.");
    if (!live) { onDone("Demo mode — nothing changed."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/admin/revenue", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", candidateId: cand.id, paid, amount: paid ? Number(amount) : 0, months: length === "custom" ? undefined : Number(length), until: length === "custom" ? `${until}T23:59:59` : undefined, reference, note, notify }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Couldn't save");
      onDone(`${cand.full_name || cand.email} is subscribed until ${fmt(j.until)}.`);
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  return (
    <div className="tb-search-scrim" onMouseDown={onClose}>
      <form className="po-modal rv-modal" role="dialog" aria-modal="true" aria-labelledby="rv-grant-title" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3 id="rv-grant-title" style={{ margin: 0 }}>{active ? "Extend subscription" : "Add subscription"}</h3>

        {cand ? (
          <div className="rv-picked">
            <div><b>{cand.full_name || "Candidate"}</b><span>{cand.email}{cand.subscriptionUntil ? ` · ${active ? "active until" : "expired"} ${fmt(cand.subscriptionUntil)}` : " · not subscribed"}</span></div>
            {!preset && <button type="button" className="link-btn" onClick={() => { setCand(null); setQ(""); }}>Change</button>}
          </div>
        ) : (
          <div className="field">
            <label htmlFor="rv-find">Candidate</label>
            <input id="rv-find" ref={inputRef} placeholder="Type a name or email…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
            {found.length > 0 && (
              <div className="rv-found">
                {found.map((c) => (
                  <button type="button" key={c.id} onClick={() => setCand(c)}>
                    <b>{c.full_name || c.email}</b><span>{c.email} · {STATE[c.state]}</span>
                  </button>
                ))}
              </div>
            )}
            {q.trim().length >= 2 && found.length === 0 && <span className="po-muted">No candidate found.</span>}
          </div>
        )}

        <div className="rv-seg" role="radiogroup" aria-label="Payment">
          <button type="button" role="radio" aria-checked={paid} className={paid ? "on" : ""} onClick={() => setPaid(true)}>With payment</button>
          <button type="button" role="radio" aria-checked={!paid} className={!paid ? "on" : ""} onClick={() => setPaid(false)}>Without payment</button>
        </div>
        <p className="po-muted" style={{ margin: 0 }}>{paid ? "They paid outside Paystack (bank transfer, cash, POS). It's recorded as revenue." : "Complimentary (scholarship, partner, staff, goodwill). Recorded as ₦0 so it isn't counted as revenue."}</p>

        <div className="rv-row">
          <div className="field">
            <label htmlFor="rv-len">Length</label>
            <select id="rv-len" value={length} onChange={(e) => setLength(e.target.value)}>
              <option value="1">1 month</option><option value="3">3 months</option><option value="6">6 months</option><option value="12">1 year</option><option value="24">2 years</option><option value="custom">Until a date…</option>
            </select>
          </div>
          {length === "custom" ? (
            <div className="field"><label htmlFor="rv-until">Ends on</label><input id="rv-until" type="date" min={minDate} value={until} onChange={(e) => setUntil(e.target.value)} /></div>
          ) : paid ? (
            <div className="field"><label htmlFor="rv-amt">Amount paid (₦)</label><input id="rv-amt" type="number" min="1" step="1" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          ) : null}
        </div>
        {length === "custom" && paid && (
          <div className="field"><label htmlFor="rv-amt2">Amount paid (₦)</label><input id="rv-amt2" type="number" min="1" step="1" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        )}
        {paid && <div className="field"><label htmlFor="rv-ref">Payment reference (optional)</label><input id="rv-ref" maxLength={120} placeholder="e.g. bank transfer ref or receipt no." value={reference} onChange={(e) => setReference(e.target.value)} /></div>}
        <div className="field"><label htmlFor="rv-note">Note (optional)</label><input id="rv-note" maxLength={500} placeholder={paid ? "e.g. paid at the office" : "e.g. scholarship"} value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <label className="rv-check"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Email and notify the candidate</label>

        {cand && preview && <div className="role-note">{active ? "New expiry" : "Expires"}: <b>{fmt(preview)}</b>{active && length !== "custom" ? " (added to their current expiry)" : ""}</div>}
        {err && <div className="auth-error">{err}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-solid" disabled={busy}>{busy ? "Saving…" : active ? "Extend" : "Subscribe"}</button>
        </div>
      </form>
    </div>
  );
}

const EV = { subscribed: "Subscribed", extended: "Extended", cancelled: "Unsubscribed", expired: "Expired", reminded: "Reminder sent" };
function HistoryModal({ live, row, onClose }) {
  const [ev, setEv] = useState(live ? null : [{ id: "e1", action: "subscribed", source: row.subscription_source, created_at: row.subscription_started_at, until_after: row.subscription_until, amount: row.totalPaid }]);
  useEffect(() => {
    if (!live) return;
    fetch(`/api/admin/revenue?history=${row.id}`, { cache: "no-store" }).then((r) => r.json()).then((j) => setEv(j.events || [])).catch(() => setEv([]));
  }, [live, row.id]);
  return (
    <div className="tb-search-scrim" onMouseDown={onClose}>
      <div className="po-modal rv-modal" role="dialog" aria-modal="true" aria-labelledby="rv-hist-title" onMouseDown={(e) => e.stopPropagation()}>
        <h3 id="rv-hist-title" style={{ margin: 0 }}>Subscription history · {row.candidate?.full_name || "Candidate"}</h3>
        {!ev ? <p className="po-muted">Loading…</p> : ev.length === 0 ? <p className="po-muted">No history yet (subscriptions before this update aren&apos;t listed).</p> : (
          <div className="po-list">
            {ev.map((e) => (
              <div className="po-row" key={e.id}>
                <div className="po-grow">
                  <b>{EV[e.action] || e.action}{e.action === "reminded" && e.note ? ` (${e.note === "1d" ? "1 day" : "7 days"} before)` : ""}</b>
                  <span>
                    {fmt(e.created_at)}
                    {e.source && e.source !== "system" ? ` · ${METHOD[e.source] || e.source}` : ""}
                    {e.amount ? ` · ${formatNaira(e.amount)}` : ""}
                    {e.until_after && e.action !== "reminded" ? ` · ${e.action === "cancelled" ? "ended" : "until"} ${fmt(e.until_after)}` : ""}
                    {e.actor ? ` · by ${e.actor}` : ""}
                  </span>
                  {e.note && e.action !== "reminded" && e.action !== "expired" && <span>{e.note}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="btn-outline" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}
