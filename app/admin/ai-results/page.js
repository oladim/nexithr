"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { IconCheck, IconChart, IconSearch } from "@/components/Icons";

const BAND = { ready: "Ready", close: "Almost there", foundational: "Foundational" };
const BAND_PILL = { ready: "done", close: "pending", foundational: "failed" };
const fmt = (d) => (d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

const DEMO = {
  holdOn: true,
  pendingCount: 1,
  rows: [
    { candidateId: "d1", name: "Amara Okafor", email: "amara@example.com", role: "Full-stack Developer · Mid", attempts: 1, score: 82, band: "close", summary: "Solid fundamentals and clear communication; system design depth is still developing.", breakdown: { "Technical depth": 78, "Problem solving": 84, Communication: 90 }, training: 5, status: "pending_review", at: new Date().toISOString() },
    { candidateId: "d2", name: "Tunde Bello", email: "tunde@example.com", role: "Cloud Engineer · Senior", attempts: 2, score: 91, band: "ready", summary: "Strong across all competencies.", breakdown: { "Technical depth": 93, "Problem solving": 90 }, training: 2, status: "released", at: new Date(Date.now() - 2 * 864e5).toISOString(), confirmedBy: "Ada Admin", confirmedAt: new Date(Date.now() - 864e5).toISOString() },
  ],
};

export default function AdminAiResults() {
  const { supabaseEnabled } = useAuth();
  const [view, setView] = useState("pending");
  const [d, setD] = useState(supabaseEnabled ? null : DEMO);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null);
  const [flash, setFlash] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    if (!supabaseEnabled) return;
    try {
      const res = await fetch(`/api/admin/ai-results?view=${view}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't load AI results");
      setD(data); setErr("");
    } catch (e) { setErr(e.message); setD({ rows: [], pendingCount: 0, holdOn: false }); }
  }, [supabaseEnabled, view]);
  useEffect(() => { setD(supabaseEnabled ? null : DEMO); load(); }, [load, supabaseEnabled]);

  const act = async (r, action) => {
    if (action === "override_ready" && !window.confirm(`Mark ${r.name} as Ready (${r.score}%) and release? They'll be able to book the Professional interview.`)) return;
    setBusy(r.candidateId + action);
    try {
      if (!supabaseEnabled) { setFlash("Demo mode — nothing was sent."); setBusy(null); return; }
      const res = await fetch("/api/admin/ai-results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ candidateId: r.candidateId, action }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setFlash(action === "override_ready" ? `${r.name} marked Ready and released.` : `Report released to ${r.name}.`);
      setTimeout(() => setFlash(""), 6000);
      await load();
    } catch (e) { setErr(e.message); }
    setBusy(null);
  };

  const all = d?.rows || [];
  const rows = (supabaseEnabled ? all : all.filter((r) => view === "all" || r.status === "pending_review"))
    .filter((r) => !q || `${r.name} ${r.email} ${r.role}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="page-head">
        <h1>AI interview results</h1>
        <p>Every completed AI interview. With <b>hold results for approval</b> on, new results wait under <b>Awaiting review</b> until you release them (as scored, or overridden to Ready).</p>
      </div>

      {d && (
        <div className={`consent-warn ${d.holdOn ? "po-ok" : ""}`} style={{ margin: "0 0 14px" }}>
          <span>
            {d.holdOn
              ? <><b>Holding is on.</b> New AI results are hidden from candidates until released here. Results finished before holding was turned on were already released; they&apos;re under <b>All results</b>.</>
              : <><b>Holding is off.</b> Results are released to candidates automatically. Turn on &quot;Hold AI results for approval&quot; in <Link href="/admin/settings" className="link">Settings</Link> to review them first.</>}
          </span>
        </div>
      )}

      <div className="cvr-toolbar">
        <label className="cvr-search">
          <IconSearch width={16} height={16} />
          <input type="search" placeholder="Search name, email or role…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search results" />
        </label>
      </div>
      <div className="cvr-chips" role="tablist" aria-label="Results">
        <button role="tab" aria-selected={view === "pending"} className={`cvr-chip ${view === "pending" ? "on" : ""}`} onClick={() => setView("pending")}>Awaiting review <i>{d?.pendingCount ?? "…"}</i></button>
        <button role="tab" aria-selected={view === "all"} className={`cvr-chip ${view === "all" ? "on" : ""}`} onClick={() => setView("all")}>All results</button>
      </div>

      {flash && <div className="role-note ok" style={{ marginBottom: 12 }}>{flash}</div>}
      {err && <div className="auth-error" style={{ marginBottom: 12 }}>{err}</div>}

      <div className="card pad">
        {d === null ? (
          <p className="po-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="po-muted">
            {view === "pending"
              ? (d.holdOn ? "Nothing awaiting review. New AI interviews will appear here as candidates finish them." : "Nothing awaiting review, because holding is off.")
              : "No AI interviews have been completed yet."}
          </p>
        ) : (
          <div className="tbl-scroll">
            <table className="tbl">
              <thead><tr><th>Candidate</th><th>Score</th><th>Band</th><th>Finished</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.candidateId}>
                    <td><b>{r.name}</b><div className="rv-sub">{r.email}{r.role ? ` · ${r.role}` : ""}</div></td>
                    <td><b>{r.score != null ? `${Math.round(r.score)}%` : "—"}</b><div className="rv-sub">Attempt {r.attempts || 1}</div></td>
                    <td><span className={`pill-status ${BAND_PILL[r.band] || "pending"}`}>{BAND[r.band] || r.band || "—"}</span></td>
                    <td>{fmt(r.at)}</td>
                    <td>
                      {r.status === "pending_review"
                        ? <span className="pill-status pending">Held</span>
                        : <span className="pill-status done">Released</span>}
                      {r.confirmedBy && <div className="rv-sub">by {r.confirmedBy}</div>}
                    </td>
                    <td>
                      <div className="rv-actions" style={{ justifyContent: "flex-start" }}>
                        <button className="link-btn" onClick={() => setOpen(r)}>View</button>
                        {r.status === "pending_review" && <>
                          <button className="mini-btn" disabled={!!busy} onClick={() => act(r, "release")}><IconCheck width={13} height={13} /> Release</button>
                          {r.band !== "ready" && <button className="mini-btn" disabled={!!busy} onClick={() => act(r, "override_ready")}><IconChart width={13} height={13} /> Override → Ready</button>}
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="tb-search-scrim" onMouseDown={() => setOpen(null)}>
          <div className="po-modal rv-modal" role="dialog" aria-modal="true" aria-labelledby="air-title" onMouseDown={(e) => e.stopPropagation()}>
            <h3 id="air-title" style={{ margin: 0 }}>{open.name} · {open.score != null ? `${Math.round(open.score)}%` : "—"} · {BAND[open.band] || open.band}</h3>
            <p className="po-muted" style={{ margin: 0 }}>{open.role || "—"} · attempt {open.attempts || 1} · {fmt(open.at)}</p>
            {open.summary && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{open.summary}</p>}
            {open.breakdown && typeof open.breakdown === "object" && (
              <ul className="rv-list">
                {Object.entries(open.breakdown).map(([k, v]) => <li key={k}><span>{k}</span><b>{v}%</b></li>)}
              </ul>
            )}
            <p className="po-muted" style={{ margin: 0 }}>{open.training ? `${open.training} AI-suggested training topic${open.training === 1 ? "" : "s"} attached.` : "No suggested training attached."}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              {open.status === "pending_review" && <>
                {open.band !== "ready" && <button className="btn-outline" disabled={!!busy} onClick={() => { act(open, "override_ready"); setOpen(null); }}>Override → Ready</button>}
                <button className="btn-solid" disabled={!!busy} onClick={() => { act(open, "release"); setOpen(null); }}>Release</button>
              </>}
              <button className="btn-outline" onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
