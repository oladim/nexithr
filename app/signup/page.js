"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { TextField, SelectField } from "@/components/auth/Field";
import OAuthButtons from "@/components/auth/OAuthButtons";
import { useAuth } from "@/components/context/AuthContext";
import {
  IconUploadCloud,
  IconCode,
  IconChart,
  IconBriefcase,
  IconUser,
  IconLock,
  IconCheck,
} from "@/components/Icons";

const ROLE_OPTIONS = [
  { id: "candidate", label: "Candidate", desc: "Get assessed, trained and placed in a job.", Icon: IconUser },
  { id: "professional", label: "Professional Interviewer", desc: "Conduct technical interviews for candidates.", Icon: IconBriefcase },
  { id: "hr", label: "HR Interviewer", desc: "Conduct HR interviews for candidates.", Icon: IconBriefcase },
  { id: "recruiter", label: "Employer / Recruiter", desc: "Hire vetted candidates and post jobs.", Icon: IconChart },
];

const LABELS = {
  role: "Join as",
  personal: "Personal details",
  background: "Professional background",
  target: "Target job",
  cv: "Upload CV",
  org: "Organisation",
  review: "Review",
};

function stepsFor(role) {
  if (role === "recruiter") return ["role", "personal", "org", "review"];
  if (role === "professional" || role === "hr") return ["role", "personal", "background", "review"];
  return ["role", "personal", "background", "target", "cv", "review"];
}

const JOB_FIELDS = [
  { id: "software", label: "Software Development", desc: "Frontend, backend, mobile, full-stack", Icon: IconCode },
  { id: "data", label: "Data & Analytics", desc: "Data science, ML, analytics, BI", Icon: IconChart },
  { id: "product", label: "Product & Design", desc: "PM, UX/UI, product design", Icon: IconUser },
  { id: "cloud", label: "Cloud & DevOps", desc: "Cloud, DevOps, SRE, platform", Icon: IconBriefcase },
  { id: "security", label: "Cybersecurity", desc: "Security engineering, GRC, pentest", Icon: IconLock },
  { id: "support", label: "IT Support", desc: "Helpdesk, sysadmin, networking", Icon: IconBriefcase },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup, updateSignup, signUpUser, supabaseEnabled } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const role = signup.role || "candidate";
  const steps = stepsFor(role);
  const key = steps[step];

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    setError("");
    if (supabaseEnabled) {
      setBusy(true);
      const res = await signUpUser();
      setBusy(false);
      if (res?.error) { setError(res.error); return; }
      if (res.needsConfirm) { router.push("/verify-email"); return; }
      // Session created: staff → their portal (shows pending gate), else congrats.
      router.push(role === "recruiter" ? "/recruiter" : role === "professional" || role === "hr" ? "/interviewer" : "/congratulations");
      return;
    }
    router.push("/verify-email");
  };

  return (
    <AuthLayout>
      <p className="stepper-label">
        Step {step + 1} of {steps.length} · {LABELS[key]}
      </p>
      <div className="stepper" aria-hidden="true">
        {steps.map((_, i) => (
          <span key={i} className={`dot ${i < step ? "done" : ""} ${i === step ? "active" : ""}`} />
        ))}
      </div>

      {key === "role" && <StepRole data={signup} update={updateSignup} onNext={next} />}
      {key === "personal" && <StepPersonal data={signup} update={updateSignup} onNext={next} onBack={back} />}
      {key === "background" && <StepProfessional data={signup} update={updateSignup} onNext={next} onBack={back} />}
      {key === "target" && <StepTargetJob data={signup} update={updateSignup} onNext={next} onBack={back} />}
      {key === "cv" && <StepCv data={signup} update={updateSignup} onNext={next} onBack={back} />}
      {key === "org" && <StepOrganisation data={signup} update={updateSignup} onNext={next} onBack={back} />}
      {key === "review" && <StepReview data={signup} role={role} onBack={back} onFinish={finish} error={error} busy={busy} />}
    </AuthLayout>
  );
}

/* ---------- Step 0 — Join as (role) ---------- */
function StepRole({ data, update, onNext }) {
  return (
    <>
      <h1 className="auth-title">How are you joining?</h1>
      <p className="auth-subtitle">Choose the account type that fits you. Interviewer and employer accounts are reviewed by our team before activation.</p>
      <div className="job-grid" style={{ marginBottom: 24 }}>
        {ROLE_OPTIONS.map(({ id, label, desc, Icon }) => (
          <button type="button" key={id} className={`job-card ${data.role === id ? "selected" : ""}`} onClick={() => update({ role: id })}>
            <span className="jc-icon"><Icon width={20} height={20} /></span>
            <span><h4>{label}</h4><p>{desc}</p></span>
          </button>
        ))}
      </div>
      <button type="button" className="auth-btn" disabled={!data.role} onClick={onNext}>Continue</button>
      <p className="auth-alt">Already have an account? <Link href="/login">Login</Link></p>
    </>
  );
}

