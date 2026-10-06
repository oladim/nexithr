"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadCvSubmissions, cvSignedUrl, loadRoleRequirements } from "@/lib/db";
import { computeCvMatch, suggestedNote, DEFAULT_REQS_BY_KEY } from "@/lib/cvMatch";
import { IconFileText, IconDownload, IconCheck, IconRefresh, IconX, IconBolt } from "@/components/Icons";

// Demo submissions so the queue isn't empty without a backend.
const DEMO = [
  { id: "d1", candidateId: "d1", name: "Ada Obi", email: "ada@nexit.africa", roleKey: "software", targetRole: "Software Development", skills: ["React", "Node js", "SQL"], experience: "5 Years", fileName: "Ada_Obi_CV.pdf", industry: "Software", jobType: "Full-time", status: "Pending review", reviewNote: null },
  { id: "d2", candidateId: "d2", name: "Musa Bello", email: "musa@nexit.africa", roleKey: "data", targetRole: "Data & Analytics", skills: ["Figma", "Research"], experience: "3 Years", fileName: "Musa_Bello_CV.pdf", industry: "Product & Design", jobType: "Full-time", status: "Pending review", reviewNote: null },
  { id: "d3", candidateId: "d3", name: "Rose Adeyemi", email: "rose@nexit.africa", roleKey: "product", targetRole: "Product & Design", skills: ["Figma", "Prototyping", "User Research", "Design Systems"], experience: "4 Years", fileName: "Rose_Adeyemi_CV.pdf", industry: "Product & Design", jobType: "Contract", status: "Approved", reviewNote: "Great fit — advanced to AI interview." },
];

const STATUS_CLASS = { "Approved": "done", "Rejected": "pending", "Changes requested": "pending", "Pending review": "pending" };

export default function CvReviews() {
  const { supabaseEnabled } = useAuth();
  const [subs, setSubs] = useState(supabaseEnabled ? null : DEMO);
  const [reqs, setReqs] = useState(DEFAULT_REQS_BY_KEY);
  const [active, setActive] = useState(null); // the submission being reviewed

  const load = async () => {
    if (!supabaseEnabled) { setSubs(DEMO); return; }
    const sb = getBrowserSupabase();
    if (!sb) return;
    setSubs(await loadCvSubmissions(sb));
    const { byKey } = await loadRoleRequirements(sb);
    if (Object.keys(byKey).length) setReqs(byKey);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [supabaseEnabled]);

  const onReviewed = (id, status, note) =>
    setSubs((list) => list.map((s) => (s.id === id ? { ...s, status, reviewNote: note } : s)));

  const pending = (subs || []).filter((s) => s.status === "Pending review").length;

  return (
    <>
      <div className="page-head">
        <h1>CV Reviews</h1>
        <p>Review submitted CVs against the candidate&apos;s target role. Approve, request changes, or reject with a note the candidate receives.</p>
      </div>

      <div className="cvr-count">{pending} awaiting review · {(subs || []).length} total</div>

      <div className="card pad">
        {subs === null ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading submissions…</p>
        ) : subs.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No CVs submitted yet.</p>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Candidate</th><th>Target role</th><th>CV file</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td>
                    <b>{s.name}</b>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.email}</div>
                  </td>
                  <td>{s.targetRole}</td>
                  <td><span className="cvr-file"><IconFileText width={15} height={15} /> {s.fileName}</span></td>
                  <td><span className={`pill-status ${STATUS_CLASS[s.status] || "pending"}`}>{s.status}</span></td>
                  <td><button className="mini-btn" onClick={() => setActive(s)}>Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {active && (
        <ReviewPanel
          sub={active}
          roleReq={reqs[active.roleKey]}
          supabaseEnabled={supabaseEnabled}
          onClose={() => setActive(null)}
          onDone={(status, note) => { onReviewed(active.id, status, note); setActive(null); }}
        />
      )}
    </>
  );
}

