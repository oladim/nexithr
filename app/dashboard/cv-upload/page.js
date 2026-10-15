"use client";

import { useState, useEffect } from "react";
import LevelSuggestion from "@/components/dashboard/LevelSuggestion";
import { useAuth } from "@/components/context/AuthContext";
import { SelectField } from "@/components/auth/Field";
import { ROLE_LABELS } from "@/lib/db";
import { CATALOG_LABELS } from "@/lib/roleCatalog";
import { cvFileProblem } from "@/lib/cvClient";
import Link from "next/link";
import { startPayment } from "@/lib/billing";
import { IconUploadCloud, IconDownload, IconFileText, IconCheck, IconLock, IconPlus } from "@/components/Icons";

const INDUSTRIES = ["Software", "Data & Analytics", "Product & Design", "Cloud & DevOps", "Cybersecurity", "IT Support"];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

export default function CvUploadPage() {
  const { user, signup, app, uploadCv, deleteCv, supabaseEnabled, pendingCvState } = useAuth();
  const [editing, setEditing] = useState(false);
  const [roles, setRoles] = useState(null); // enabled-role gate (null until loaded)

  // Load which roles are open for applications (admin-controlled).
  useEffect(() => {
    if (!supabaseEnabled) return; // demo: no gating
    (async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setRoles(Array.isArray(data.roles) ? data.roles : []);
      } catch { setRoles([]); }
    })();
  }, [supabaseEnabled]);

  // What the candidate may do with their CV now (server decides; demo approximates).
  const started = (app.aiInterview?.attempts || 0) > 0 || (app.interviews || []).length > 0;
  const [policy, setPolicy] = useState(null);
  useEffect(() => {
    if (!supabaseEnabled) return;
    fetch("/api/cv/upload", { cache: "no-store" }).then((r) => r.json()).then(setPolicy).catch(() => {});
  }, [supabaseEnabled, app.cv?.uploadedAt]);
  const pol = policy || { started, subscribed: false, canUpload: !started, canDelete: !started,
    reason: started ? "Your AI interview has started, so your CV is now part of your assessment. Uploading a new CV from this point is included in the annual subscription — your new CV is then reviewed again by our team." : null };

  const roleKey = app.candidate?.target_role || signup.targetRole || "";
  // Gate only in real mode once roles are known. Unknown/closed role → blocked.
  const roleRow = roles?.find((r) => r.roleKey === roleKey);
  const roleBlocked = supabaseEnabled && roles !== null && roles.length > 0 && (!roleRow || roleRow.enabled === false);
  const openRoles = (roles || []).filter((r) => r.enabled !== false);

  const showForm = !app.cv || editing;

  // Real identity of the candidate (falls back to signup data / user).
  const identity = {
    name: user?.name || [signup.firstName, signup.lastName].filter(Boolean).join(" ") || "Your Name",
    email: user?.email || signup.email || "",
    targetRole: roleRow?.title || CATALOG_LABELS[roleKey] || ROLE_LABELS[roleKey] || roleKey || "—",
  };

  if (roleBlocked) {
    return (
      <>
        <div className="page-head">
          <h1>Upload CV</h1>
          <p>Applications for your selected role aren&apos;t open right now.</p>
        </div>
        <div className="feedback-card" style={{ background: "rgba(255,171,0,.10)", borderColor: "rgba(255,171,0,.3)", maxWidth: 640 }}>
          <h5 style={{ marginTop: 0 }}>
            <IconLock width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} />
            {roleRow?.title || ROLE_LABELS[roleKey] || "This role"} is currently closed
          </h5>
          <p style={{ margin: "0 0 10px" }}>
            You can only upload a CV for a role that&apos;s open for applications. Please check back later or update your target role to one that&apos;s currently open.
          </p>
          {openRoles.length > 0 && (
            <>
              <p style={{ margin: "0 0 6px", fontWeight: 600 }}>Open roles right now:</p>
              <p style={{ margin: 0 }}>{openRoles.map((r) => r.title).join(", ")}</p>
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>{app.cv && !editing ? "Your CV" : "Upload CV"}</h1>
        <p>
          {app.cv && !editing
            ? "Your CV is on file. Replace it on the left, or review what's on record on the right."
            : "Didn't upload during registration? Add your CV here to unlock your AI interview."}
          {identity.targetRole !== "—" && <> This CV is for <b>{identity.targetRole}</b>.</>}
        </p>
      </div>
      <LevelSuggestion />
      {pendingCvState === "uploading" && <div className="cv-outcome pending" role="status"><h3>Uploading the CV you chose at sign-up…</h3><p className="cv-outcome-next">This takes a few seconds while we check the file.</p></div>}
      {pendingCvState && !["uploading", "done"].includes(pendingCvState) && !app.cv && (
        <div className="cv-outcome rejected" role="alert"><h3>We couldn&apos;t upload the CV you chose at sign-up</h3><p className="cv-outcome-next">{pendingCvState} Please upload it again below.</p></div>
      )}
      <ReviewOutcome cv={app.cv} canUpload={pol.canUpload} />

      {showForm ? (
        <UploadForm
          identity={identity}
          roleKey={roleKey}
          onCancel={app.cv ? () => setEditing(false) : null}
          initial={{
            industry: app.cv?.industry || "",
            jobType: app.cv?.jobType || signup.jobType || "Full-time",
          }}
          onSubmit={async (data) => {
            const res = await uploadCv(data);
            if (res?.error || res?.warning) { alert(res.error || res.warning); if (res.error) return; }
            setEditing(false);
          }}
        />
      ) : (
        <UploadedView cv={app.cv} identity={identity} uploadCv={uploadCv} deleteCv={deleteCv}
          policy={pol} onEdit={() => setEditing(true)} />
      )}
      {app.cv && <OtherRoleCard subscribed={pol.subscribed} />}
    </>
  );
}

function UploadForm({ identity, initial, onSubmit, onCancel, roleKey }) {
  const [industry, setIndustry] = useState(initial.industry);
  const [jobType, setJobType] = useState(initial.jobType);
  const [cvName, setCvName] = useState("");
  const [file, setFile] = useState(null);
  const [fileErr, setFileErr] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const why = cvFileProblem(f);
    setFileErr(why || "");
    if (why) { setFile(null); setCvName(""); return; }
    setFile(f);
    setCvName(f.name);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy || !file) return;
    setBusy(true);
    await onSubmit({ name: cvName, industry, jobType, file });
    setBusy(false);
  };

  return (
    <form className="cv-layout" onSubmit={submit}>
      <div>
        <p className="cv-step-label">Step 1: The role you&apos;re applying for</p>
        <div className="cv-role-pill">
          <span><b>{identity.targetRole}</b><small>Your CV is reviewed against this role&apos;s requirements.</small></span>
          <Link href="/dashboard/profile" className="link">{roleKey ? "Change" : "Choose a role"}</Link>
        </div>

        <p className="cv-step-label">Step 2: Upload your CV</p>
        <label className={`dropzone ${busy ? "busy" : ""}`} style={{ marginBottom: 24 }}>
          <span className="zicon">
            <IconUploadCloud width={44} height={44} />
          </span>
          <p>
            <b>Click to upload</b> or drag and drop
          </p>
          <p style={{ fontSize: 13, marginTop: 4 }}>PDF or Word .docx (max 5MB)</p>
          {cvName && <p className="picked">✓ {cvName}</p>}
          {fileErr && <p className="auth-error" role="alert">{fileErr}</p>}
          <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFile} style={{ display: "none" }} />
        </label>

        <p className="cv-step-label">Step 3: Your job preferences <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></p>
        <div className="field-row">
          <SelectField variant="simple" label="Preferred industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </SelectField>
          <SelectField variant="simple" label="Job type" value={jobType} onChange={(e) => setJobType(e.target.value)}>
            {JOB_TYPES.map((j) => (
              <option key={j}>{j}</option>
            ))}
          </SelectField>
        </div>

        <div className="cv-actions">
          {onCancel && <button type="button" className="btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>}
          <button type="submit" className="btn-solid" disabled={!file || busy || !roleKey}>
            <IconFileText /> {busy ? "Checking & uploading…" : "Submit CV for review"}
          </button>
        </div>
        {!roleKey && <p className="cv-hint">Choose the role you&apos;re applying for first.</p>}
      </div>

      {/* Live summary of what will be submitted. */}
      <CvSummaryCard
        heading="Preview"
        cv={cvName ? { name: cvName, jobType, industry, status: "Pending review" } : null}
        identity={identity}
      />
    </form>
  );
}

