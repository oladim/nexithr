"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadCvSubmissions, cvSignedUrl, loadRoleRequirements } from "@/lib/db";
import { computeCvMatch, DEFAULT_REQS_BY_KEY } from "@/lib/cvMatch";
import { IconFileText, IconDownload, IconCheck, IconRefresh, IconX, IconBolt } from "@/components/Icons";

// Demo submissions so the queue isn't empty without a backend.
const DEMO = [
  { id: "d1", candidateId: "d1", name: "Ada Obi", email: "ada@nexit.africa", roleKey: "software", targetRole: "Software Development", skills: ["React", "Node js", "SQL"], experience: "5 Years", fileName: "Ada_Obi_CV.pdf", industry: "Software", jobType: "Full-time", status: "Pending review", reviewNote: null },
  { id: "d2", candidateId: "d2", name: "Musa Bello", email: "musa@nexit.africa", roleKey: "data", targetRole: "Data & Analytics", skills: ["Figma", "Research"], experience: "3 Years", fileName: "Musa_Bello_CV.pdf", industry: "Product & Design", jobType: "Full-time", status: "Pending review", reviewNote: null },
  { id: "d3", candidateId: "d3", name: "Rose Adeyemi", email: "rose@nexit.africa", roleKey: "product", targetRole: "Product & Design", skills: ["Figma", "Prototyping", "User Research", "Design Systems"], experience: "4 Years", fileName: "Rose_Adeyemi_CV.pdf", industry: "Product & Design", jobType: "Contract", status: "Approved", reviewNote: "Great fit — advanced to AI interview." },
];

const STATUS_CLASS = { "Approved": "done", "Rejected": "failed", "Changes requested": "pending", "Pending review": "pending", "Level suggested": "approved" };