/* ---------- Step 1 — Personal details (exact from Figma 113:178) ---------- */
function StepPersonal({ data, update, onNext, onBack }) {
  const submit = (e) => {
    e.preventDefault();
    onNext();
  };
  return (
    <>
      <h1 className="auth-title">Your details</h1>
      <p className="auth-subtitle">
        NexIT-Africa empowers your journey with intelligent assessments,
        certified training, and verified talent matching.
      </p>
      <form onSubmit={submit}>
        <div className="field-row">
          <TextField
            label="First Name"
            placeholder="Enter Name"
            value={data.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            required
          />
          <TextField
            label="Last Name"
            placeholder="Enter Name"
            value={data.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
            required
          />
        </div>
        <TextField
          label="Email Address"
          type="email"
          placeholder="example@gmail.com"
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          required
        />
        <div className="field-row">
          <SelectField
            label="Country"
            value={data.country}
            onChange={(e) => update({ country: e.target.value })}
          >
            <option>Nigeria</option>
            <option>Ghana</option>
            <option>Kenya</option>
            <option>South Africa</option>
            <option>Egypt</option>
          </SelectField>
          <TextField
            label="Phone"
            placeholder="+234"
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </div>
        <SelectField
          label="Default timezone"
          value={data.timezone}
          onChange={(e) => update({ timezone: e.target.value })}
        >
          <option>GMT+1</option>
          <option>GMT</option>
          <option>GMT+2</option>
          <option>GMT+3</option>
        </SelectField>
        <TextField
          label="Password"
          type="password"
          placeholder="Create a password"
          value={data.password}
          onChange={(e) => update({ password: e.target.value })}
          required
        />
        <label className="check-row" style={{ margin: "4px 0 24px" }}>
          <input
            type="checkbox"
            checked={data.agreeTerms}
            onChange={(e) => update({ agreeTerms: e.target.checked })}
            required
          />
          <span>
            I agree to NexIT-Africa <a href="#">Terms of service</a> and{" "}
            <a href="#">Privacy policy</a>
          </span>
        </label>

        <div style={{ display: "flex", gap: 16 }}>
          <button type="button" className="auth-btn ghost" onClick={onBack}>Back</button>
          <button type="submit" className="auth-btn" disabled={!data.agreeTerms}>Next</button>
        </div>
        <p className="auth-alt">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </form>
      <OAuthButtons />
    </>
  );
}

/* ---------- Organisation (recruiter/employer) ---------- */
function StepOrganisation({ data, update, onNext, onBack }) {
  const submit = (e) => { e.preventDefault(); if (!data.orgName?.trim()) return; onNext(); };
  return (
    <>
      <h1 className="auth-title">Your organisation</h1>
      <p className="auth-subtitle">Tell us about the company you&apos;re hiring for. You&apos;ll upload verification documents after sign-up, before your account is approved.</p>
      <form onSubmit={submit}>
        <TextField label="Company / organisation name" placeholder="e.g. Acme Technologies Ltd" value={data.orgName} onChange={(e) => update({ orgName: e.target.value })} required />
        <TextField label="Your role at the company" placeholder="e.g. Head of Talent" value={data.jobTitle} onChange={(e) => update({ jobTitle: e.target.value })} />
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <button type="button" className="auth-btn ghost" onClick={onBack}>Back</button>
          <button type="submit" className="auth-btn" disabled={!data.orgName?.trim()}>Next</button>
        </div>
      </form>
    </>
  );
}

/* ---------- Step 2 — Professional background (interpretation) ---------- */
function StepProfessional({ data, update, onNext, onBack }) {
  const submit = (e) => {
    e.preventDefault();
    onNext();
  };
  return (
    <>
      <h1 className="auth-title">Your background</h1>
      <p className="auth-subtitle">
        Tell us about your experience so the AI interview and job matching can
        be tailored to you.
      </p>
      <form onSubmit={submit}>
        <TextField
          label="Current / most recent job title"
          placeholder="e.g. Frontend Developer"
          value={data.jobTitle}
          onChange={(e) => update({ jobTitle: e.target.value })}
          required
        />
        <SelectField
          label="Years of experience"
          value={data.experience}
          onChange={(e) => update({ experience: e.target.value })}
          required
        >
          <option value="">Select experience</option>
          <option>Student / Fresh graduate</option>
          <option>0 – 1 years</option>
          <option>1 – 3 years</option>
          <option>3 – 5 years</option>
          <option>5+ years</option>
        </SelectField>
        <TextField
          label="Key skills (comma separated)"
          placeholder="e.g. React, TypeScript, Node.js"
          value={data.skills}
          onChange={(e) => update({ skills: e.target.value })}
        />
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <button type="button" className="auth-btn ghost" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="auth-btn">
            Next
          </button>
        </div>
      </form>
    </>
  );
}

/* ---------- Step 3 — Target job (interpretation) ---------- */
function StepTargetJob({ data, update, onNext, onBack }) {
  const submit = (e) => {
    e.preventDefault();
    if (!data.targetRole) return;
    onNext();
  };
  return (
    <>
      <h1 className="auth-title">Choose a target</h1>
      <p className="auth-subtitle">
        Pick the field you want to be assessed and matched for. You can change
        this later.
      </p>
      <form onSubmit={submit}>
        <div className="job-grid" style={{ marginBottom: 24 }}>
          {JOB_FIELDS.map(({ id, label, desc, Icon }) => (
            <button
              type="button"
              key={id}
              className={`job-card ${data.targetRole === id ? "selected" : ""}`}
              onClick={() => update({ targetRole: id })}
            >
              <span className="jc-icon">
                <Icon width={20} height={20} />
              </span>
              <span>
                <h4>{label}</h4>
                <p>{desc}</p>
              </span>
            </button>
          ))}
        </div>
        <SelectField
          label="Preferred job type"
          value={data.jobType}
          onChange={(e) => update({ jobType: e.target.value })}
        >
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
          <option>Internship</option>
          <option>Remote</option>
        </SelectField>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <button type="button" className="auth-btn ghost" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="auth-btn" disabled={!data.targetRole}>
            Next
          </button>
        </div>
      </form>
    </>
  );
}

/* ---------- Step 4 — Upload CV (interpretation) ---------- */
function StepCv({ data, update, onNext, onBack }) {
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) update({ cvName: f.name });
  };
  return (
    <>
      <h1 className="auth-title">Upload your CV</h1>
      <p className="auth-subtitle">
        Your CV powers the AI interview — it&apos;s assessed against your chosen
        role&apos;s requirements. PDF or DOCX, up to 5MB.
      </p>
      <label className="dropzone">
        <span className="zicon">
          <IconUploadCloud width={48} height={48} />
        </span>
        <p>
          <b>Click to upload</b> or drag and drop
        </p>
        <p style={{ fontSize: 13, marginTop: 4 }}>PDF, DOC, DOCX (max 5MB)</p>
        {data.cvName && <p className="picked">✓ {data.cvName}</p>}
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={onFile}
          style={{ display: "none" }}
        />
      </label>
      <div style={{ display: "flex", gap: 16, marginTop: 28 }}>
        <button type="button" className="auth-btn ghost" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="auth-btn"
          onClick={onNext}
          disabled={!data.cvName}
        >
          Next
        </button>
      </div>
    </>
  );
}

