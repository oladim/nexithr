"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadCourseModules, createModule, updateModule, deleteModule, uploadTrainingFile } from "@/lib/db";
import { IconPlus, IconCheck, IconX, IconFileText } from "@/components/Icons";

const TYPES = [
  { v: "text", label: "Reading (text)" },
  { v: "video", label: "Video" },
  { v: "pdf", label: "PDF material" },
  { v: "assignment", label: "Assignment (tutor-graded)" },
  { v: "test", label: "Test (tutor-graded)" },
  { v: "quiz", label: "Quiz (auto-graded MCQ)" },
];
const gradable = (t) => t === "assignment" || t === "test" || t === "quiz";

export default function AdminCourseManage() {
  const { id: courseId } = useParams();
  const { supabaseEnabled } = useAuth();
  const sb = () => getBrowserSupabase();
  const [tab, setTab] = useState("content");

  return (
    <>
      <div className="page-head">
        <h1>Course content &amp; grading</h1>
        <p>Build the curriculum (readings, videos, PDFs, assignments, tests) and grade students.</p>
      </div>
      <div className="set-tabs" style={{ marginBottom: 20 }}>
        <button className={`set-tab ${tab === "content" ? "active" : ""}`} onClick={() => setTab("content")}>Content</button>
        <button className={`set-tab ${tab === "grading" ? "active" : ""}`} onClick={() => setTab("grading")}>Grading &amp; results</button>
      </div>
      {!supabaseEnabled ? (
        <div className="feedback-card"><p style={{ margin: 0 }}>Connect Supabase (real mode) to manage course content and grading.</p></div>
      ) : tab === "content" ? (
        <ContentEditor courseId={courseId} sb={sb} />
      ) : (
        <Grading courseId={courseId} />
      )}
      <div style={{ marginTop: 20 }}><Link href="/admin/specific-training" className="btn-outline">Back to courses</Link></div>
    </>
  );
}

