"use client";

import { useEffect, useState } from "react";
import { IconX, IconCheck } from "@/components/Icons";

const STATUSES = ["Applied", "Shortlisted", "Interviewing", "Hired", "Rejected"];

// Modal listing applicants for a job, with per-applicant status control.
// `demo` renders sample data without hitting the API.
export default function ApplicantsPanel({ job, onClose, demo }) {
  const [applicants, setApplicants] = useState(demo ? DEMO : null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (demo) return;
    (async () => {
      try {
        const res = await fetch(`/api/jobs/applicants?jobId=${encodeURIComponent(job.id)}`);
        const data = await res.json();
        if (!res.ok) { setErr(data.error || "Couldn't load applicants"); setApplicants([]); return; }
        setApplicants(data.applicants);
      } catch { setErr("Couldn't load applicants"); setApplicants([]); }
    })();
  }, [job?.id, demo]);

  const setStatus = async (a, status) => {
    setBusy(a.id);
    if (!demo) {
      try {
        const res = await fetch("/api/jobs/applicants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicationId: a.id, status }) });
        const data = await res.json();
        if (!res.ok) { setErr(data.error || "Couldn't update"); setBusy(""); return; }
      } catch { setErr("Couldn't update"); setBusy(""); return; }
    }
    setApplicants((list) => list.map((x) => (x.id === a.id ? { ...x, status } : x)));
    setBusy("");
  };

  return (
    <div className="cvr-scrim" onClick={onClose}>
      <div className="cvr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cvr-modal-head">
          <div>
            <h3>Applicants — {job?.title}</h3>
            <p>{applicants === null ? "Loading…" : `${applicants.length} applicant${applicants.length === 1 ? "" : "s"}`}</p>
          </div>
          <button className="cvr-x" onClick={onClose} aria-label="Close"><IconX width={18} height={18} /></button>
        </div>

        {err && <div className="auth-error" style={{ margin: "0 0 10px" }}>{err}</div>}

        {applicants === null ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading applicants…</p>
        ) : applicants.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No applicants yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {applicants.map((a) => (
              <div key={a.id} style={{ border: "1px solid #eef1f6", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <b>{a.name}</b>{a.onBoard && <span className="pill-status done" style={{ marginLeft: 8 }}>Board-ready</span>}
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{a.email}{a.country ? ` · ${a.country}` : ""}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{a.role}{a.experience ? ` · ${a.experience}` : ""}</div>
                    {a.skills?.length > 0 && <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>{a.skills.slice(0, 8).map((s) => <span key={s} className="cvr-skill have" style={{ fontSize: 11 }}>{s}</span>)}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`pill-status ${a.status === "Hired" || a.status === "Shortlisted" ? "done" : a.status === "Rejected" ? "pending" : "pending"}`}>{a.status}</span>
                    <div style={{ marginTop: 8 }}>
                      <select className="rr-exp-input" value={a.status} disabled={busy === a.id} onChange={(e) => setStatus(a, e.target.value)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cvr-actions">
          <button className="btn-solid" onClick={onClose}><IconCheck width={14} height={14} /> Done</button>
        </div>
      </div>
    </div>
  );
}

const DEMO = [
  { id: "a1", name: "Ada Obi", email: "ada@nexit.africa", country: "Nigeria", role: "Software Development", experience: "5 Years", skills: ["React", "Node", "SQL"], onBoard: true, status: "Applied" },
  { id: "a2", name: "Musa Bello", email: "musa@nexit.africa", country: "Nigeria", role: "Data & Analytics", experience: "3 Years", skills: ["Python", "SQL"], onBoard: false, status: "Shortlisted" },
];
