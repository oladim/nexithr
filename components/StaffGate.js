"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadStaffApplication } from "@/lib/db";
import { IconLock, IconUploadCloud, IconCheck, IconClock } from "@/components/Icons";

// Gates interviewer/recruiter portals until an admin approves the account.
// While pending, the user uploads their CV (interviewers) or organisational
// documents (recruiters) for review.
export default function StaffGate({ children }) {
  const { role, approvalStatus, supabaseEnabled, uploadStaffDoc } = useAuth();

  // Demo mode and already-approved staff see the portal normally.
  if (!supabaseEnabled) return children;
  if (role !== "interviewer" && role !== "recruiter") return children;
  if (approvalStatus === "approved") return children;
  if (approvalStatus === "suspended") return <StaffSuspended role={role} />;

  return <StaffPending role={role} status={approvalStatus} uploadStaffDoc={uploadStaffDoc} />;
}

function StaffSuspended({ role }) {
  return (
    <div className="assess" style={{ maxWidth: 620, margin: "40px auto" }}>
      <div className="page-head">
        <h1>Your account is suspended</h1>
        <p>Access to the {role === "recruiter" ? "employer" : "interviewer"} portal is temporarily paused.</p>
      </div>
      <div className="feedback-card" style={{ background: "rgba(255,77,77,.08)", borderColor: "rgba(255,77,77,.3)" }}>
        <h5 style={{ marginTop: 0 }}>
          <IconLock width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} /> Suspended
        </h5>
        <p style={{ margin: 0 }}>
          An administrator has suspended this account. If you think this is a mistake, please contact the NexIT-Africa team. You&apos;ll regain access as soon as it&apos;s reactivated.
        </p>
      </div>
    </div>
  );
}

function StaffPending({ role, status, uploadStaffDoc }) {
  const [appRow, setAppRow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [savedName, setSavedName] = useState("");

  const isRecruiter = role === "recruiter";
  const docLabel = isRecruiter ? "organisational documents" : "your CV";

  useEffect(() => {
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) return;
      try { const { data: { user } } = await sb.auth.getUser(); if (user) setAppRow(await loadStaffApplication(sb, user.id)); } catch { /* ignore */ }
    })();
  }, []);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(""); setBusy(true);
    const res = await uploadStaffDoc(f);
    setBusy(false);
    if (res?.error) { setErr(res.error); return; }
    setSavedName(f.name);
  };

  const hasDoc = savedName || appRow?.doc_name;

  return (
    <div className="assess" style={{ maxWidth: 680, margin: "40px auto" }}>
      <div className="page-head">
        <h1>{status === "rejected" ? "Application not approved" : "Your account is pending approval"}</h1>
        <p>
          {status === "rejected"
            ? "After review, your application wasn't approved. If you believe this is a mistake, re-upload your documents or contact the NexIT team."
            : `Thanks for joining NexIT-Africa as ${isRecruiter ? "an employer" : "an interviewer"}. An admin will review your account before you can access the portal.`}
        </p>
      </div>

      <div className="feedback-card" style={{ background: status === "rejected" ? "rgba(255,77,77,.08)" : "rgba(255,171,0,.10)", borderColor: status === "rejected" ? "rgba(255,77,77,.3)" : "rgba(255,171,0,.3)" }}>
        <h5 style={{ marginTop: 0 }}>
          {status === "rejected" ? <IconLock width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} /> : <IconClock width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} />}
          {status === "rejected" ? "Not approved" : "Under review"}
        </h5>
        <p style={{ margin: 0 }}>
          Upload {docLabel} so the team can verify you. {isRecruiter ? "e.g. CAC certificate, company profile, or proof of business." : "Your most recent CV."} PDF or DOCX.
        </p>
      </div>

      <label className="dropzone" style={{ marginTop: 16 }}>
        <span className="zicon"><IconUploadCloud width={44} height={44} /></span>
        <p><b>Click to upload</b> {docLabel}</p>
        <p style={{ fontSize: 13, marginTop: 4 }}>PDF, DOC, DOCX (max 5MB)</p>
        {hasDoc && <p className="picked"><IconCheck width={13} height={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} /> {savedName || appRow?.doc_name}</p>}
        <input type="file" accept=".pdf,.doc,.docx" onChange={onFile} style={{ display: "none" }} disabled={busy} />
      </label>
      {busy && <p className="answer-hint" style={{ marginTop: 10 }}>Uploading…</p>}
      {err && <div className="auth-error" style={{ marginTop: 10 }}>{err}</div>}

      {hasDoc && status !== "rejected" && (
        <div className="role-note ok" style={{ marginTop: 16 }}>
          Document received — your application is with the review team. You&apos;ll be notified once it&apos;s approved.
        </div>
      )}
    </div>
  );
}
