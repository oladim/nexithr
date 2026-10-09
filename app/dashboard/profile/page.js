"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadProfileDetails, updateProfile, updateCandidate, uploadAvatar, ROLE_LABELS } from "@/lib/db";
import { IconUpload, IconCheck, IconBriefcase, IconChart, IconUser } from "@/components/Icons";
import SettingsCrumb from "@/components/SettingsCrumb";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Egypt"];
const EXPERIENCE = ["Student / Fresh graduate", "0 – 1 years", "1 – 3 years", "3 – 5 years", "5+ years"];

export default function ProfilePage() {
  const { user, signup, app, supabaseEnabled } = useAuth();
  const sb = () => getBrowserSupabase();

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", country: "Nigeria",
    bio: "", experience: "", skills: "", targetRole: "",
  });
  const [kyc, setKyc] = useState("Unverified");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loaded, setLoaded] = useState(!supabaseEnabled);

  // Initial values from local signup/user (demo) or the database (real mode).
  useEffect(() => {
    const localInit = {
      fullName: user?.name || [signup.firstName, signup.lastName].filter(Boolean).join(" ") || "",
      email: user?.email || signup.email || "",
      phone: signup.phone || "",
      country: signup.country || "Nigeria",
      bio: signup.about || "",
      experience: signup.experience || "",
      skills: typeof signup.skills === "string" ? signup.skills : (signup.skills || []).join(", "),
      targetRole: app.candidate?.target_role || signup.targetRole || "",
    };
    setForm(localInit);

    if (!supabaseEnabled) { setLoaded(true); return; }
    (async () => {
      const s = sb();
      if (!s) { setLoaded(true); return; }
      try {
        const { data: { user: au } } = await s.auth.getUser();
        if (!au) { setLoaded(true); return; }
        const { profile, candidate } = await loadProfileDetails(s, au.id);
        setForm({
          fullName: profile.full_name || localInit.fullName,
          email: profile.email || localInit.email,
          phone: profile.phone || "",
          country: profile.country || "Nigeria",
          bio: profile.bio || "",
          experience: candidate.experience || "",
          skills: (candidate.skills || []).join(", "),
          targetRole: candidate.target_role || "",
        });
        setKyc(candidate.kyc || "Unverified");
        setAvatarUrl(profile.avatar_url || null);
      } catch { /* keep local */ }
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseEnabled]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Only roles an admin has opened for applications can be chosen.
  const [openRoles, setOpenRoles] = useState(null); // { key: title } | null (demo / not loaded)
  useEffect(() => {
    if (!supabaseEnabled) return;
    fetch("/api/roles", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (Array.isArray(j.roles)) setOpenRoles(Object.fromEntries(j.roles.map((r) => [r.key, r.title]))); })
      .catch(() => {});
  }, [supabaseEnabled]);
  const roleLabels = { ...(openRoles || ROLE_LABELS) };
  if (form.targetRole && !roleLabels[form.targetRole]) roleLabels[form.targetRole] = ROLE_LABELS[form.targetRole] || form.targetRole;

  const save = async () => {
    setErr(""); setMsg(""); setBusy(true);
    try {
      if (supabaseEnabled) {
        const s = sb();
        const { data: { user: au } } = await s.auth.getUser();
        if (au) {
          const skillsArr = form.skills.split(",").map((x) => x.trim()).filter(Boolean);
          const candFields = { experience: form.experience, skills: skillsArr };
          if (!roleLocked) candFields.target_role = form.targetRole; // don't change role once locked
          const [{ error: e1 }, { error: e2 }] = await Promise.all([
            updateProfile(s, au.id, { full_name: form.fullName, phone: form.phone, country: form.country, bio: form.bio }),
            updateCandidate(s, au.id, candFields),
          ]);
          if (e1 || e2) throw new Error((e1 || e2).message);
        }
      }
      setMsg("Profile saved.");
      setEditing(false);
      setTimeout(() => setMsg(""), 4000);
    } catch (e) {
      setErr(e.message || "Couldn't save");
    }
    setBusy(false);
  };

  const onPhoto = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !supabaseEnabled) return;
    setErr("");
    try {
      const s = sb();
      const { data: { user: au } } = await s.auth.getUser();
      if (!au) return;
      const url = await uploadAvatar(s, au.id, f);
      await updateProfile(s, au.id, { avatar_url: url });
      setAvatarUrl(url);
      setMsg("Photo updated.");
      setTimeout(() => setMsg(""), 4000);
    } catch (e2) { setErr(e2.message || "Couldn't upload photo"); }
  };

  const name = form.fullName || "Your name";
  const initials = name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "U";
  const roleLabel = roleLabels[form.targetRole] || ROLE_LABELS[form.targetRole] || form.targetRole || "—";
  const skillChips = form.skills.split(",").map((x) => x.trim()).filter(Boolean);

  // Interview progress (live).
  const ai = app.aiInterview || {};
  const pro = app.stages?.Professional || {};
  const hr = app.stages?.HR || {};
  // Target role locks once the pipeline has started (any AI/stage attempt).
  const roleLocked = (ai.attempts ?? 0) > 0 || !!pro.result || !!hr.result || (pro.attempts ?? 0) > 0 || (hr.attempts ?? 0) > 0;
  const stageState = (s) => (s?.passed ? "Passed" : (s?.attempts ?? 0) > 0 || s?.result ? "In progress" : "Not started");
  const progress = [
    { label: "AI interview", state: ai.passed ? "Passed" : (ai.attempts ?? 0) > 0 ? "In progress" : "Not started", Icon: IconChart },
    { label: "Professional", state: stageState(pro), Icon: IconUser },
    { label: "HR", state: stageState(hr), Icon: IconBriefcase },
  ];

  return (
    <>
      <SettingsCrumb current="My profile" onlyWhenFrom />
      <div className="page-head">
        <h1>My Profile</h1>
        <p>Your details power your AI interview and job matching. Keep them up to date.</p>
      </div>

      {err && <div className="auth-error" style={{ marginBottom: 12 }}>{err}</div>}
      {msg && <div className="role-note ok" style={{ marginBottom: 12 }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: 20, alignItems: "start" }}>
        {/* LEFT — identity + personal */}
        <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "#dfe7f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 24, fontWeight: 700, color: "#4b6ea8" }}>{initials}</span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{name}</h3>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--muted)", wordBreak: "break-all" }}>{form.email}</p>
              <span className="pill-status" style={{ marginTop: 6, display: "inline-block" }}>{roleLabel}</span>
            </div>
          </div>
          {supabaseEnabled && (
            <label className="btn-outline" style={{ alignSelf: "flex-start", cursor: "pointer" }}>
              <IconUpload width={15} height={15} /> Change photo
              <input type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} />
            </label>
          )}

          <div style={{ borderTop: "1px solid #eef1f6", paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Full name" value={form.fullName} onChange={set("fullName")} editing={editing} />
            <Field label="Email" value={form.email} editing={false} note="Email can't be changed here." />
            <Field label="Phone" value={form.phone} onChange={set("phone")} editing={editing} placeholder="+234…" />
            <SelectField label="Country" value={form.country} onChange={set("country")} editing={editing} options={COUNTRIES} />
            <Field label="About" value={form.bio} onChange={set("bio")} editing={editing} textarea placeholder="A short bio about you." />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {editing ? (
              <>
                <button className="btn-outline" disabled={busy} onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn-solid" disabled={busy || !loaded} onClick={save}><IconCheck width={15} height={15} /> {busy ? "Saving…" : "Save changes"}</button>
              </>
            ) : (
              <button className="btn-solid" disabled={!loaded} onClick={() => setEditing(true)}>Edit profile</button>
            )}
          </div>
        </div>

        {/* RIGHT — professional + status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h3 className="card-title" style={{ margin: 0 }}>Professional details</h3>
            <SelectField label="Target role" value={form.targetRole} onChange={set("targetRole")} editing={editing && !roleLocked}
              options={Object.keys(roleLabels)} labels={roleLabels} placeholderOption="Select a role"
              note={editing && roleLocked ? "Locked — your interviews have started for this role."
                : !form.targetRole ? "Only positions currently open are listed. We'll notify you when more become available."
                : undefined} />
            <SelectField label="Experience" value={form.experience} onChange={set("experience")} editing={editing} options={EXPERIENCE} placeholderOption="Select experience" />
            <div>
              <label className="cv-step-label" style={{ marginBottom: 6 }}>Skills</label>
              {editing ? (
                <input className="rr-exp-input" style={{ width: "100%" }} value={form.skills} onChange={set("skills")} placeholder="e.g. React, Node, SQL" />
              ) : skillChips.length ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skillChips.map((s) => <span key={s} className="cvr-skill have">{s}</span>)}
                </div>
              ) : <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>No skills added yet.</p>}
            </div>
            <div className="legal-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eef1f6", paddingTop: 12 }}>
              <span style={{ fontSize: 14 }}>KYC status</span>
              <span className={`pill-status ${/verified/i.test(kyc) ? "done" : "pending"}`}>{kyc}</span>
            </div>
          </div>

          <div className="card pad">
            <h3 className="card-title" style={{ marginTop: 0 }}>Interview progress</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {progress.map(({ label, state, Icon }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}><span className="pi"><Icon width={16} height={16} /></span> {label}</span>
                  <span className={`pill-status ${state === "Passed" ? "done" : "pending"}`} style={state === "Not started" ? { opacity: 0.6 } : undefined}>{state}</span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/interview" className="btn-outline" style={{ marginTop: 14, display: "inline-flex" }}>Go to interviews</Link>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value, onChange, editing, placeholder, textarea, note }) {
  return (
    <div>
      <label className="cv-step-label" style={{ marginBottom: 4 }}>{label}</label>
      {editing && onChange ? (
        textarea ? (
          <textarea className="cvr-textarea" rows={3} value={value} onChange={onChange} placeholder={placeholder} />
        ) : (
          <input className="rr-exp-input" style={{ width: "100%" }} value={value} onChange={onChange} placeholder={placeholder} />
        )
      ) : (
        <p style={{ margin: 0, fontSize: 15, color: value ? "var(--navy)" : "var(--muted)" }}>{value || "—"}</p>
      )}
      {note && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>{note}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, editing, options, labels, placeholderOption, note }) {
  const display = labels ? (labels[value] || value) : value;
  return (
    <div>
      <label className="cv-step-label" style={{ marginBottom: 4 }}>{label}</label>
      {editing ? (
        <select className="rr-exp-input" style={{ width: "100%" }} value={value} onChange={onChange}>
          {placeholderOption && <option value="">{placeholderOption}</option>}
          {options.map((o) => <option key={o} value={o}>{labels ? labels[o] : o}</option>)}
        </select>
      ) : (
        <p style={{ margin: 0, fontSize: 15, color: display ? "var(--navy)" : "var(--muted)" }}>{display || "—"}</p>
      )}
      {note && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>{note}</p>}
    </div>
  );
}
