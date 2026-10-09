"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { updateProfile, uploadAvatar } from "@/lib/db";
import SettingsCrumb from "@/components/SettingsCrumb";
import { IconUpload, IconCheck } from "@/components/Icons";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Egypt"];

export default function InterviewerProfile() {
  const { user, interviewerKind, supabaseEnabled } = useAuth();
  const [form, setForm] = useState({ fullName: user?.name || "", email: user?.email || "", phone: "", country: "Nigeria", bio: "" });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loaded, setLoaded] = useState(!supabaseEnabled);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const sb = getBrowserSupabase();
      try {
        const { data: { user: au } } = await sb.auth.getUser();
        if (au) {
          const { data: p } = await sb.from("profiles").select("full_name, email, phone, country, bio, avatar_url").eq("id", au.id).maybeSingle();
          if (p) {
            setForm({ fullName: p.full_name || "", email: p.email || au.email || "", phone: p.phone || "", country: p.country || "Nigeria", bio: p.bio || "" });
            setAvatarUrl(p.avatar_url || null);
          }
        }
      } catch { /* keep local */ }
      setLoaded(true);
    })();
  }, [supabaseEnabled]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setErr(""); setMsg("");
    if (!form.fullName.trim()) { setErr("Please enter your full name."); return; }
    setBusy(true);
    try {
      if (supabaseEnabled) {
        const sb = getBrowserSupabase();
        const { data: { user: au } } = await sb.auth.getUser();
        const { error } = await updateProfile(sb, au.id, { full_name: form.fullName.trim(), phone: form.phone, country: form.country, bio: form.bio });
        if (error) throw new Error(error.message);
      }
      setMsg("Profile saved."); setEditing(false);
      setTimeout(() => setMsg(""), 4000);
    } catch (e) { setErr(e.message || "Couldn't save"); }
    setBusy(false);
  };

  const onPhoto = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !supabaseEnabled) return;
    try {
      const sb = getBrowserSupabase();
      const { data: { user: au } } = await sb.auth.getUser();
      const url = await uploadAvatar(sb, au.id, f);
      await updateProfile(sb, au.id, { avatar_url: url });
      setAvatarUrl(url); setMsg("Photo updated.");
    } catch (e2) { setErr(e2.message || "Couldn't upload photo"); }
  };

  const initials = (form.fullName || "I").split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <SettingsCrumb current="My profile" onlyWhenFrom />
      <div className="page-head">
        <h1>My Profile</h1>
        <p>Your details as candidates and the NexIT team see them.</p>
      </div>
      {err && <div className="auth-error" style={{ marginBottom: 12 }}>{err}</div>}
      {msg && <div className="role-note ok" style={{ marginBottom: 12 }}>{msg}</div>}

      <div className="card pad" style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="ip-av">
            {avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatarUrl} alt="" />
              : <span>{initials}</span>}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>{form.fullName || "Your name"}</h3>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--muted)", wordBreak: "break-all" }}>{form.email}</p>
            <span className="pill-status" style={{ marginTop: 6, display: "inline-block" }}>{interviewerKind} Interviewer</span>
          </div>
        </div>
        {supabaseEnabled && (
          <label className="btn-outline" style={{ alignSelf: "flex-start", cursor: "pointer" }}>
            <IconUpload width={15} height={15} /> Change photo
            <input type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} />
          </label>
        )}

        <div className="ip-fields">
          <PField label="Full name" value={form.fullName} onChange={set("fullName")} editing={editing} />
          <PField label="Email" value={form.email} editing={false} note="Email can't be changed here." />
          <PField label="Phone" value={form.phone} onChange={set("phone")} editing={editing} placeholder="+234…" />
          <div className="field field-simple">
            <label htmlFor="ip-country">Country</label>
            {editing
              ? <select id="ip-country" value={form.country} onChange={set("country")}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select>
              : <div className="ip-val">{form.country || "—"}</div>}
          </div>
          <PField label="About" value={form.bio} onChange={set("bio")} editing={editing} textarea placeholder="Your experience and the areas you interview in." />
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
    </>
  );
}

function PField({ label, value, onChange, editing, textarea, placeholder, note }) {
  const id = `ip-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div className="field field-simple">
      <label htmlFor={id}>{label}</label>
      {editing
        ? (textarea
          ? <textarea id={id} rows={4} value={value} onChange={onChange} placeholder={placeholder} />
          : <input id={id} value={value} onChange={onChange} placeholder={placeholder} />)
        : <div className="ip-val">{value || "—"}</div>}
      {note && <small style={{ color: "var(--muted)", fontSize: 12 }}>{note}</small>}
    </div>
  );
}
