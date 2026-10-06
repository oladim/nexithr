"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadRoleRequirements, saveRoleRequirement, createRoleRequirement, deleteRoleRequirement } from "@/lib/db";
import { DEFAULT_REQS } from "@/lib/cvMatch";
import { IconCheck, IconPlus, IconX } from "@/components/Icons";

const slugify = (s) =>
  String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "role";

const toSkills = (v) => (Array.isArray(v) ? v : String(v || "").split(",")).map((s) => s.trim()).filter(Boolean);

export default function RoleRequirements() {
  const { supabaseEnabled } = useAuth();
  const [reqs, setReqs] = useState(supabaseEnabled ? null : DEFAULT_REQS);
  const [busyKey, setBusyKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);

  const sb = () => getBrowserSupabase();

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const { list } = await loadRoleRequirements(sb());
      setReqs(list.length ? list : DEFAULT_REQS);
    })();
  }, [supabaseEnabled]);

  const update = (key, field, value) =>
    setReqs((rs) => rs.map((r) => (r.role_key === key ? { ...r, [field]: value } : r)));

  const flash = (key) => { setSavedKey(key); setTimeout(() => setSavedKey(null), 2200); };

  // UPDATE
  const save = async (r) => {
    setErr(""); setBusyKey(r.role_key);
    const payload = {
      title: r.title,
      required_skills: toSkills(r.required_skills),
      min_experience: Number(r.min_experience) || 0,
      description: r.description || null,
      enabled: r.enabled !== false,
      training_amount: r.training_amount === "" || r.training_amount == null ? null : Number(r.training_amount),
    };
    if (supabaseEnabled) {
      const { error } = await saveRoleRequirement(sb(), r.role_key, payload);
      if (error) { setErr(error.message); setBusyKey(null); return; }
    }
    setReqs((rs) => rs.map((x) => (x.role_key === r.role_key ? { ...x, ...payload } : x)));
    setBusyKey(null); flash(r.role_key);
  };

  // DELETE
  const remove = async (r) => {
    if (!confirm(`Delete the "${r.title}" role requirement? This can't be undone.`)) return;
    setErr(""); setBusyKey(r.role_key);
    if (supabaseEnabled) {
      const { error } = await deleteRoleRequirement(sb(), r.role_key);
      if (error) { setErr(error.message); setBusyKey(null); return; }
    }
    setReqs((rs) => rs.filter((x) => x.role_key !== r.role_key));
    setBusyKey(null);
  };

  // CREATE
  const create = async (draft) => {
    setErr("");
    const title = draft.title.trim();
    if (!title) { setErr("Give the role a title."); return; }
    let key = slugify(title);
    const existing = new Set(reqs.map((r) => r.role_key));
    if (existing.has(key)) { let i = 2; while (existing.has(`${key}-${i}`)) i++; key = `${key}-${i}`; }
    const row = { role_key: key, title, required_skills: toSkills(draft.required_skills), min_experience: Number(draft.min_experience) || 1, description: draft.description || null };
    setBusyKey("__new__");
    if (supabaseEnabled) {
      const { error } = await createRoleRequirement(sb(), row);
      if (error) { setErr(error.message); setBusyKey(null); return; }
    }
    setReqs((rs) => [...rs, row]);
    setBusyKey(null); setAdding(false); flash(key);
  };

  return (
    <>
      <div className="page-head">
        <h1>Role Requirements</h1>
        <p>Define the skillset and brief for each role. Submitted CVs are scored against these during review. Add, edit, or remove roles freely.</p>
      </div>

      <div className="rr-top">
        <span className="cvr-count">{(reqs || []).length} roles</span>
        {!adding && <button className="btn-solid" onClick={() => setAdding(true)}><IconPlus width={15} height={15} /> Add role</button>}
      </div>

      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}

      {adding && <NewRoleForm busy={busyKey === "__new__"} onCancel={() => setAdding(false)} onCreate={create} />}

      {reqs === null ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>
      ) : (
        <div className="rr-grid">
          {reqs.map((r) => (
            <div className="card pad rr-card" key={r.role_key}>
              <div className="rr-head">
                <input className="rr-title-input" value={r.title} onChange={(e) => update(r.role_key, "title", e.target.value)} />
                <button className="rr-del" title="Delete role" onClick={() => remove(r)} disabled={busyKey === r.role_key}><IconX width={16} height={16} /></button>
              </div>

              <label className="cv-step-label">Required skills (comma-separated)</label>
              <textarea className="cvr-textarea" rows={2}
                value={Array.isArray(r.required_skills) ? r.required_skills.join(", ") : r.required_skills}
                onChange={(e) => update(r.role_key, "required_skills", e.target.value)} />

              <label className="cv-step-label" style={{ marginTop: 12 }}>Role brief / detailed requirements</label>
              <textarea className="cvr-textarea" rows={5} placeholder="Full description of the role — responsibilities, must-haves, nice-to-haves…"
                value={r.description || ""} onChange={(e) => update(r.role_key, "description", e.target.value)} />

              <div className="rr-exp">
                <label className="cv-step-label" style={{ margin: 0 }}>Min. experience (years)</label>
                <input type="number" min={0} className="rr-exp-input" value={r.min_experience}
                  onChange={(e) => update(r.role_key, "min_experience", e.target.value)} />
              </div>

              <div className="rr-exp" style={{ marginTop: 10 }}>
                <label className="cv-step-label" style={{ margin: 0 }}>Specific-training price (₦ — blank = default)</label>
                <input type="number" min={0} className="rr-exp-input" placeholder="default" value={r.training_amount ?? ""}
                  onChange={(e) => update(r.role_key, "training_amount", e.target.value)} />
              </div>

              <label className="consent-check" style={{ marginTop: 12 }}>
                <input type="checkbox" checked={r.enabled !== false} onChange={(e) => update(r.role_key, "enabled", e.target.checked)} />
                <span>Open for applications — candidates can select this role and upload a CV for it.</span>
              </label>

              <button className="btn-solid" style={{ marginTop: 12 }} disabled={busyKey === r.role_key} onClick={() => save(r)}>
                {savedKey === r.role_key ? <><IconCheck width={15} height={15} /> Saved</> : busyKey === r.role_key ? "Saving…" : "Save changes"}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function NewRoleForm({ busy, onCancel, onCreate }) {
  const [title, setTitle] = useState("");
  const [required_skills, setSkills] = useState("");
  const [min_experience, setMin] = useState(1);
  const [description, setDescription] = useState("");

  return (
    <div className="card pad rr-new">
      <div className="rr-head">
        <h3 className="card-title" style={{ margin: 0 }}>New role</h3>
        <button className="rr-del" onClick={onCancel} title="Cancel"><IconX width={16} height={16} /></button>
      </div>
      <label className="cv-step-label">Role title</label>
      <input className="rr-title-input full" placeholder="e.g. Mobile Developer" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label className="cv-step-label" style={{ marginTop: 12 }}>Required skills (comma-separated)</label>
      <textarea className="cvr-textarea" rows={2} placeholder="e.g. Kotlin, Swift, React Native, REST APIs" value={required_skills} onChange={(e) => setSkills(e.target.value)} />
      <label className="cv-step-label" style={{ marginTop: 12 }}>Role brief / detailed requirements</label>
      <textarea className="cvr-textarea" rows={5} placeholder="Full description of the role…" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="rr-exp">
        <label className="cv-step-label" style={{ margin: 0 }}>Min. experience (years)</label>
        <input type="number" min={0} className="rr-exp-input" value={min_experience} onChange={(e) => setMin(e.target.value)} />
      </div>
      <div className="cvr-actions" style={{ marginTop: 14 }}>
        <button className="btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="btn-solid" onClick={() => onCreate({ title, required_skills, min_experience, description })} disabled={busy}>
          <IconPlus width={15} height={15} /> {busy ? "Adding…" : "Add role"}
        </button>
      </div>
    </div>
  );
}
