"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "@/lib/db";
import { IconPlus, IconX, IconCheck } from "@/components/Icons";

const DEMO = [
  { id: "d1", name: "Chidi A.", role: "Backend Engineer", company: "Paystack", quote: "The diagnostic showed exactly what I was missing. After the intensive I got placed.", outcome: "Placed in 7 weeks", published: true, sort: 0 },
];

export default function AdminTestimonials() {
  const { supabaseEnabled } = useAuth();
  const [rows, setRows] = useState(supabaseEnabled ? null : DEMO);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const sb = () => getBrowserSupabase();

  const load = async () => {
    if (!supabaseEnabled) { setRows(DEMO); return; }
    setRows(await loadTestimonials(sb(), false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [supabaseEnabled]);

  const add = async () => {
    const row = { name: "New name", role: "", company: "", quote: "", outcome: "", published: true, sort: rows?.length || 0 };
    if (supabaseEnabled) { const { data, error } = await createTestimonial(sb(), row); if (error) { setErr(error.message); return; } setRows((r) => [...(r || []), data]); }
    else setRows((r) => [...(r || []), { ...row, id: `tmp_${Date.now()}` }]);
  };
  const change = (id, f, v) => setRows((r) => r.map((x) => (x.id === id ? { ...x, [f]: v } : x)));
  const save = async (t) => {
    setBusy(true); setErr("");
    if (supabaseEnabled) { const { error } = await updateTestimonial(sb(), t.id, { name: t.name, role: t.role, company: t.company, quote: t.quote, outcome: t.outcome, published: t.published, sort: Number(t.sort) || 0 }); if (error) setErr(error.message); }
    setBusy(false);
  };
  const remove = async (t) => { if (!confirm("Delete this testimonial?")) return; if (supabaseEnabled) { const { error } = await deleteTestimonial(sb(), t.id); if (error) { setErr(error.message); return; } } setRows((r) => r.filter((x) => x.id !== t.id)); };

  return (
    <>
      <div className="page-head">
        <h1>Testimonials &amp; outcomes</h1>
        <p>Real graduate outcomes shown to candidates on the training pages. Publish only genuine, consented stories.</p>
      </div>
      <div className="rr-top">
        <span className="cvr-count">{(rows || []).length} entries</span>
        <button className="btn-solid" onClick={add}><IconPlus width={14} height={14} /> Add</button>
      </div>
      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}
      {rows === null ? <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p> : (
        <div className="rr-grid">
          {rows.map((t) => (
            <div className="card pad rr-card" key={t.id}>
              <div className="rr-head">
                <input className="rr-title-input" value={t.name} onChange={(e) => change(t.id, "name", e.target.value)} />
                <button className="rr-del" onClick={() => remove(t)}><IconX width={16} height={16} /></button>
              </div>
              <div className="field-row">
                <div className="field field-simple"><label>Role</label><input value={t.role || ""} onChange={(e) => change(t.id, "role", e.target.value)} /></div>
                <div className="field field-simple"><label>Company</label><input value={t.company || ""} onChange={(e) => change(t.id, "company", e.target.value)} /></div>
              </div>
              <label className="cv-step-label" style={{ marginTop: 10 }}>Quote</label>
              <textarea className="cvr-textarea" rows={3} value={t.quote || ""} onChange={(e) => change(t.id, "quote", e.target.value)} />
              <label className="cv-step-label" style={{ marginTop: 10 }}>Outcome (e.g. &quot;Placed in 7 weeks&quot;)</label>
              <input className="rr-title-input full" value={t.outcome || ""} onChange={(e) => change(t.id, "outcome", e.target.value)} />
              <label className="consent-check" style={{ marginTop: 10 }}>
                <input type="checkbox" checked={t.published !== false} onChange={(e) => change(t.id, "published", e.target.checked)} />
                <span>Published (visible to candidates)</span>
              </label>
              <button className="btn-solid" style={{ marginTop: 12 }} disabled={busy} onClick={() => save(t)}><IconCheck width={14} height={14} /> Save</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
