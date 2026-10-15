"use client";

import { useEffect, useMemo, useState } from "react";
import { AREAS, ROLES, LEVELS, areaOf, baseKeyOf, levelOf } from "@/lib/roleCatalog";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadCvSubmissions, cvSignedUrl, loadRoleRequirements } from "@/lib/db";
import { computeCvMatch, DEFAULT_REQS_BY_KEY } from "@/lib/cvMatch";
import { IconFileText, IconDownload, IconCheck, IconRefresh, IconX, IconBolt, IconSearch, IconTrash } from "@/components/Icons";
import RemindButton from "@/components/admin/RemindButton";

// Demo submissions so the queue isn't empty without a backend.
const DEMO = [
  { id: "d1", candidateId: "d1", name: "Ada Obi", email: "ada@nexit.africa", roleKey: "software-frontend-mid", targetRole: "Frontend Developer (Mid-level)", skills: ["React", "TypeScript", "CSS"], experience: "5 Years", fileName: "Ada_Obi_CV.pdf", industry: "Software", jobType: "Full-time", status: "Pending review", reviewNote: null, uploadedAt: "2026-10-12T09:00:00Z" },
  { id: "d2", candidateId: "d2", name: "Musa Bello", email: "musa@nexit.africa", roleKey: "data-analyst-senior", targetRole: "Data Analyst (Senior)", skills: ["SQL", "Excel"], experience: "3 Years", fileName: "Musa_Bello_CV.docx", industry: "Data & Analytics", jobType: "Full-time", status: "Pending review", reviewNote: null, uploadedAt: "2026-10-11T15:20:00Z", revision: 2, previousStatus: "Changes requested", previousNote: "Please add the dashboards you built and the tools you used (SQL, Power BI)." },
  { id: "d3", candidateId: "d3", name: "Rose Adeyemi", email: "rose@nexit.africa", roleKey: "product-uiux-mid", targetRole: "UI/UX Designer (Mid-level)", skills: ["Figma", "Prototyping", "User Research", "Design Systems"], experience: "4 Years", fileName: "Rose_Adeyemi_CV.pdf", industry: "Product & Design", jobType: "Contract", status: "Approved", reviewNote: "Great fit — advanced to AI interview.", uploadedAt: "2026-10-08T11:00:00Z" },
  { id: "d4", candidateId: "d4", name: "Chidi Okeke", email: "chidi@nexit.africa", roleKey: "support-sysadmin-mid", targetRole: "Systems Administrator (Mid-level)", skills: ["Linux", "Bash", "Active Directory"], experience: "2 Years", fileName: "Chidi_Okeke_CV.pdf", industry: "IT Support", jobType: "Full-time", status: "Level suggested", reviewNote: null, uploadedAt: "2026-10-10T08:30:00Z" },
  { id: "d5", candidateId: "d5", name: "Fatima Sani", email: "fatima@nexit.africa", roleKey: "security-soc-junior", targetRole: "SOC Analyst (Junior)", skills: ["SIEM", "Networking"], experience: "1 Year", fileName: "Fatima_Sani_CV.pdf", industry: "Cybersecurity", jobType: "Full-time", status: "Changes requested", reviewNote: "Add your lab projects.", uploadedAt: "2026-10-09T13:10:00Z" },
  { id: "d6", candidateId: "d3", name: "Rose Adeyemi", email: "rose@nexit.africa", roleKey: "product-research-mid", activeRole: "product-uiux-mid", targetRole: "UX Researcher (Mid-level)", skills: ["User Research"], experience: "4 Years", fileName: "Rose_Adeyemi_Research_CV.pdf", industry: "Product & Design", jobType: "Contract", status: "Pending review", reviewNote: null, uploadedAt: "2026-10-13T10:00:00Z" },
];