function UploadedView({ cv, identity, uploadCv, deleteCv, policy, onEdit }) {
  const [justSaved, setJustSaved] = useState("");
  const [busy, setBusy] = useState("");
  const [subBusy, setSubBusy] = useState(false);
  const locked = !policy.canDelete;
  const canUpload = policy.canUpload;

  const onDelete = async () => {
    if (locked || busy) return;
    if (!window.confirm("Delete your CV for this role? You'll need to upload a CV again before you can take the AI interview.")) return;
    setBusy("delete");
    const res = await deleteCv();
    setBusy("");
    if (res?.error) alert(res.error);
  };

  const onReupload = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !canUpload || busy) return;
    const why = cvFileProblem(f);
    if (why) { alert(why); return; }
    if (policy.started && !window.confirm("Upload a new CV? It replaces your current one and goes back to our reviewers. Your next AI interview attempt unlocks once it's approved again.")) return;
    setBusy("upload");
    // Replace the file on record, keeping the existing preferences.
    const res = await uploadCv({ name: f.name, industry: cv?.industry || "", jobType: cv?.jobType || "Full-time", file: f });
    setBusy("");
    if (res?.error || res?.warning) alert(res.error || res.warning);
    if (res?.error) return;
    setJustSaved("Your new CV replaced the old one and has been sent to our reviewers.");
    setTimeout(() => setJustSaved(""), 6000);
  };

  const subscribe = async () => {
    setSubBusy(true);
    const r = await startPayment({ purpose: "subscription" });
    if (!r?.ok) { if (r?.error) alert(r.error); setSubBusy(false); }
  };

  return (
    <div className="cv-layout">
      {/* LEFT — upload / replace */}
      <div className="cv-reupload">
        <p className="cv-step-label">{/change/i.test(cv?.status || "") ? "Upload your updated CV" : "Replace your CV"}</p>
        {canUpload ? (
          <label className={`dropzone ${busy === "upload" ? "busy" : ""}`}>
            <span className="zicon">
              <IconUploadCloud width={44} height={44} />
            </span>
            <p>{busy === "upload" ? <b>Checking &amp; uploading…</b> : <><b>Click to upload</b> or drag and drop</>}</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>PDF or Word .docx (max 5MB)</p>
            <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onReupload} style={{ display: "none" }} disabled={!!busy} />
          </label>
        ) : (
          <div className="dropzone locked" aria-disabled="true">
            <span className="zicon"><IconLock width={36} height={36} /></span>
            <p><b>CV locked for this role</b></p>
            <p style={{ fontSize: 13, marginTop: 4, maxWidth: 380 }}>{policy.reason}</p>
            <button type="button" className="btn-solid" style={{ marginTop: 12 }} onClick={subscribe} disabled={subBusy}>
              {subBusy ? "Starting…" : "Subscribe to upload a new CV"}
            </button>
          </div>
        )}
        <p className="cv-hint">
          {canUpload
            ? policy.started
              ? "A new CV replaces your current one (the old version is deleted) and is reviewed again before your next AI interview attempt."
              : "A new CV replaces your current one — the old version is deleted — and goes straight to our reviewers."
            : "You can still view and download the CV on record."}
        </p>
        {justSaved && (
          <p className="picked" style={{ marginTop: 8 }} role="status">
            <IconCheck width={14} height={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
            {justSaved}
          </p>
        )}
        <div className="cv-actions" style={{ marginTop: 18 }}>
          {canUpload && <button className="btn-outline" onClick={onEdit} disabled={!!busy}>Edit details &amp; re-upload</button>}
          <button className="btn-outline btn-danger-outline" onClick={onDelete} disabled={locked || !!busy}
            title={locked ? "Your AI interview has started — your CV is now part of your assessment." : "Delete this CV"}>
            {busy === "delete" ? "Deleting…" : "Delete CV"}
          </button>
        </div>
        {locked && <p className="cv-hint">Your CV can no longer be deleted because your AI interview for this role has started.</p>}
      </div>

      {/* RIGHT — the actual CV on file */}
      <CvSummaryCard heading="Current CV on file" cv={cv} identity={identity} showDownload />
    </div>
  );
}

