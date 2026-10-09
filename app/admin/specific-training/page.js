"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadRoleRequirements, loadSpecificCourses, createSpecificCourse, updateSpecificCourse, deleteSpecificCourse, ROLE_LABELS } from "@/lib/db";
import { IconPlus, IconX, IconCheck } from "@/components/Icons";
import { ApprovalBar, useCanApprove } from "@/components/admin/Approval";

const DEMO = [
  { id: "d1", role_key: "software", title: "Backend Foundations", summary: "APIs, databases, testing", level: "foundational", duration: "4 weeks", sort: 0, approved: true },
  { id: "d2", role_key: "software", title: "Production Engineering Intensive", summary: "System design, CI/CD, live build + practicals", level: "intensive", duration: "8 weeks", sort: 1, approved: false },
];

export default function AdminSpecificTraining() {
  const { supabaseEnabled } = useAuth();
  const [roles, setRoles] = useState([]);
  const [roleKey, setRoleKey] = useState("");
  const [courses, setCourses] = useState(supabaseEnabled ? null : DEMO);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const sb = () => getBrowserSupabase();
  const canApprove = useCanApprove();

  useEffect(() => {
    if (!supabaseEnabled) { setRoles(Object.entries(ROLE_LABELS).map(([k, v]) => ({ role_key: k, title: v }))); setRoleKey("software"); return; }
    (async () => {
      const { list } = await loadRoleRequirements(sb());
      setRoles(list);
      setRoleKey(list[0]?.role_key || "");
    })();
  }, [supabaseEnabled]);

  useEffect(() => {
    if (!roleKey) return;
    if (!supabaseEnabled) { setCourses(DEMO.filter((c) => c.role_key === roleKey)); return; }
    (async () => setCourses(await loadSpecificCourses(sb(), roleKey)))();
  }, [roleKey, supabaseEnabled]);

  const addCourse = async (level) => {
    setErr("");
    const row = { role_key: roleKey, title: "New course", summary: "", level, duration: "", sort: (courses?.length || 0) };
    if (supabaseEnabled) {
      const { data, error } = await createSpecificCourse(sb(), row);
      if (error) { setErr(error.message); return; }
      setCourses((cs) => [...(cs || []), data]);
    } else {
      setCourses((cs) => [...(cs || []), { ...row, id: `tmp_${Date.now()}` }]);
    }
  };

  const change = (id, field, value) => setCourses((cs) => cs.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  const save = async (c) => {
    setBusy(true); setErr("");
    if (supabaseEnabled) {
      const { error } = await updateSpecificCourse(sb(), c.id, { title: c.title, summary: c.summary, level: c.level, duration: c.duration, sort: Number(c.sort) || 0 });
      if (error) setErr(error.message);
    }
    setBusy(false);
  };

  const remove = async (c) => {
    if (!confirm(`Delete "${c.title}"?`)) return;
    if (supabaseEnabled) { const { error } = await deleteSpecificCourse(sb(), c.id); if (error) { setErr(error.message); return; } }
    setCourses((cs) => cs.filter((x) => x.id !== c.id));
  };

  return (
    <>
      <div className="page-head">
        <h1>Specific Training — curriculum</h1>
        <p>The NexIT-curated, role-specific programme candidates pay for. Organise courses by role and tier (Foundational vs Intensive). New courses and modules stay hidden from candidates until an approver publishes them.</p>
      </div>

      <div className="rr-top">
        <select className="rr-exp-input" style={{ minWidth: "min(220px, 100%)" }} value={roleKey} onChange={(e) => setRoleKey(e.target.value)}>
          {roles.map((r) => <option key={r.role_key} value={r.role_key}>{r.title}</option>)}
        </select>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn-outline" onClick={() => addCourse("foundational")}><IconPlus width={14} height={14} /> Foundational course</button>
          <button className="btn-solid" onClick={() => addCourse("intensive")}><IconPlus width={14} height={14} /> Intensive course</button>
        </div>
      </div>

      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}

      {courses === null ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>
      ) : courses.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>No courses for this role yet — add one above.</p>
      ) : (
        <div className="rr-grid">
          {courses.map((c) => (
            <div className="card pad rr-card" key={c.id}>
              <div className="rr-head">
                <input className="rr-title-input" value={c.title} onChange={(e) => change(c.id, "title", e.target.value)} />
                <button className="rr-del" onClick={() => remove(c)}><IconX width={16} height={16} /></button>
              </div>
              <ApprovalBar kind="course" id={c.id} approved={!!c.approved} canApprove={canApprove} withModules disabled={String(c.id).startsWith("tmp_")} onChange={(v) => change(c.id, "approved", v)} />
              <label className="cv-step-label">Summary</label>
              <textarea className="cvr-textarea" rows={2} value={c.summary || ""} onChange={(e) => change(c.id, "summary", e.target.value)} />
              <div className="field-row" style={{ marginTop: 10 }}>
                <div className="field field-simple">
                  <label>Tier</label>
                  <select value={c.level} onChange={(e) => change(c.id, "level", e.target.value)}>
                    <option value="foundational">Foundational</option>
                    <option value="intensive">Intensive</option>
                  </select>
                </div>
                <div className="field field-simple"><label>Duration</label><input value={c.duration || ""} onChange={(e) => change(c.id, "duration", e.target.value)} placeholder="e.g. 6 weeks" /></div>
                <div className="field field-simple"><label>Order</label><input type="number" value={c.sort ?? 0} onChange={(e) => change(c.id, "sort", e.target.value)} /></div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <button className="btn-solid" disabled={busy} onClick={() => save(c)}><IconCheck width={14} height={14} /> Save</button>
                {supabaseEnabled && !String(c.id).startsWith("tmp_") && (
                  <Link className="btn-outline" href={`/admin/specific-training/${c.id}`}>Content &amp; grading</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