function ContentEditor({ courseId, sb }) {
  const [mods, setMods] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => setMods(await loadCourseModules(sb(), courseId));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [courseId]);

  const add = async () => {
    setErr("");
    const row = { course_id: courseId, title: "New module", type: "text", content: "", max_score: 0, sort: (mods?.length || 0) };
    const { data, error } = await createModule(sb(), row);
    if (error) { setErr(error.message); return; }
    setMods((m) => [...(m || []), data]);
  };
  const change = (id, f, v) => setMods((m) => m.map((x) => (x.id === id ? { ...x, [f]: v } : x)));
  const save = async (mod) => {
    setBusy(true); setErr("");
    const { error } = await updateModule(sb(), mod.id, {
      title: mod.title, type: mod.type, content: mod.content || null, video_url: mod.video_url || null,
      file_path: mod.file_path || null, max_score: gradable(mod.type) ? Number(mod.max_score) || 0 : 0, sort: Number(mod.sort) || 0,
      questions: mod.type === "quiz" ? (mod.questions || []) : null,
    });
    if (error) setErr(error.message);
    setBusy(false);
  };
  const remove = async (mod) => { if (!confirm(`Delete "${mod.title}"?`)) return; const { error } = await deleteModule(sb(), mod.id); if (error) { setErr(error.message); return; } setMods((m) => m.filter((x) => x.id !== mod.id)); };

  const onFile = async (mod, e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setErr("");
    try {
      const { data: { user } } = await sb().auth.getUser();
      const { path, name } = await uploadTrainingFile(sb(), user.id, f);
      change(mod.id, "file_path", path);
      change(mod.id, "_fileName", name);
    } catch (e2) { setErr(e2.message); }
  };

  return (
    <>
      <div className="rr-top">
        <span className="cvr-count">{(mods || []).length} modules</span>
        <button className="btn-solid" onClick={add}><IconPlus width={14} height={14} /> Add module</button>
      </div>
      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}
      {mods === null ? <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p> : mods.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>No modules yet — add the first one.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mods.map((m) => (
            <div className="card pad" key={m.id}>
              <div className="rr-head">
                <input className="rr-title-input" value={m.title} onChange={(e) => change(m.id, "title", e.target.value)} />
                <button className="rr-del" onClick={() => remove(m)}><IconX width={16} height={16} /></button>
              </div>
              <div className="field-row">
                <div className="field field-simple"><label>Type</label>
                  <select value={m.type} onChange={(e) => change(m.id, "type", e.target.value)}>
                    {TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
                  </select>
                </div>
                <div className="field field-simple"><label>Order</label><input type="number" value={m.sort ?? 0} onChange={(e) => change(m.id, "sort", e.target.value)} /></div>
                {gradable(m.type) && <div className="field field-simple"><label>Max score</label><input type="number" min="0" value={m.max_score ?? 0} onChange={(e) => change(m.id, "max_score", e.target.value)} /></div>}
              </div>

              {m.type === "video" && (
                <>
                  <label className="cv-step-label" style={{ marginTop: 8 }}>Video URL (YouTube/Vimeo/MP4)</label>
                  <input className="rr-exp-input" style={{ width: "100%" }} value={m.video_url || ""} onChange={(e) => change(m.id, "video_url", e.target.value)} placeholder="https://…" />
                </>
              )}
              {(m.type === "pdf" || gradable(m.type)) && (
                <div style={{ marginTop: 10 }}>
                  <label className="cv-step-label">{m.type === "pdf" ? "PDF material" : "Attach brief/PDF (optional)"}</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <label className="btn-outline" style={{ cursor: "pointer" }}><IconFileText width={14} height={14} /> Upload file<input type="file" accept=".pdf,.doc,.docx" onChange={(e) => onFile(m, e)} style={{ display: "none" }} /></label>
                    {(m._fileName || m.file_path) && <span style={{ fontSize: 13, color: "var(--muted)" }}>{m._fileName || m.file_path.split("/").pop()}</span>}
                  </div>
                </div>
              )}
              {m.type === "quiz" && (
                <QuizEditor questions={m.questions || []} onChange={(q) => change(m.id, "questions", q)} />
              )}

              <label className="cv-step-label" style={{ marginTop: 10 }}>
                {m.type === "quiz" ? "Intro (optional)" : gradable(m.type) ? "Instructions / question" : "Content"}
              </label>
              <textarea className="cvr-textarea" rows={m.type === "quiz" ? 2 : gradable(m.type) ? 3 : 5} value={m.content || ""} onChange={(e) => change(m.id, "content", e.target.value)} placeholder={m.type === "quiz" ? "Short intro shown above the questions." : gradable(m.type) ? "What should the student do / submit?" : "Lesson text…"} />

              <button className="btn-solid" style={{ marginTop: 12 }} disabled={busy} onClick={() => save(m)}><IconCheck width={14} height={14} /> Save module</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function QuizEditor({ questions, onChange }) {
  const addQ = () => onChange([...(questions || []), { q: "", options: ["", ""], answer: 0 }]);
  const setQ = (i, patch) => onChange(questions.map((q, k) => (k === i ? { ...q, ...patch } : q)));
  const delQ = (i) => onChange(questions.filter((_, k) => k !== i));
  const setOpt = (i, oi, val) => setQ(i, { options: questions[i].options.map((o, k) => (k === oi ? val : o)) });
  const addOpt = (i) => setQ(i, { options: [...questions[i].options, ""] });
  const delOpt = (i, oi) => {
    const opts = questions[i].options.filter((_, k) => k !== oi);
    const ans = questions[i].answer >= opts.length ? 0 : questions[i].answer;
    setQ(i, { options: opts, answer: ans });
  };

  return (
    <div style={{ marginTop: 10, border: "1px solid #eef1f6", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <b style={{ fontSize: 14 }}>Questions ({questions.length})</b>
        <button className="btn-outline" onClick={addQ}><IconPlus width={13} height={13} /> Add question</button>
      </div>
      {questions.map((q, i) => (
        <div key={i} style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #e2e2ea" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="rr-exp-input" style={{ flex: 1 }} value={q.q} onChange={(e) => setQ(i, { q: e.target.value })} placeholder={`Question ${i + 1}`} />
            <button className="rr-del" onClick={() => delQ(i)} title="Delete question"><IconX width={15} height={15} /></button>
          </div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {q.options.map((o, oi) => (
              <label key={oi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="radio" name={`ans-${i}`} checked={q.answer === oi} onChange={() => setQ(i, { answer: oi })} title="Mark correct" />
                <input className="rr-exp-input" style={{ flex: 1 }} value={o} onChange={(e) => setOpt(i, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                {q.options.length > 2 && <button className="rr-del" onClick={() => delOpt(i, oi)}><IconX width={13} height={13} /></button>}
              </label>
            ))}
            <button className="btn-outline" style={{ alignSelf: "flex-start", marginTop: 4 }} onClick={() => addOpt(i)}><IconPlus width={12} height={12} /> Option</button>
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: "6px 0 0" }}>Select the radio next to the correct option.</p>
        </div>
      ))}
      {questions.length === 0 && <p style={{ fontSize: 13, color: "var(--muted)", margin: "8px 0 0" }}>No questions yet — add one. The quiz auto-grades against the correct options.</p>}
    </div>
  );
}

function Grading({ courseId }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [flash, setFlash] = useState("");
  const [grades, setGrades] = useState({}); // submissionId -> {score, feedback}

  const load = async () => {
    try { const r = await fetch(`/api/admin/training?courseId=${courseId}`); const d = await r.json(); if (!r.ok) { setErr(d.error); return; } setData(d); } catch { setErr("Couldn't load"); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [courseId]);

  const grade = async (sub) => {
    const g = grades[sub.id] || {};
    const score = g.score ?? sub.score ?? 0;
    try {
      const r = await fetch("/api/admin/training", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "grade", submissionId: sub.id, score, feedback: g.feedback ?? sub.feedback ?? "" }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error); return; }
      setFlash("Graded."); setTimeout(() => setFlash(""), 3000); load();
    } catch { setErr("Couldn't grade"); }
  };

  const release = async (cand) => {
    if (!confirm(`Release results for ${cand.name}? They'll see their grades and overall score.`)) return;
    try {
      const r = await fetch("/api/admin/training", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "release", candidateId: cand.candidateId, courseId }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error); return; }
      setFlash(`Released — overall ${d.overall == null ? "—" : d.overall + "%"}.`); setTimeout(() => setFlash(""), 4000); load();
    } catch { setErr("Couldn't release"); }
  };

  if (err) return <div className="auth-error">{err}</div>;
  if (!data) return <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>;

  const subsByCand = {};
  data.submissions.forEach((s) => { (subsByCand[s.candidateId] = subsByCand[s.candidateId] || []).push(s); });

  return (
    <>
      {flash && <div className="role-note ok" style={{ marginBottom: 12 }}>{flash}</div>}
      <p style={{ fontSize: 13, color: "var(--muted)" }}>Total gradable points in this course: <b>{data.totalMax}</b></p>
      {data.roster.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>No enrolled students yet.</p>
      ) : (
        data.roster.map((cand) => (
          <div className="card pad" key={cand.candidateId} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <b>{cand.name}</b>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{cand.email} · {cand.graded}/{cand.submitted} graded{cand.released ? ` · released (${cand.overall ?? "—"}%)` : ""}</div>
              </div>
              <button className="btn-solid" onClick={() => release(cand)} disabled={cand.submitted === 0}>Release results</button>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {(subsByCand[cand.candidateId] || []).map((s) => (
                <div key={s.id} style={{ border: "1px solid #eef1f6", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <b style={{ fontSize: 14 }}>{s.moduleTitle} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {s.type} · max {s.maxScore}</span></b>
                    <span className={`pill-status ${s.status === "graded" ? "done" : "pending"}`}>{s.status}</span>
                  </div>
                  {s.text && <p style={{ fontSize: 13, margin: "8px 0 0", whiteSpace: "pre-wrap" }}>{s.text}</p>}
                  {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noreferrer" className="link" style={{ fontSize: 13 }}><IconFileText width={13} height={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />{s.fileName}</a>}
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginTop: 10, flexWrap: "wrap" }}>
                    <div className="field field-simple" style={{ width: 120 }}><label>Score (/{s.maxScore})</label>
                      <input type="number" min="0" max={s.maxScore} defaultValue={s.score ?? ""} onChange={(e) => setGrades((g) => ({ ...g, [s.id]: { ...g[s.id], score: e.target.value } }))} />
                    </div>
                    <div className="field field-simple" style={{ flex: 1, minWidth: 180 }}><label>Feedback</label>
                      <input defaultValue={s.feedback ?? ""} onChange={(e) => setGrades((g) => ({ ...g, [s.id]: { ...g[s.id], feedback: e.target.value } }))} placeholder="Optional" />
                    </div>
                    <button className="btn-outline" onClick={() => grade(s)}>Save grade</button>
                  </div>
                </div>
              ))}
              {(subsByCand[cand.candidateId] || []).length === 0 && <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No submissions yet.</p>}
            </div>
          </div>
        ))
      )}
    </>
  );
}
