"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconPlus, IconCheck } from "@/components/Icons";

const STATUS = {
  new: { label: "Received", cls: "pending" },
  reviewing: { label: "Under review", cls: "pending" },
  planned: { label: "Planned", cls: "info" },
  available: { label: "Now available", cls: "done" },
  declined: { label: "Not planned", cls: "muted" },
};

/**
 * "Request a course" — a candidate tells NexIT which course they'd like us to
 * offer. Shows the form plus the status of their earlier requests.
 */
export default function CourseRequest() {
  const { supabaseEnabled } = useAuth();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(supabaseEnabled ? null : []);
  const [form, setForm] = useState({ topic: "", level: "any", message: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    if (!supabaseEnabled) return;
    fetch("/api/course-requests", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setList(Array.isArray(d.requests) ? d.requests : []))
      .catch(() => setList([]));
  }, [supabaseEnabled]);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    if (form.topic.trim().length < 3) { setErr("Tell us which course or topic you'd like."); return; }
    setBusy(true);
    let row = { id: `local_${Date.now()}`, ...form, status: "new", created_at: new Date().toISOString() };
    if (supabaseEnabled) {
      try {
        const res = await fetch("/api/course-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const data = await res.json();
        if (!res.ok) { setErr(data.error || "Couldn't send your request"); setBusy(false); return; }
        row = data.request;
      } catch { setErr("Couldn't send your request"); setBusy(false); return; }
    }
    setList((l) => [row, ...(l || [])]);
    setForm({ topic: "", level: "any", message: "" });
    setOk("Request sent — we'll notify you as soon as we review it.");
    setOpen(false);
    setBusy(false);
  };

  return (
    <div className="card pad creq" style={{ marginTop: 20 }}>
      <div className="creq-head">
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>Can&apos;t find the course you need?</h3>
          <p>Tell us what you&apos;d like to learn. Our team reviews every request and lets you know when it&apos;s planned or available.</p>
        </div>
        {!open && (
          <button type="button" className="btn-solid" onClick={() => { setOpen(true); setOk(""); }}>
            <IconPlus width={14} height={14} /> Request a course
          </button>
        )}
      </div>

      {ok && <div className="role-note ok" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}><IconCheck width={14} height={14} /><span>{ok}</span></div>}

      {open && (
        <form onSubmit={submit} className="creq-form">
          <label className="cv-step-label" htmlFor="creq-topic">Course or topic</label>
          <input id="creq-topic" className="rr-exp-input" value={form.topic} maxLength={160} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Kubernetes for beginners, Advanced SQL, Product analytics" autoFocus />

          <label className="cv-step-label" htmlFor="creq-level">Preferred tier</label>
          <select id="creq-level" className="rr-exp-input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            <option value="any">No preference</option>
            <option value="foundational">Foundational</option>
            <option value="intensive">Intensive</option>
          </select>

          <label className="cv-step-label" htmlFor="creq-msg">Anything else? <span style={{ fontWeight: 400 }}>(optional)</span></label>
          <textarea id="creq-msg" className="cvr-textarea" rows={3} maxLength={1500} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What you hope to achieve, your current level, preferred schedule…" />

          {err && <div className="auth-error" style={{ marginTop: 10 }}>{err}</div>}
          <div className="creq-actions">
            <button type="button" className="btn-outline" onClick={() => { setOpen(false); setErr(""); }} disabled={busy}>Cancel</button>
            <button type="submit" className="btn-solid" disabled={busy || form.topic.trim().length < 3}>{busy ? "Sending…" : "Send request"}</button>
          </div>
        </form>
      )}

      {list && list.length > 0 && (
        <div className="creq-list">
          <div className="creq-list-title">Your requests</div>
          {list.map((r) => {
            const st = STATUS[r.status] || STATUS.new;
            return (
              <div className="creq-item" key={r.id}>
                <div style={{ minWidth: 0 }}>
                  <b>{r.topic}</b>
                  <span className="creq-meta">
                    {r.level === "any" ? "Any tier" : `${r.level[0].toUpperCase()}${r.level.slice(1)}`} · {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {r.admin_note && <p className="creq-note"><b>NexIT:</b> {r.admin_note}</p>}
                </div>
                <span className={`creq-status ${st.cls}`}>{st.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