const STATUSES = ["Pending review", "Level suggested", "Changes requested", "Approved", "Rejected"];
const norm = (t) => String(t || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

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
  const onDeleted = (id) => setSubs((list) => list.filter((s) => s.id !== id));

  // ---- search & filters ----
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");
  const [base, setBase] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");
  const bases = useMemo(() => {
    const m = new Map();
    ROLES.filter((r) => !area || r.area === area).forEach((r) => { if (!m.has(r.base)) m.set(r.base, r.baseTitle); });
    return [...m.entries()];
  }, [area]);
  const filtered = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return (subs || []).filter((s) => {
      if (status && s.status !== status) return false;
      if (area && areaOf(s.roleKey) !== area) return false;
      if (base && baseKeyOf(s.roleKey) !== base) return false;
      if (level && levelOf(s.roleKey) !== level) return false;
      if (words.length) {
        const hay = norm(`${s.name} ${s.email} ${s.fileName} ${s.targetRole}`);
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
  }, [subs, q, area, base, level, status]);
  const counts = useMemo(() => {
    const c = {};
    (subs || []).forEach((s) => { c[s.status] = (c[s.status] || 0) + 1; });
    return c;
  }, [subs]);
  const anyFilter = q || area || base || level || status;
  const clear = () => { setQ(""); setArea(""); setBase(""); setLevel(""); setStatus(""); };

  const pending = counts["Pending review"] || 0;

  return (
    <>
      <div className="page-head">
        <h1>CV Reviews</h1>
        <p>Review submitted CVs against the candidate&apos;s target role. Approve, request changes, or reject with a note the candidate receives.</p>
      </div>

      <div className="cvr-toolbar">
        <label className="cvr-search">
          <IconSearch width={16} height={16} />
          <input type="search" placeholder="Search candidate name, email or file…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search CVs" />
        </label>
        <select value={area} onChange={(e) => { setArea(e.target.value); setBase(""); }} aria-label="Area">
          <option value="">All areas</option>
          {AREAS.map((a) => <option key={a.key} value={a.key}>{a.title}</option>)}
        </select>
        <select value={base} onChange={(e) => setBase(e.target.value)} aria-label="Role">
          <option value="">All roles</option>
          {bases.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
          <option value="">All levels</option>
          {LEVELS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
        </select>
      </div>
      <div className="cvr-chips" role="tablist" aria-label="Status">
        <button role="tab" aria-selected={!status} className={`cvr-chip ${!status ? "on" : ""}`} onClick={() => setStatus("")}>All <i>{(subs || []).length}</i></button>
        {STATUSES.map((st) => (
          <button role="tab" key={st} aria-selected={status === st} className={`cvr-chip ${status === st ? "on" : ""}`} onClick={() => setStatus(st)}>
            {st} <i>{counts[st] || 0}</i>
          </button>
        ))}
        <span className="cvr-latest">One CV per candidate &amp; role — a new upload replaces the old one</span>
      </div>

      <div className="cvr-count">
        {pending} awaiting review · showing {filtered.length} of {(subs || []).length}
        {anyFilter && <button className="link-btn" style={{ marginLeft: 8 }} onClick={clear}>Clear filters</button>}
      </div>

      <div className="card pad">
        {subs === null ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading submissions…</p>
        ) : subs.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No CVs submitted yet.</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No CVs match these filters.</p>
        ) : (
          <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr><th>Candidate</th><th>Target role</th><th>CV file</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <b>{s.name}</b>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.email}</div>
                  </td>
                  <td>
                    {s.targetRole}
                    {s.activeRole && s.roleKey && s.activeRole !== s.roleKey && <div className="cvr-tag">Not their active role</div>}
                  </td>
                  <td>
                    <span className="cvr-file"><IconFileText width={15} height={15} /> {s.fileName}</span>
                    {s.uploadedAt && <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{new Date(s.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>}
                  </td>
                  <td>
                    <span className={`pill-status ${STATUS_CLASS[s.status] || "pending"}`}>{s.status}</span>
                    {s.status === "Pending review" && s.levelResponse === "declined" && <div className="cvr-tag">Kept their level — decide</div>}
                    {s.revision > 1 && <div className="cvr-tag resub" title={s.previousNote || ""}>Resubmitted · v{s.revision}{s.previousStatus ? ` (was ${s.previousStatus})` : ""}</div>}
                    {s.status === "Approved" && s.levelResponse === "accepted" && <div className="cvr-tag ok">Accepted suggested level</div>}
                  </td>
                  <td>
                    <div className="cvr-row-actions">
                      <button className="mini-btn" onClick={() => setActive(s)}>Review</button>
                      <RemindButton candidateId={s.candidateId} name={s.name} supabaseEnabled={supabaseEnabled} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {active && (
        <ReviewPanel
          sub={active}
          roleReq={reqs[active.roleKey]}
          supabaseEnabled={supabaseEnabled}
          onClose={() => setActive(null)}
          onDone={(status, note) => { onReviewed(active.id, status, note); setActive(null); }}
          onDeleted={() => { onDeleted(active.id); setActive(null); }}
        />
      )}
    </>
  );
}

function ReviewPanel({ sub, roleReq, supabaseEnabled, onClose, onDone, onDeleted }) {
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

  const removeCv = async () => {
    if (!window.confirm(`Delete ${sub.name}'s CV "${sub.fileName}"? The file and the review record are removed permanently. The candidate will be asked to upload a new CV.`)) return;
    setErr("");
    if (!supabaseEnabled) { onDeleted(); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/cv-delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cvId: sub.id, notify: true }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onDeleted();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
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

        {sub.revision > 1 && (
          <div className="cvr-resub">
            <b>Updated CV — version {sub.revision}.</b> It replaces the previous version{sub.previousStatus ? `, which was marked “${sub.previousStatus}”` : ""}.
            {sub.previousNote && <div className="cvr-resub-note"><span>Your earlier note:</span> {sub.previousNote}</div>}
          </div>
        )}

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
          <button className="btn-outline btn-danger-outline cvr-del" disabled={busy} onClick={removeCv} title="Delete this CV record and its file">
            <IconTrash width={14} height={14} /> Delete CV
          </button>
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