function ReviewPanel({ sub, roleReq, supabaseEnabled, onClose, onDone }) {
  const expYears = parseInt(String(sub.experience || "").replace(/\D/g, ""), 10) || null;
  const baseMatch = computeCvMatch(sub.skills || [], roleReq, { experienceYears: expYears });

  // The shown analysis is the AI read once run, else the instant skills match.
  const [ai, setAi] = useState(null);
  const [aiNote, setAiNote] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const match = ai || baseMatch;
  const scoreClass = match.score == null ? "none" : match.score >= 70 ? "strong" : match.score >= 40 ? "partial" : "weak";

  const runAiRead = async () => {
    setAnalyzing(true); setAiNote("");
    try {
      const res = await fetch("/api/admin/cv-analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId: sub.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAi(data.analysis);
      setAiNote(data.note || "");
    } catch (e) {
      setAiNote(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Pre-fill the note: an existing review note if any, else the suggestion.
  const [note, setNote] = useState(sub.reviewNote || suggestedNote(baseMatch, sub.targetRole));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [fileUrl, setFileUrl] = useState(null);

  // Fetch a signed URL to view the actual file (real mode).
  useEffect(() => {
    if (!supabaseEnabled || !sub.filePath) return;
    (async () => {
      const sb = getBrowserSupabase();
      if (sb) setFileUrl(await cvSignedUrl(sb, sub.filePath));
    })();
  }, [supabaseEnabled, sub.filePath]);

  const submit = async (status, overrideNote) => {
    setErr(""); setMsg("");
    const finalNote = (overrideNote ?? note).trim();
    if ((status === "Rejected" || status === "Changes requested") && !finalNote) {
      setErr("Please add a note explaining what the candidate should fix.");
      return;
    }
    if (!supabaseEnabled) {
      onDone(status, finalNote || null);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/cv-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId: sub.id, candidateId: sub.candidateId, status, note: finalNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onDone(status, finalNote || null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cvr-scrim" onClick={onClose}>
      <div className="cvr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cvr-modal-head">
          <div>
            <h3>Review CV — {sub.name}</h3>
            <p>{sub.email}</p>
          </div>
          <button className="cvr-x" onClick={onClose} aria-label="Close"><IconX width={18} height={18} /></button>
        </div>

        {/* CV analysis against the role's required skillset */}
        <div className="cvr-analysis">
          <div className="cvr-analysis-head">
            <b>
              <IconBolt width={15} height={15} /> CV analysis — {sub.targetRole}
              <span className={`cvr-source ${match.source === "ai" ? "ai" : "rules"}`}>
                {match.source === "ai" ? "AI read of CV" : "skills match"}
              </span>
            </b>
            <span className={`cvr-score ${scoreClass}`}>
              {match.score == null ? match.verdict : `${match.verdict} · ${match.score}%`}
            </span>
          </div>
          {match.score != null && (
            <div className="cvr-meter"><i className={scoreClass} style={{ width: `${match.score}%` }} /></div>
          )}
          {match.hasRole && (
            <>
              {match.matched.length > 0 && <>
                <div className="cvr-skill-label">Skills present</div>
                <div className="cvr-skills">{match.matched.map((s) => <span className="cvr-skill have" key={s}>✓ {s}</span>)}</div>
              </>}
              {match.missing.length > 0 && <>
                <div className="cvr-skill-label">Missing for this role</div>
                <div className="cvr-skills">{match.missing.map((s) => <span className="cvr-skill miss" key={s}>✕ {s}</span>)}</div>
              </>}
            </>
          )}
          <p>{match.comment}</p>
          {roleReq?.description && (
            <details className="cvr-brief">
              <summary>Role brief</summary>
              <p>{roleReq.description}</p>
            </details>
          )}
          {supabaseEnabled && (
            <div className="cvr-ai-run">
              <button className="btn-outline" onClick={runAiRead} disabled={analyzing}>
                <IconBolt width={14} height={14} /> {analyzing ? "Reading the CV…" : ai ? "Re-read the CV with AI" : "Read the CV with AI"}
              </button>
              {aiNote && <span className="cvr-ai-note">{aiNote}</span>}
            </div>
          )}
        </div>

        {/* CV file preview (opens inline instead of “nothing”) */}
        <div className="cvr-preview">
          {fileUrl ? (
            <iframe src={fileUrl} title="CV preview" />
          ) : (
            <div className="cvr-preview-empty">
              <IconFileText width={26} height={26} />
              <div>
                <b>{sub.fileName}</b>
                <div style={{ fontSize: 12 }}>
                  {supabaseEnabled ? "No file stored for this submission." : "Connect Supabase to preview the uploaded PDF here."}
                </div>
                {supabaseEnabled && (
                  <button
                    className="btn-outline"
                    style={{ marginTop: 12, display: "inline-flex" }}
                    disabled={busy}
                    onClick={() => submit("Changes requested", "We couldn't find your CV file on record. Please re-upload your CV on the CV Upload page so we can review it.")}
                  >
                    <IconRefresh width={14} height={14} /> Ask candidate to re-upload
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="cvr-grid">
          <div className="cvr-meta">
            <div className="cvr-row"><span>Target role</span><b>{sub.targetRole}</b></div>
            <div className="cvr-row"><span>Preferred industry</span><b>{sub.industry || "—"}</b></div>
            <div className="cvr-row"><span>Experience</span><b>{sub.experience || "—"}</b></div>
            <div className="cvr-row"><span>Job type</span><b>{sub.jobType || "—"}</b></div>
            {fileUrl && (
              <a className="btn-outline" style={{ marginTop: 12, display: "inline-flex" }} href={fileUrl} target="_blank" rel="noreferrer">
                <IconDownload width={15} height={15} /> Open full file
              </a>
            )}
          </div>

          <div className="cvr-note">
            <label className="cv-step-label">Note to candidate</label>
            <textarea
              className="cvr-textarea"
              rows={6}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <p className="cvr-hint">Pre-filled from the analysis — edit as needed. The candidate receives this as a notification, and by email when an email provider is configured.</p>
          </div>
        </div>

        {err && <div className="auth-error" style={{ marginTop: 4 }}>{err}</div>}
        {msg && <div className="role-note ok" style={{ marginTop: 4 }}>{msg}</div>}

        <div className="cvr-actions">
          <button className="btn-decline" disabled={busy} onClick={() => submit("Rejected")}>
            <IconX width={14} height={14} /> Reject
          </button>
          <button className="btn-outline" disabled={busy} onClick={() => submit("Changes requested")}>
            <IconRefresh width={14} height={14} /> Request changes
          </button>
          <button className="btn-solid" disabled={busy} onClick={() => submit("Approved")}>
            <IconCheck width={14} height={14} /> {busy ? "Saving…" : "Approve & notify"}
          </button>
        </div>
      </div>
    </div>
  );
}
