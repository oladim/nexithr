"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconChart, IconUser, IconBriefcase, IconRefresh, IconCheck, IconX, IconClock } from "@/components/Icons";

// Demo rows so the page isn't empty without a backend.
const DEMO = [
  { id: "d1", name: "Ada Obi", email: "ada@nexit.africa", targetRole: "Software Development", onBoard: false,
    ai: { attempts: 2, passed: true, lastScore: 88 }, professional: { passed: true, attempts: 1 }, hr: { passed: false, attempts: 0 } },
  { id: "d2", name: "Musa Bello", email: "musa@nexit.africa", targetRole: "Data & Analytics", onBoard: false,
    ai: { attempts: 1, passed: false, lastScore: 72 }, professional: { passed: false, attempts: 0 }, hr: { passed: false, attempts: 0 } },
  { id: "d3", name: "Rose Adeyemi", email: "rose@nexit.africa", targetRole: "Product & Design", onBoard: true,
    ai: { attempts: 1, passed: true, lastScore: 91 }, professional: { passed: true, attempts: 1 }, hr: { passed: true, attempts: 1 } },
];

const STAGE_META = {
  AI: { label: "AI Interview", Icon: IconChart },
  Professional: { label: "Professional", Icon: IconUser },
  HR: { label: "HR", Icon: IconBriefcase },
};

function stageState(row, stage) {
  const s = stage === "AI" ? row.ai : stage === "Professional" ? row.professional : row.hr;
  if (s?.passed) return { cls: "done", text: stage === "AI" && s.lastScore != null ? `Passed · ${s.lastScore}%` : "Passed" };
  if ((s?.attempts ?? 0) > 0) return { cls: "pending", text: stage === "AI" && s.lastScore != null ? `Not passed · ${s.lastScore}%` : "Attempted" };
  return { cls: "idle", text: "Not taken" };
}

