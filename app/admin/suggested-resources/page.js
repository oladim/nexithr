"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadRoleRequirements, loadSuggestedResources, createSuggestedResource, updateSuggestedResource, deleteSuggestedResource, ROLE_LABELS } from "@/lib/db";
import { IconPlus, IconCheck, IconX } from "@/components/Icons";

const CATEGORIES = ["technical", "administrative", "general"];

const DEMO = [
  { id: "d1", role_key: null, category: "administrative", title: "Effective workplace communication", description: "Free course on clear, professional communication.", url: "https://example.com", sort: 0 },
];

export default function AdminSuggestedResources() {
  const { supabaseEnabled } = useAuth();
  const sb = () => getBrowserSupabase();
  const [roles, setRoles] = useState([]);
  const [rows, setRows] = useState(supabaseEnabled ? null : DEMO);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled) { setRoles(Object.entries(ROLE_LABELS).map(([k, v]) => ({ role_key: k, title: v }))); return; }
    (async () => {
      const { list } = await loadRoleRequirements(sb());
      setRoles(list);
      setRows(await loadSuggestedResources(sb(), null));
    })();
  }, [supabaseEnabled]);

  const change = (id, f, v) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [f]: v } : r)));

  const add = async (draft) => {
    setErr("");
    if (!draft.title.trim()) { setErr("Title is required."); return; }
    const row = { role_key: draft.role_key || null, category: draft.category, title: draft.title, description: draft.description || null, url: draft.url || null, sort: rows?.length || 0 };
    if (supabaseEnabled) {
      const { data, error } = await createSuggestedResource(sb(), row);
      if (error) { setErr(error.message); return; }
      setRows((rs) => [...(rs || []), data]);
    } else setRows((rs) => [...(rs || []), { ...row, id: `tmp_${Date.now()}` }]);
    setAdding(false);
  };

  const save = async (r) => {
    setBusy(true); setErr("");
    if (supabaseEnabled) {
      const { error } = await updateSuggestedResource(sb(), r.id, { role_key: r.role_key || null, category: r.category, title: r.title, description: r.description || null, url: r.url || null, sort: Number(r.sort) || 0 });
      if (error) setErr(error.message);
    }
    setBusy(false);
  };
  const remove = async (r) => { if (!confirm(`Delete "${r.title}"?`)) return; if (supabaseEnabled) { const { error } = await deleteSuggestedResource(sb(), r.id); if (error) { setErr(error.message); return; } } setRows((rs) => rs.filter((x) => x.id !== r.id)); };

  const roleName = (k) => (k ? (ROLE_LABELS[k] || k) : "All roles");

  return (
    <>
      <div className="page-head">
        <h1>Suggested Resources</h1>
        <p>Free / low-cost learning resources shown to candidates on their Suggested Training page, alongside their AI-generated plan.</p>
      </div>
      <div className="rr-top">
        <span className="cvr-count">{(rows || []).length} resources</span>
        {!adding && <button className="btn-solid" onClick={() => setAdding(true)}><IconPlus width={14} height={14} /> Add resource</button>}
      </div>
      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}
      {adding && <ResourceForm roles={roles} onCancel={() => setAdding(false)} onSave={add} />}

      {rows === null ? <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p> : (
        <div className="rr-grid">
          {rows.map((r) => (
            <div className="card pad rr-card" key={r.id}>
              <div className="rr-head">
                <input className="rr-title-input" value={r.title} onChange={(e) => change(r.id, "title", e.target.value)} />
                <button className="rr-del" onClick={() => remove(r)}><IconX width={16} height={16} /></button>
              </div>
              <label className="cv-step-label">Description</label>
              <textarea className="cvr-textarea" rows={2} value={r.description || ""} onChange={(e) => change(r.id, "description", e.target.value)} />
              <label className="cv-step-label" style={{ marginTop: 10 }}>URL</label>
              <input className="rr-exp-input" style={{ width: "100%" }} value={r.url || ""} onChange={(e) => change(r.id, "url", e.target.value)} placeholder="https://…" />
              <div className="field-row" style={{ marginTop: 10 }}>
                <div className="field field-simple"><label>Audience</label>
                  <select value={r.role_key || ""} onChange={(e) => change(r.id, "role_key", e.target.value || null)}>
                    <option value="">All roles</option>
                    {roles.map((x) => <option key={x.role_key} value={x.role_key}>{x.title}</option>)}
                  </select>
                </div>
                <div className="field field-simple"><label>Category</label>
                  <select value={r.category} onChange={(e) => change(r.id, "category", e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c} style={{ textTransform: "capitalize" }}>{c}</option>)}
                  </select>
                </div>
                <div className="field field-simple"><label>Order</label><input type="number" value={r.sort ?? 0} onChange={(e) => change(r.id, "sort", e.target.value)} /></div>
              </div>
              <button className="btn-solid" style={{ marginTop: 12 }} disabled={busy} onClick={() => save(r)}><IconCheck width={14} height={14} /> Save</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ResourceForm({ roles, onCancel, onSave }) {
  const [f, setF] = useState({ title: "", description: "", url: "", role_key: "", category: "general" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="card pad rr-new">
      <div className="rr-head"><h3 className="card-title" style={{ margin: 0 }}>New resource</h3><button className="rr-del" onClick={onCancel}><IconX width={16} height={16} /></button></div>
      <label className="cv-step-label">Title</label>
      <input className="rr-title-input full" value={f.title} onChange={set("title")} placeholder="e.g. System Design Primer (free)" />
      <label className="cv-step-label" style={{ marginTop: 10 }}>Description</label>
      <textarea className="cvr-textarea" rows={2} value={f.description} onChange={set("description")} />
      <label className="cv-step-label" style={{ marginTop: 10 }}>URL</label>
      <input className="rr-exp-input" style={{ width: "100%" }} value={f.url} onChange={set("url")} placeholder="https://…" />
      <div className="field-row" style={{ marginTop: 10 }}>
        <div className="field field-simple"><label>Audience</label>
          <select value={f.role_key} onChange={set("role_key")}>
            <option value="">All roles</option>
            {roles.map((x) => <option key={x.role_key} value={x.role_key}>{x.title}</option>)}
          </select>
        </div>
        <div className="field field-simple"><label>Category</label>
          <select value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </div>
      </div>
      <div className="cvr-actions" style={{ marginTop: 14 }}>
        <button className="btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn-solid" onClick={() => onSave(f)}><IconPlus width={14} height={14} /> Add</button>
      </div>
    </div>
  );
}