/* ---------- Step 5 — Review & submit (interpretation) ---------- */
function StepReview({ data, role, onBack, onFinish, error, busy }) {
  const roleLabel = ROLE_OPTIONS.find((r) => r.id === role)?.label || "Candidate";
  const isStaff = role === "professional" || role === "hr" || role === "recruiter";
  const base = [
    ["Joining as", roleLabel],
    ["Name", [data.firstName, data.lastName].filter(Boolean).join(" ") || "—"],
    ["Email", data.email || "—"],
    ["Phone", data.phone || "—"],
    ["Country / TZ", `${data.country} · ${data.timezone}`],
  ];
  const extra = role === "recruiter"
    ? [["Organisation", data.orgName || "—"], ["Your role", data.jobTitle || "—"]]
    : role === "candidate"
    ? [["Job title", data.jobTitle || "—"], ["Experience", data.experience || "—"], ["Target field", JOB_FIELDS.find((j) => j.id === data.targetRole)?.label || "—"], ["Job type", data.jobType], ["CV", data.cvName || "—"]]
    : [["Job title", data.jobTitle || "—"], ["Experience", data.experience || "—"]];
  const rows = [...base, ...extra];
  return (
    <>
      <h1 className="auth-title">Review &amp; confirm</h1>
      <p className="auth-subtitle">
        {isStaff
          ? "After sign-up you'll upload your documents, and our team reviews your account before it's activated."
          : "Make sure everything looks right before we create your account."}
      </p>
      <div
        style={{
          border: "1px solid var(--gray-200)",
          borderRadius: 12,
          padding: "8px 20px",
          marginBottom: 28,
        }}
      >
        {rows.map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              padding: "12px 0",
              borderBottom: "1px solid var(--gray-200)",
              fontSize: 15,
            }}
          >
            <span style={{ color: "var(--gray-500)" }}>{k}</span>
            <span style={{ fontWeight: 500, textAlign: "right" }}>{v}</span>
          </div>
        ))}
      </div>
      {error && <p className="auth-error">{error}</p>}
      <div style={{ display: "flex", gap: 16 }}>
        <button type="button" className="auth-btn ghost" onClick={onBack} disabled={busy}>
          Back
        </button>
        <button type="button" className="auth-btn" onClick={onFinish} disabled={busy}>
          <IconCheck width={20} height={20} /> {busy ? "Creating…" : "Create account"}
        </button>
      </div>
    </>
  );
}
