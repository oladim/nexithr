"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconPlus, IconCheck, IconX } from "@/components/Icons";

const BUNDLED = ["/images/team-1.jpg", "/images/team-2.jpg", "/images/team-3.jpg", "/images/team-4.jpg", "/images/avatar.png", "/images/user.png"];

export default function AdminLanding() {
  const { supabaseEnabled } = useAuth();

  if (!supabaseEnabled) {
    return (
      <>
        <div className="page-head"><h1>Landing Page</h1><p>Connect Supabase (real mode) to manage the hero spotlights shown on your public landing page.</p></div>
      </>
    );
  }
  return <Manage />;
}

function Manage() {
  const [rows, setRows] = useState(null);
  const [count, setCount] = useState(6);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const res = await fetch("/api/admin/landing");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRows(data.spotlights);
      setCount(data.count ?? 6);
    } catch (e) { setErr(e.message); setRows([]); }
  };
  useEffect(() => { load(); }, []);

  const saveCount = async (c) => {
    setCount(c);
    try { await fetch("/api/admin/landing", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count: c }) }); setMsg("Display count saved."); setTimeout(() => setMsg(""), 2500); }
    catch { /* ignore */ }
  };

  return (
    <>
      <div className="page-head">
        <h1>Landing Page</h1>
        <p>Manage the scrolling spotlight cards shown in your public hero (&ldquo;NexIT is a life-changing discovery&rdquo;). Add testimonials or highlights, pick an image, reorder, and choose how many appear.</p>
      </div>

      {msg && <div className="role-note ok">{msg}</div>}
      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}

      <div className="card pad" style={{ maxWidth: 520, marginBottom: 18 }}>
        <label className="cv-step-label">How many spotlights to show in the hero</label>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
          <input type="number" min="0" max="20" value={count} onChange={(e) => setCount(e.target.value)} onBlur={(e) => saveCount(Math.max(0, Math.round(Number(e.target.value) || 0)))} className="rr-exp-input" style={{ width: 90 }} />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>0 = show all enabled</span>
        </div>
      </div>

      <div className="rr-top">
        <span className="cvr-count">{(rows || []).length} spotlights</span>
        {!adding && <button className="btn-solid" onClick={() => setAdding(true)}><IconPlus width={14} height={14} /> Add spotlight</button>}
      </div>

      {adding && <SpotForm nextSort={(rows || []).length} onCancel={() => setAdding(false)} onDone={async (m) => { setAdding(false); setMsg(m); await load(); }} setErr={setErr} />}

      {rows === null ? <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p> : (
        <div className="rr-grid">
          {rows.map((r) => <SpotCard key={r.id} row={r} reload={load} setMsg={setMsg} setErr={setErr} />)}
        </div>
      )}
    </>
  );
}

function ImagePicker({ value, onChange }) {
  return (
    <>
      <input className="rr-exp-input" style={{ width: "100%" }} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="/images/team-1.jpg or https://…" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {BUNDLED.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt="" width={46} height={46} onClick={() => onChange(src)}
            style={{ width: 46, height: 46, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: value === src ? "2px solid var(--blue)" : "2px solid transparent" }} />
        ))}
      </div>
    </>
  );
}

function SpotForm({ nextSort, onCancel, onDone, setErr }) {
  const [f, setF] = useState({ quote: "", name: "", role: "", image_url: "", sort: nextSort, enabled: true });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      const res = await fetch("/api/admin/landing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onDone("Spotlight added.");
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="card pad rr-new">
      <div className="rr-head"><h3 className="card-title" style={{ margin: 0 }}>New spotlight</h3><button className="rr-del" onClick={onCancel}><IconX width={16} height={16} /></button></div>
      <label className="cv-step-label">Quote / message</label>
      <textarea className="cvr-textarea" rows={3} value={f.quote} onChange={set("quote")} placeholder="e.g. NexIT is a life-changing discovery…" />
      <div className="field-row" style={{ marginTop: 10 }}>
        <div className="field field-simple"><label>Name</label><input value={f.name} onChange={set("name")} placeholder="Amara O." /></div>
        <div className="field field-simple"><label>Role / title</label><input value={f.role} onChange={set("role")} placeholder="Full-Stack Developer" /></div>
      </div>
      <label className="cv-step-label" style={{ marginTop: 10 }}>Image</label>
      <ImagePicker value={f.image_url} onChange={(v) => setF((p) => ({ ...p, image_url: v }))} />
      <div className="cvr-actions" style={{ marginTop: 14 }}>
        <button className="btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="btn-solid" onClick={submit} disabled={busy}><IconPlus width={14} height={14} /> {busy ? "Adding…" : "Add"}</button>
      </div>
    </div>
  );
}

function SpotCard({ row, reload, setMsg, setErr }) {
  const [f, setF] = useState(row);
  const [busy, setBusy] = useState(false);
  const change = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setBusy(true); setErr(""); setMsg("");
    try {
      const res = await fetch("/api/admin/landing", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: row.id, quote: f.quote, name: f.name, role: f.role, image_url: f.image_url, sort: Number(f.sort) || 0 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg("Saved."); await reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const toggle = async () => {
    setBusy(true);
    try { await fetch("/api/admin/landing", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: row.id, enabled: !f.enabled }) }); await reload(); }
    catch { /* ignore */ } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!confirm("Delete this spotlight?")) return;
    setBusy(true);
    try { await fetch(`/api/admin/landing?id=${row.id}`, { method: "DELETE" }); await reload(); }
    catch { /* ignore */ } finally { setBusy(false); }
  };

  return (
    <div className="card pad rr-card">
      <div className="rr-head">
        <span className="cvr-count" style={{ fontSize: 12 }}>{f.enabled ? "Visible" : "Hidden"}</span>
        <button className="rr-del" onClick={remove} disabled={busy}><IconX width={16} height={16} /></button>
      </div>
      {f.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={f.image_url} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
      )}
      <label className="cv-step-label">Quote</label>
      <textarea className="cvr-textarea" rows={3} value={f.quote || ""} onChange={(e) => change("quote", e.target.value)} />
      <div className="field-row" style={{ marginTop: 8 }}>
        <div className="field field-simple"><label>Name</label><input value={f.name || ""} onChange={(e) => change("name", e.target.value)} /></div>
        <div className="field field-simple"><label>Role</label><input value={f.role || ""} onChange={(e) => change("role", e.target.value)} /></div>
      </div>
      <label className="cv-step-label" style={{ marginTop: 8 }}>Image</label>
      <ImagePicker value={f.image_url} onChange={(v) => change("image_url", v)} />
      <div className="field field-simple" style={{ marginTop: 8, maxWidth: 120 }}><label>Order</label><input type="number" value={f.sort ?? 0} onChange={(e) => change("sort", e.target.value)} /></div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button className="btn-solid" disabled={busy} onClick={save}><IconCheck width={14} height={14} /> Save</button>
        <button className="btn-outline" disabled={busy} onClick={toggle}>{f.enabled ? "Hide" : "Show"}</button>
      </div>
    </div>
  );
}