// The reviewer's decision, with exactly what to do next.
function ReviewOutcome({ cv, canUpload }) {
  if (!cv) return null;
  const st = cv.status || "Pending review";
  if (st === "Changes requested" || st === "Rejected") {
    const changes = st === "Changes requested";
    return (
      <div className={`cv-outcome ${changes ? "changes" : "rejected"}`} role="status">
        <h3>{changes ? "Our reviewers asked for a few changes" : "Your CV wasn't approved for this role"}</h3>
        {cv.reviewNote && <p className="cv-outcome-note">{cv.reviewNote}</p>}
        <p className="cv-outcome-next">
          {canUpload
            ? changes
              ? <>Update your CV and <b>upload it below</b> — that&apos;s all you need to do. It replaces the old version and goes straight back to our reviewers.</>
              : <>You can upload a stronger CV below and we&apos;ll review it again, or choose a level or role that better matches your background in your profile.</>
            : <>Uploading a new CV now is included in the annual subscription.</>}
        </p>
      </div>
    );
  }
  if (st === "Pending review" && (cv.revision || 1) > 1) {
    return (
      <div className="cv-outcome pending" role="status">
        <h3>Your updated CV is with our reviewers</h3>
        <p className="cv-outcome-next">We&apos;ll notify you as soon as there&apos;s a decision.</p>
      </div>
    );
  }
  return null;
}

