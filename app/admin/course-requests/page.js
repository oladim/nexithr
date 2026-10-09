"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconX } from "@/components/Icons";

const STATUSES = [
  { v: "new", label: "Received" },
  { v: "reviewing", label: "Under review" },
  { v: "planned", label: "Planned" },
  { v: "available", label: "Now available" },
  { v: "declined", label: "Not planned" },
];
const LABEL = Object.fromEntries(STATUSES.map((s) => [s.v, s.label]));
const CLS = { new: "pending", reviewing: "pending", planned: "info", available: "done", declined: "muted" };

const DEMO = [
  { id: "r1", candidate: "Ada Obi", email: "ada@nexit.africa", role: "Software Development", topic: "Kubernetes for beginners", level: "foundational", message: "I want to move into DevOps.", status: "new", adminNote: "", createdAt: new Date().toISOString() },
  { id: "r2", candidate: "Musa Bello", email: "musa@nexit.africa", role: "Data & Analytics", topic: "Advanced SQL & window functions", level: "intensive", message: "", status: "planned", adminNote: "Scheduled for next cohort.", createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
];

export default function AdminCourseRequests() {
  const { supabaseEnabled } = useAuth();
  const [rows, setRows] = useState(supabaseEnabled ? null : DEMO);
  const [filter, setFilter] = useState("open");
  const [active, setActive] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      try {
        const res = await fetch("/api/admin/course-requests", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) { setErr(data.error || "Couldn't load requests"); setRows([]); return; }
        setRows(data.requests || []);
      } catch { setRows([]); }
    })();
  }, [supabaseEnabled]);

  const shown = useMemo(() => (rows || []).filter((r) =>
    filter === "all" ? true : filter === "open" ? ["new", "reviewing", "planned"].includes(r.status) : r.status === filter), [rows, filter]);

  // Most-requested topics (helps decide what to build next).
  const top = useMemo(() => {
    const m = {};
    (rows || []).forEach((r) => { const k = r.topic.trim().toLowerCase(); m[k] = m[k] || { topic: r.topic, n: 0 }; m[k].n++; });
    return Object.values(m).sort((a, b) => b.n - a.n).slice(0, 6);
  }, [rows]);

  return (
    <>
      <div className="page-head">
        <h1>Course Requests</h1>
        <p>Courses candidates have asked NexIT to offer. Update the status to keep them informed — they&apos;re notified in-app and by email.</p>
      </div>
      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}

      {top.length > 0 && (
        <div className="card pad" style={{ marginBottom: 18 }}>
          <h3 className="card-title" style={{ marginBottom: 10 }}>Most requested</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {top.map((t) => <span key={t.topic} className="cvr-skill have">{t.topic} · {t.n}</span>)}
          </div>
        </div>
      )}

      <div className="rr-top">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["open", "Open"], ...STATUSES.map((s) => [s.v, s.label]), ["all", "All"]].map(([v, l]) => (
            <button key={v} type="button" className="mini-btn" aria-pressed={filter === v} style={filter === v ? { background: "var(--navy)", color: "#fff", borderColor: "var(--navy)" } : undefined} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
        <span className="cvr-count">{shown.length} shown · {(rows || []).length} total</span>
      </div>

      <div className="card pad">
        {rows === null ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>
        ) : shown.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No requests here.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Candidate</th><th>Requested course</th><th>Tier</th><th>Received</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td><b>{r.candidate}</b><div style={{ fontSize: 12, color: "var(--muted)" }}>{r.role}</div></td>
                  <td style={{ whiteSpace: "normal", maxWidth: 320 }}><b>{r.topic}</b>{r.message && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{r.message}</div>}</td>
                  <td style={{ textTransform: "capitalize" }}>{r.level === "any" ? "Any" : r.level}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                  <td><span className={`creq-status ${CLS[r.status]}`}>{LABEL[r.status]}</span></td>
                  <td><button type="button" className="mini-btn" onClick={() => setActive(r)}>Update</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {active && (
        <UpdatePanel
          row={active}
          supabaseEnabled={supabaseEnabled}
          onClose={() => setActive(null)}
          onDone={(status, note) => { setRows((l) => l.map((x) => (x.id === active.id ? { ...x, status, adminNote: note } : x))); setActive(null); }}
        />
      )}
    </>
  );
}

function UpdatePanel({ row, supabaseEnabled, onClose, onDone }) {
  const [status, setStatus] = useState(row.status === "new" ? "reviewing" : row.status);
  const [note, setNote] = useState(row.adminNote || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setErr("");
    if (status === "declined" && !note.trim()) { setErr("Add a short note explaining why — the candidate will see it."); return; }
    setBusy(true);
    if (supabaseEnabled) {
      try {
        const res = await fetch("/api/admin/course-requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: row.id, status, note }) });
        const data = await res.json();
        if (!res.ok) { setErr(data.error || "Couldn't update"); setBusy(false); return; }
      } catch { setErr("Couldn't update"); setBusy(false); return; }
    }
    onDone(status, note.trim());
  };

  return (
    <div className="cvr-scrim" onClick={onClose}>
      <div className="cvr-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="cvr-modal-head">
          <div><h3>{row.topic}</h3><p>{row.candidate} · {row.email}</p></div>
          <button className="cvr-x" onClick={onClose} aria-label="Close"><IconX width={18} height={18} /></button>
        </div>
        {row.message && <p style={{ fontSize: 14, color: "var(--text-2)", marginTop: 0 }}>{row.message}</p>}
        <label className="cv-step-label">Status</label>
        <select className="rr-exp-input" style={{ width: "100%" }} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
        </select>
        <label className="cv-step-label" style={{ marginTop: 12 }}>Note to the candidate {status === "declined" ? "(required)" : "(optional)"}</label>
        <textarea className="cvr-textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={status === "available" ? "e.g. It's now live under Specific Training → Intensive." : "e.g. We're planning this for the next cohort."} />
        {err && <div className="auth-error" style={{ marginTop: 10 }}>{err}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16, flexWrap: "wrap" }}>
          <button className="btn-outline" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-solid" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save & notify candidate"}</button>
        </div>
      </div>
    </div>
  );
}
