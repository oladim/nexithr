"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { TextField, SelectField } from "@/components/auth/Field";
import { ROLE_LABELS } from "@/lib/db";
import { IconUploadCloud, IconDownload, IconFileText, IconCheck, IconLock } from "@/components/Icons";

const INDUSTRIES = ["Software", "Data & Analytics", "Product & Design", "Cloud & DevOps", "Cybersecurity", "IT Support"];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

export default function CvUploadPage() {
  const { user, signup, app, uploadCv, supabaseEnabled } = useAuth();
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
    targetRole: ROLE_LABELS[signup.targetRole] || roleRow?.title || signup.targetRole || "—",
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
        </p>
      </div>

      {showForm ? (
        <UploadForm
          identity={identity}
          initial={{
            fullName: identity.name,
            email: identity.email,
            industry: app.cv?.industry || "",
            jobType: app.cv?.jobType || "Full-time",
            cvName: app.cv?.name || "",
          }}
          onSubmit={async (data) => {
            const res = await uploadCv(data);
            if (res?.error || res?.warning) { alert(res.error || res.warning); if (res.error) return; }
            setEditing(false);
          }}
        />
      ) : (
        <UploadedView cv={app.cv} identity={identity} uploadCv={uploadCv} onEdit={() => setEditing(true)} />
      )}
    </>
  );
}

function UploadForm({ identity, initial, onSubmit }) {
  const [fullName, setFullName] = useState(initial.fullName);
  const [email, setEmail] = useState(initial.email);
  const [industry, setIndustry] = useState(initial.industry);
  const [jobType, setJobType] = useState(initial.jobType);
  const [cvName, setCvName] = useState(initial.cvName);
  const [file, setFile] = useState(null);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setCvName(f.name);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ name: cvName || "cv.pdf", industry, jobType, fullName, email, file });
  };

  return (
    <form className="cv-layout" onSubmit={submit}>
      <div>
        <p className="cv-step-label">Step 1: Upload your CV</p>
        <label className="dropzone" style={{ marginBottom: 24 }}>
          <span className="zicon">
            <IconUploadCloud width={44} height={44} />
          </span>
          <p>
            <b>Click to upload</b> or drag and drop
          </p>
          <p style={{ fontSize: 13, marginTop: 4 }}>PDF, DOC, DOCX (max 5MB)</p>
          {cvName && <p className="picked">✓ {cvName}</p>}
          <input type="file" accept=".pdf,.doc,.docx" onChange={onFile} style={{ display: "none" }} />
        </label>

        <p className="cv-step-label">Step 2: Fill in Key Details</p>
        <TextField variant="simple" label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <TextField variant="simple" label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <p className="cv-step-label" style={{ marginTop: 8 }}>Step 3: Select Job Role Preferences</p>
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
          <button type="button" className="btn-outline">Save as Draft</button>
          <button type="submit" className="btn-solid" disabled={!cvName}>
            <IconFileText /> Submit CV
          </button>
        </div>
      </div>

      {/* Live summary of what will be saved — reflects the fields as you type. */}
      <CvSummaryCard
        heading="Preview"
        cv={cvName ? { name: cvName, jobType, industry, status: "Pending review" } : null}
        identity={{ name: fullName || identity.name, email: email || identity.email, targetRole: identity.targetRole }}
      />
    </form>
  );
}

function UploadedView({ cv, identity, uploadCv, onEdit }) {
  const [justSaved, setJustSaved] = useState(false);

  const onReupload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Replace the file on record, keeping the existing preferences.
    const res = await uploadCv({ name: f.name, industry: cv?.industry || "", jobType: cv?.jobType || "Full-time", file: f });
    if (res?.error || res?.warning) alert(res.error || res.warning);
    if (res?.error) return;
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3500);
  };

  return (
    <div className="cv-layout">
      {/* LEFT — upload / replace */}
      <div className="cv-reupload">
        <p className="cv-step-label">Replace your CV</p>
        <label className="dropzone">
          <span className="zicon">
            <IconUploadCloud width={44} height={44} />
          </span>
          <p><b>Click to upload</b> or drag and drop</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>PDF, DOC, DOCX (max 5MB)</p>
          <input type="file" accept=".pdf,.doc,.docx" onChange={onReupload} style={{ display: "none" }} />
        </label>
        <p className="cv-hint">Uploading a new file replaces the one currently on record.</p>
        {justSaved && (
          <p className="picked" style={{ marginTop: 8 }}>
            <IconCheck width={14} height={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
            CV updated.
          </p>
        )}
        <div className="cv-actions" style={{ marginTop: 18 }}>
          <button className="btn-outline" onClick={onEdit}>Edit details</button>
        </div>
      </div>

      {/* RIGHT — the actual CV on file */}
      <CvSummaryCard heading="Current CV on file" cv={cv} identity={identity} showDownload />
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