// Every candidate can see they may apply for another role; adding one is for subscribers.
function OtherRoleCard({ subscribed }) {
  return (
    <div className="cv-other-role">
      <span className="cv-or-ic"><IconPlus width={18} height={18} /></span>
      <div className="cv-or-text">
        <b>Want to target another role too?</b>
        <span>
          Upload a separate CV for another role — each role gets its own review, AI interview, Professional and HR interviews and certificate.
          {subscribed ? "" : " Starting another role is included in the annual subscription."}
        </span>
      </div>
      <Link href="/dashboard#my-roles" className="btn-outline">{subscribed ? "Add a role" : <><IconLock width={14} height={14} /> See how</>}</Link>
    </div>
  );
}

/**
 * Honest summary of the CV on record — the real file + the candidate's real
 * details. No fabricated résumé content (we can't read the PDF's contents).
 */
function CvSummaryCard({ heading, cv, identity, showDownload }) {
  const { supabaseEnabled } = useAuth();
  const fileMissing = supabaseEnabled && cv && !cv.path; // row exists but no stored file
  const uploaded = cv?.uploadedAt
    ? new Date(cv.uploadedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;
  const status = cv?.status || "Pending review";
  const statusClass = /approved/i.test(status) ? "done" : "pending";

  const rows = [
    ["Full name", identity.name],
    ["Email", identity.email || "—"],
    ["Target role", identity.targetRole],
    ["Preferred industry", cv?.industry || "—"],
    ["Job type", cv?.jobType || "—"],
  ];

  return (
    <div className="cv-card">
      <div className="cv-card-head">
        <span className="cv-card-label">{heading}</span>
        {cv && <span className={`pill-status ${statusClass}`}>{status}</span>}
      </div>

      {cv ? (
        <>
          <div className="cv-file">
            <span className="cv-file-ic"><IconFileText width={22} height={22} /></span>
            <div className="cv-file-meta">
              <b>{cv.name}</b>
              <small>{uploaded ? `Uploaded ${uploaded}` : "On record"}</small>
            </div>
          </div>

          {fileMissing && (
            <div className="cv-review-note warn">
              <b>File not on record</b>
              <p>Your details are saved, but the CV file itself isn&apos;t stored — please re-upload it on the left so reviewers can open it.</p>
            </div>
          )}

          <div className="cv-detail-rows">
            {rows.map(([k, v]) => (
              <div className="cv-detail-row" key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>

          {cv.reviewNote && (
            <div className={`cv-review-note ${/approved/i.test(status) ? "ok" : "warn"}`}>
              <b>Reviewer note</b>
              <p>{cv.reviewNote}</p>
            </div>
          )}

          {showDownload && (
            <a className="btn-solid cv-dl" href={cv.path || "#"} onClick={(e) => !cv.path && e.preventDefault()} target={cv.path ? "_blank" : undefined} rel="noreferrer">
              <IconDownload /> Download CV
            </a>
          )}
        </>
      ) : (
        <div className="cv-empty">
          <span className="cv-file-ic muted"><IconFileText width={22} height={22} /></span>
          <p>No file selected yet. Choose a file on the left to see it here.</p>
        </div>
      )}
    </div>
  );
}
