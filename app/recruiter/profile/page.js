"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadProfileDetails, updateProfile } from "@/lib/db";

export default function RecruiterProfile() {
  const { user, supabaseEnabled } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", orgName: "", bio: "" });
  const [loading, setLoading] = useState(supabaseEnabled);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const nm = user?.name || "";
    const base = { firstName: nm.split(" ")[0] || "", lastName: nm.split(" ").slice(1).join(" "), email: user?.email || "", phone: "", orgName: "", bio: "" };
    if (!supabaseEnabled) { setForm(base); return; }
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) { setForm(base); setLoading(false); return; }
      try {
        const { data: { user: u } } = await sb.auth.getUser();
        if (u) {
          const { profile } = await loadProfileDetails(sb, u.id);
          const full = profile.full_name || nm;
          setForm({
            firstName: full.split(" ")[0] || "",
            lastName: full.split(" ").slice(1).join(" "),
            email: profile.email || user?.email || "",
            phone: profile.phone || "",
            orgName: profile.org_name || "",
            bio: profile.bio || "",
          });
        } else setForm(base);
      } catch { setForm(base); }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseEnabled]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const initials = `${form.firstName} ${form.lastName}`.trim().split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "R";

  const save = async () => {
    setMsg(""); setErr("");
    if (!supabaseEnabled) { setMsg("Saved (demo)."); return; }
    setBusy(true);
    try {
      const sb = getBrowserSupabase();
      const { data: { user: u } } = await sb.auth.getUser();
      if (!u) { setErr("Please sign in."); setBusy(false); return; }
      const full_name = [form.firstName, form.lastName].filter(Boolean).join(" ");
      const { error } = await updateProfile(sb, u.id, { full_name, phone: form.phone || null, org_name: form.orgName || null, bio: form.bio || null });
      if (error) { setErr(error.message); setBusy(false); return; }
      setMsg("Profile updated.");
    } catch (e) { setErr(e.message || String(e)); }
    setBusy(false);
  };

  return (
    <>
      <div className="page-head">
        <h1>Profile</h1>
        <p>Your recruiter profile — this is what candidates and the NexIT team see.</p>
      </div>

      <div className="card pad" style={{ maxWidth: 720 }}>
        {loading ? <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p> : (
          <>
            <div className="cand-head" style={{ marginBottom: 20 }}>
              <span className="big-av" style={{ background: "linear-gradient(135deg,#007bff,#1c1f2a)" }}>{initials}</span>
              <div>
                <h1 style={{ fontSize: 20 }}>{[form.firstName, form.lastName].filter(Boolean).join(" ") || "Recruiter"}</h1>
                <p>{form.orgName ? `${form.orgName} · ` : ""}NexIT-Africa partner</p>
              </div>
            </div>

            {msg && <div className="role-note ok" style={{ marginBottom: 12 }}>{msg}</div>}
            {err && <div className="auth-error" style={{ marginBottom: 12 }}>{err}</div>}

            <div className="field-row">
              <div className="note-field"><label>First name</label><input value={form.firstName} onChange={set("firstName")} /></div>
              <div className="note-field"><label>Last name</label><input value={form.lastName} onChange={set("lastName")} /></div>
            </div>
            <div className="field-row">
              <div className="note-field"><label>Email</label><input value={form.email} disabled title="Email is managed by your login" /></div>
              <div className="note-field"><label>Phone</label><input value={form.phone} onChange={set("phone")} placeholder="+234 ..." /></div>
            </div>
            <div className="note-field"><label>Company</label><input value={form.orgName} onChange={set("orgName")} placeholder="e.g. TechCorp Inc" /></div>
            <div className="note-field"><label>About</label><textarea rows={4} value={form.bio} onChange={set("bio")} placeholder="Tell candidates about your company…" /></div>
            <button className="btn-solid" onClick={save} disabled={busy}>{busy ? "Saving…" : "Update Profile"}</button>
          </>
        )}
      </div>
    </>
  );
}