export default function AdminInterviews() {
  const { supabaseEnabled } = useAuth();
  const [rows, setRows] = useState(supabaseEnabled ? null : DEMO);
  const [reset, setReset] = useState(null); // { row, stage }
  const [flash, setFlash] = useState("");

  const load = async () => {
    if (!supabaseEnabled) { setRows(DEMO); return; }
    try {
      const res = await fetch("/api/admin/candidates");
      const data = await res.json();
      setRows(res.ok ? data.candidates : []);
    } catch {
      setRows([]);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [supabaseEnabled]);

  // Reflect a reset locally so the table updates without a full reload.
  const applyReset = (id, stage) => {
    setRows((list) =>
      (list || []).map((r) => {
        if (r.id !== id) return r;
        const next = { ...r };
        if (stage === "AI" || stage === "all") next.ai = { attempts: 0, passed: false, lastScore: null };
        if (stage === "Professional" || stage === "all") next.professional = { passed: false, attempts: 0 };
        if (stage === "HR" || stage === "all") { next.hr = { passed: false, attempts: 0 }; next.onBoard = false; }
        return next;
      })
    );
  };

  // Manual admin override: mark a stage passed so the candidate can proceed.
  const advance = async (row, stage) => {
    if (!confirm(`Approve ${row.name}'s ${stage} stage? This marks it passed so they can proceed.`)) return;
    if (supabaseEnabled) {
      try {
        const res = await fetch("/api/admin/advance-stage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId: row.id, stage }),
        });
        const data = await res.json();
        if (!res.ok) { setFlash(data.error || "Couldn't approve stage"); return; }
      } catch { setFlash("Couldn't approve stage"); return; }
    }
    setRows((list) =>
      (list || []).map((r) => {
        if (r.id !== row.id) return r;
        const n = { ...r };
        if (stage === "AI") n.ai = { ...n.ai, passed: true };
        if (stage === "Professional") n.professional = { ...n.professional, passed: true };
        if (stage === "HR") { n.hr = { ...n.hr, passed: true }; n.onBoard = true; }
        return n;
      })
    );
    setFlash(`${row.name}: ${stage} stage approved.`);
    setTimeout(() => setFlash(""), 6000);
  };

  return (
    <>
      <div className="page-head">
        <h1>Interview Manager</h1>
        <p>Assign interviewers to booked Professional and HR interviews, review each candidate&apos;s progress, and reset any stage to let them retake.</p>
      </div>

      {flash && <div className="role-note ok" style={{ marginBottom: 16 }}>{flash}</div>}

      <BookingAssignments supabaseEnabled={supabaseEnabled} onFlash={(m) => { setFlash(m); setTimeout(() => setFlash(""), 6000); }} />

      <div className="card pad">
        {rows === null ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading candidates…</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No candidates yet.</p>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Target role</th>
                <th>AI</th>
                <th>Professional</th>
                <th>HR</th>
                <th>Approve (override)</th>
                <th>Reset &amp; ask to retake</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const anyActivity = r.ai.attempts || r.professional.attempts || r.hr.attempts;
                return (
                  <tr key={r.id}>
                    <td>
                      <b>{r.name}</b>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.email}</div>
                      {r.onBoard && <span className="pill-status done" style={{ marginTop: 4, display: "inline-block" }}>On board</span>}
                    </td>
                    <td>{r.targetRole}</td>
                    {["AI", "Professional", "HR"].map((st) => {
                      const s = stageState(r, st);
                      return <td key={st}><span className={`pill-status ${s.cls === "done" ? "done" : "pending"}`} style={s.cls === "idle" ? { opacity: 0.55 } : undefined}>{s.text}</span></td>;
                    })}
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        <button className="mini-btn" disabled={r.ai.passed} onClick={() => advance(r, "AI")}>AI</button>
                        <button className="mini-btn" disabled={r.professional.passed} onClick={() => advance(r, "Professional")}>Professional</button>
                        <button className="mini-btn" disabled={r.hr.passed} onClick={() => advance(r, "HR")}>HR</button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        <button className="mini-btn" onClick={() => setReset({ row: r, stage: "AI" })}>AI</button>
                        <button className="mini-btn" onClick={() => setReset({ row: r, stage: "Professional" })}>Professional</button>
                        <button className="mini-btn" onClick={() => setReset({ row: r, stage: "HR" })}>HR</button>
                        <button className="mini-btn" disabled={!anyActivity} onClick={() => setReset({ row: r, stage: "all" })} title="Reset all three stages">All</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {reset && (
        <ResetPanel
          row={reset.row}
          stage={reset.stage}
          supabaseEnabled={supabaseEnabled}
          onClose={() => setReset(null)}
          onDone={(stage) => {
            applyReset(reset.row.id, stage);
            setFlash(`${reset.row.name}: ${stage === "all" ? "all interviews" : `${stage} interview`} reset. The candidate has been asked to retake.`);
            setReset(null);
            setTimeout(() => setFlash(""), 6000);
          }}
        />
      )}
    </>
  );
}

function ResetPanel({ row, stage, supabaseEnabled, onClose, onDone }) {
  const label = stage === "all" ? "all interview stages" : `the ${stage === "AI" ? "AI" : stage} interview`;
  const defaultMsg =
    stage === "all"
      ? "Your interview stages have been reset. Please retake your interviews when you're ready."
      : `Your ${stage === "AI" ? "AI" : stage} interview has been reset. Please retake it when you're ready.`;
  const [message, setMessage] = useState(defaultMsg);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const confirm = async () => {
    setErr("");
    if (!supabaseEnabled) { onDone(stage); return; } // demo
    setBusy(true);
    try {
      const res = await fetch("/api/admin/reset-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: row.id, stage, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onDone(stage);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cvr-scrim" onClick={onClose}>
      <div className="cvr-modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="cvr-modal-head">
          <div>
            <h3>Reset {label}</h3>
            <p>{row.name} · {row.email}</p>
          </div>
          <button className="cvr-x" onClick={onClose} aria-label="Close"><IconX width={18} height={18} /></button>
        </div>

        <div style={{ padding: "4px 2px 0" }}>
          <div className="consent-warn" style={{ marginTop: 0 }}>
            <IconClock />
            <span>
              This clears the candidate&apos;s {stage === "all" ? "AI, Professional and HR" : stage} result so they can take it again.
              {(stage === "HR" || stage === "all") ? " Passing HR boards a candidate — resetting HR removes them from the board." : ""}
              {" "}Earlier passed stages are kept{stage === "all" ? " only if not selected here" : ""}.
            </span>
          </div>

          <label className="cv-step-label" style={{ marginTop: 14 }}>Message to candidate</label>
          <textarea
            className="cvr-textarea"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="cvr-hint">Sent as an in-app notification, and by email when an email provider is configured.</p>

          {err && <div className="auth-error" style={{ marginTop: 4 }}>{err}</div>}
        </div>

        <div className="cvr-actions">
          <button className="btn-outline" disabled={busy} onClick={onClose}>Cancel</button>
          <button className="btn-solid" disabled={busy} onClick={confirm} style={{ background: "#ff4d4d", backgroundImage: "none" }}>
            <IconRefresh width={14} height={14} /> {busy ? "Resetting…" : "Reset & ask to retake"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Demo bookings / interviewers so the assignment panel works without a backend.
const DEMO_BOOKINGS = [
  { id: "b1", candidate: "Ada Obi", candidateEmail: "ada@nexit.africa", type: "HR", role: "Software Development", date: "Friday, 9 Oct 2026", time: "10:00 – 10:45", interviewerId: null, interviewer: null },
  { id: "b2", candidate: "Musa Bello", candidateEmail: "musa@nexit.africa", type: "Professional", role: "Data & Analytics", date: "Monday, 12 Oct 2026", time: "14:00 – 14:45", interviewerId: "i1", interviewer: "Paul Tomisin" },
];
const DEMO_INTERVIEWERS = [
  { id: "i1", kind: "Professional", name: "Paul Tomisin" },
  { id: "i2", kind: "Professional", name: "Ngozi Eze" },
  { id: "i3", kind: "HR", name: "Grace Umeh" },
];

// Booked Professional / HR interviews waiting for (or holding) an interviewer.
function BookingAssignments({ supabaseEnabled, onFlash }) {
  const [bookings, setBookings] = useState(supabaseEnabled ? null : DEMO_BOOKINGS);
  const [interviewers, setInterviewers] = useState(supabaseEnabled ? [] : DEMO_INTERVIEWERS);
  const [pick, setPick] = useState({}); // bookingId -> interviewerId
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      try {
        const res = await fetch("/api/admin/interviews", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) { setErr(data.error || "Couldn't load bookings"); setBookings([]); return; }
        setBookings(data.bookings || []); setInterviewers(data.interviewers || []);
      } catch { setBookings([]); }
    })();
  }, [supabaseEnabled]);

  const assign = async (b) => {
    const interviewerId = pick[b.id];
    if (!interviewerId) return;
    setErr(""); setBusy(b.id);
    const chosen = interviewers.find((i) => i.id === interviewerId);
    if (supabaseEnabled) {
      try {
        const res = await fetch("/api/admin/interviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interviewId: b.id, interviewerId }),
        });
        const data = await res.json();
        if (!res.ok) { setErr(data.error || "Couldn't assign"); setBusy(null); return; }
      } catch { setErr("Couldn't assign"); setBusy(null); return; }
    }
    setBookings((list) => (list || []).map((x) => (x.id === b.id ? { ...x, interviewerId, interviewer: chosen?.name || "Interviewer" } : x)));
    setPick((p) => ({ ...p, [b.id]: "" }));
    setBusy(null);
    onFlash(`${chosen?.name || "Interviewer"} assigned to ${b.candidate}'s ${b.type} interview. Both have been notified.`);
  };

  const waiting = (bookings || []).filter((b) => !b.interviewerId).length;

  return (
    <div className="card pad" style={{ marginBottom: 20 }}>
      <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        Booked interviews — assign interviewers
        {waiting > 0 && <span className="pill-status pending">{waiting} awaiting assignment</span>}
      </h3>
      <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "0 0 14px" }}>
        When a candidate books a Professional or HR interview, choose who conducts it. The interviewer and the candidate are both notified with the meeting link.
      </p>
      {err && <div className="auth-error" style={{ marginBottom: 12 }}>{err}</div>}
      {bookings === null ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>No open Professional or HR bookings right now.</p>
      ) : (
        <table className="tbl">
          <thead>
            <tr><th>Candidate</th><th>Interview</th><th>When</th><th>Interviewer</th><th>Assign</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const options = interviewers.filter((i) => i.kind === b.type);
              return (
                <tr key={b.id}>
                  <td><b>{b.candidate}</b><div style={{ fontSize: 12, color: "var(--muted)" }}>{b.candidateEmail}</div></td>
                  <td>{b.type}<div style={{ fontSize: 12, color: "var(--muted)" }}>{b.role}</div></td>
                  <td>{b.date}<div style={{ fontSize: 12, color: "var(--muted)" }}>{b.time}</div></td>
                  <td>
                    {b.interviewer
                      ? <span className="pill-status done">{b.interviewer}</span>
                      : <span className="pill-status pending">Not assigned</span>}
                  </td>
                  <td>
                    {options.length === 0 ? (
                      <span style={{ fontSize: 12.5, color: "var(--muted)" }}>No approved {b.type} interviewers yet</span>
                    ) : (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <select
                          value={pick[b.id] || ""}
                          onChange={(e) => setPick((p) => ({ ...p, [b.id]: e.target.value }))}
                          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--line, #e2e6ee)", fontSize: 13, minWidth: 170, background: "#fff" }}
                        >
                          <option value="">{b.interviewer ? "Change to…" : `Choose ${b.type} interviewer`}</option>
                          {options.filter((o) => o.id !== b.interviewerId).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                        <button className="mini-btn" disabled={!pick[b.id] || busy === b.id} onClick={() => assign(b)}>
                          {busy === b.id ? "Saving…" : b.interviewer ? "Re-assign" : "Assign"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