// Note templates — the note changes with the decision the reviewer picks.
const list = (a, n = 5) => (a || []).slice(0, n).join(", ");
function decisionNote(decision, { match, role, suggestion }) {
  const matched = list(match?.matched, 4);
  const missing = list(match?.missing, 5);
  switch (decision) {
    case "approve":
      return `Thanks for applying for ${role}. Your CV meets what we look for at this level${matched ? ` — in particular ${matched}` : ""}. You can now take your AI interview. Good luck!`;
    case "level":
      return `Thanks for applying for ${role}. From your CV, you clearly meet the requirements for ${suggestion?.title}` +
        `${suggestion?.reason ? `: ${suggestion.reason.replace(/\.$/, "")}` : ""}.` +
        ` For ${role} we'd expect to see more evidence of ${missing || "the scope and ownership expected at that level"}.` +
        ` We suggest starting at ${suggestion?.title}. If you accept, your CV is approved at that level and you can take your AI interview straight away. If you'd rather keep ${role}, choose "Keep my level" and our team will review your CV again.`;
    case "changes":
      return `Thanks for your CV. Before we can approve it for ${role}, please update it to show clear evidence of ${missing || "the key skills for this role"}. For each, add the project or job where you used it, the tools involved and the result. Then upload the updated CV and we'll review it again.`;
    case "reject":
      return `Thank you for applying for ${role}. We're unable to approve your CV at this time — the role needs ${missing || "skills and experience"} that your CV doesn't currently show. You're welcome to choose a level or role that better matches your background, or build these skills with our training, then submit again.`;
    default:
      return "";
  }
}
const DECISIONS = [
  { key: "approve", label: "Approve", status: "Approved" },
  { key: "level", label: "Suggest lower level", status: "Level suggested" },
  { key: "changes", label: "Request changes", status: "Changes requested" },
  { key: "reject", label: "Reject", status: "Rejected" },
];

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
                  <td>
                    <span className={`pill-status ${STATUS_CLASS[s.status] || "pending"}`}>{s.status}</span>
                    {s.status === "Pending review" && s.levelResponse === "declined" && <div className="cvr-tag">Kept their level — decide</div>}
                    {s.status === "Approved" && s.levelResponse === "accepted" && <div className="cvr-tag ok">Accepted suggested level</div>}
                  </td>
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

  // The decision drives the note: picking a decision rewrites the note from
  // its template (using the AI read when available). Edits are kept until the
  // decision changes.
  const suggestion = ai?.levelSuggestion || null;
  const initialDecision = (baseMatch.score ?? 0) >= 70 ? "approve" : "changes";
  const [decision, setDecision] = useState(initialDecision);
  const [note, setNote] = useState(sub.reviewNote || decisionNote(initialDecision, { match: baseMatch, role: sub.targetRole }));
  const [edited, setEdited] = useState(!!sub.reviewNote);
  const pickDecision = (d) => {
    setDecision(d); setEdited(false);
    setNote(decisionNote(d, { match, role: sub.targetRole, suggestion }));
  };
  // When the AI read arrives, re-draft the note (unless the reviewer edited it)
  // and pre-select the level suggestion if the CV fits a lower level.
  useEffect(() => {
    if (!ai) return;
    const d = ai.levelSuggestion ? "level" : (ai.score ?? 0) >= 70 ? "approve" : decision === "level" ? "changes" : decision;
    if (!edited) { setDecision(d); setNote(decisionNote(d, { match: ai, role: sub.targetRole, suggestion: ai.levelSuggestion })); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai]);
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
    if ((status === "Rejected" || status === "Changes requested" || status === "Level suggested") && !finalNote) {
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
        body: JSON.stringify({ cvId: sub.id, candidateId: sub.candidateId, status, note: finalNote, suggestedRole: status === "Level suggested" ? suggestion?.roleKey : undefined }),
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
          {ai?.levelFit && (
            <div className="cvr-levels">
              <div className="cvr-skill-label">Level fit (AI read)</div>
              <div className="cvr-skills">
                {["junior", "mid", "senior"].filter((l) => ai.levelFit[l]).map((l) => (
                  <span key={l} className={`cvr-skill ${ai.levelFit[l] === "meets" ? "have" : ai.levelFit[l] === "partial" ? "part" : "miss"}`}>
                    {l === "mid" ? "Mid-level" : l[0].toUpperCase() + l.slice(1)}: {ai.levelFit[l]}{sub.roleKey?.endsWith("-" + l) ? " · applied" : ""}
                  </span>
                ))}
              </div>
              {ai.levelReason && <p className="cvr-level-why">{ai.levelReason}</p>}
              {suggestion && (
                <div className="cvr-level-sug">
                  <b>Suggest {suggestion.title}?</b> The CV meets this level but not the one applied for. The candidate can accept (level changes, CV approved) or keep their level.
                </div>
              )}
            </div>
          )}
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
            <label className="cv-step-label">Decision</label>
            <div className="cvr-decisions" role="radiogroup" aria-label="Decision">
              {DECISIONS.map((d) => {
                const disabled = d.key === "level" && !suggestion;
                return (
                  <button key={d.key} type="button" role="radio" aria-checked={decision === d.key} disabled={disabled}
                    className={`cvr-dec ${decision === d.key ? "on" : ""} ${d.key}`} onClick={() => pickDecision(d.key)}
                    title={disabled ? "Available when the AI read shows the CV meets a lower level of this role" : ""}>
                    {d.key === "level" && suggestion ? `Suggest ${suggestion.title.replace(/^.*\((.*)\)$/, "$1")}` : d.label}
                  </button>
                );
              })}
            </div>
            <label className="cv-step-label" style={{ marginTop: 10 }}>Note to candidate</label>
            <textarea
              className="cvr-textarea"
              rows={7}
              value={note}
              onChange={(e) => { setNote(e.target.value); setEdited(true); }}
            />
            <p className="cvr-hint">Written for the decision you pick{ai ? " using the AI read" : ""} — edit as needed. The candidate receives it as a notification and by email.{!suggestion && supabaseEnabled ? " Run “Read the CV with AI” to check whether a lower level fits better." : ""}</p>
          </div>
        </div>

        {err && <div className="auth-error" style={{ marginTop: 4 }}>{err}</div>}
        {msg && <div className="role-note ok" style={{ marginTop: 4 }}>{msg}</div>}

        <div className="cvr-actions">
          <button className="btn-outline" disabled={busy} onClick={onClose}>Cancel</button>
          <button className={decision === "reject" ? "btn-decline" : "btn-solid"} disabled={busy || (decision === "level" && !suggestion)}
            onClick={() => submit(DECISIONS.find((d) => d.key === decision).status)}>
            {decision === "approve" ? <IconCheck width={14} height={14} /> : decision === "reject" ? <IconX width={14} height={14} /> : <IconRefresh width={14} height={14} />}
            {busy ? " Saving…" : decision === "approve" ? " Approve & notify" : decision === "reject" ? " Reject & notify" : decision === "level" ? ` Send ${suggestion?.title || "level"} suggestion` : " Request changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
