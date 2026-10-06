"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { uploadTrainingFile } from "@/lib/db";
import { IconFileText, IconPlay, IconCheck, IconChevronRight } from "@/components/Icons";

function videoEmbed(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export default function CoursePlayer() {
  const { id: courseId } = useParams();
  const { supabaseEnabled } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    if (!supabaseEnabled) { setErr("Connect Supabase (real mode) to take courses."); return; }
    try {
      const r = await fetch(`/api/training/course?courseId=${courseId}`);
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Couldn't load course"); return; }
      setData(d);
    } catch { setErr("Couldn't load course"); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [courseId, supabaseEnabled]);

  if (err) {
    return (
      <>
        <div className="page-head"><h1>Course</h1></div>
        <div className="feedback-card"><p style={{ margin: 0 }}>{err}</p></div>
        <div style={{ marginTop: 16 }}><Link href="/dashboard/training/specific" className="btn-outline">Back to training</Link></div>
      </>
    );
  }
  if (!data) return <div className="page-head"><h1>Loading…</h1></div>;

  const { course, modules, enrollment } = data;

  return (
    <>
      <div className="page-head">
        <h1>{course.title}</h1>
        {course.summary && <p>{course.summary}</p>}
      </div>

      {enrollment.released && (
        <div className="feedback-card" style={{ background: "rgba(46,204,113,.10)", borderColor: "rgba(46,204,113,.3)", marginBottom: 16 }}>
          <h5 style={{ marginTop: 0 }}><IconCheck width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} /> Results released</h5>
          <p style={{ margin: 0 }}>Your overall course score: <b style={{ fontSize: 18 }}>{enrollment.overallScore == null ? "—" : `${enrollment.overallScore}%`}</b>. See per-task grades and feedback below.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {modules.length === 0 ? (
          <div className="feedback-card"><p style={{ margin: 0 }}>Your curriculum is being prepared — check back soon.</p></div>
        ) : modules.map((m, i) => (
          <Module key={m.id} m={m} index={i + 1} courseId={courseId} released={enrollment.released} onChanged={load} />
        ))}
      </div>

      <div style={{ marginTop: 20 }}><Link href="/dashboard/training/specific" className="btn-outline">Back to training</Link></div>
    </>
  );
}

function Module({ m, index, courseId, released, onChanged }) {
  const embed = videoEmbed(m.videoUrl);
  const gradable = m.type === "assignment" || m.type === "test";

  return (
    <div className="card pad">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <h3 className="card-title" style={{ margin: 0 }}>{index}. {m.title}</h3>
        <span className="pill-status" style={{ textTransform: "capitalize" }}>{m.type}{gradable ? ` · max ${m.maxScore}` : ""}</span>
      </div>

      {/* Content */}
      {m.type === "text" && m.content && <p style={{ whiteSpace: "pre-wrap", marginTop: 10, lineHeight: 1.6 }}>{m.content}</p>}

      {m.type === "video" && (
        <div style={{ marginTop: 10 }}>
          {embed ? (
            <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden" }}>
              <iframe src={embed} title={m.title} allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
            </div>
          ) : m.videoUrl ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video controls src={m.videoUrl} style={{ width: "100%", borderRadius: 12 }} />
          ) : <p style={{ color: "var(--muted)" }}>No video added yet.</p>}
          {m.content && <p style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{m.content}</p>}
        </div>
      )}

      {m.type === "pdf" && (
        <div style={{ marginTop: 10 }}>
          {m.materialUrl ? <a className="btn-outline" href={m.materialUrl} target="_blank" rel="noreferrer"><IconFileText width={14} height={14} /> Open material</a> : <p style={{ color: "var(--muted)" }}>No file yet.</p>}
          {m.content && <p style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{m.content}</p>}
        </div>
      )}

      {/* Assignment / test */}
      {gradable && (
        <div style={{ marginTop: 10 }}>
          {m.content && <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{m.content}</p>}
          {m.materialUrl && <a className="btn-outline" href={m.materialUrl} target="_blank" rel="noreferrer" style={{ marginBottom: 10, display: "inline-flex" }}><IconFileText width={14} height={14} /> Download brief</a>}
          <SubmissionArea m={m} courseId={courseId} released={released} onChanged={onChanged} />
        </div>
      )}

      {/* Quiz (auto-graded) */}
      {m.type === "quiz" && (
        <div style={{ marginTop: 10 }}>
          {m.content && <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{m.content}</p>}
          <QuizArea m={m} courseId={courseId} onChanged={onChanged} />
        </div>
      )}
    </div>
  );
}

function QuizArea({ m, courseId, onChanged }) {
  const sub = m.submission;
  const done = sub?.status === "graded";
  const [picks, setPicks] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);

  // Already taken → show the score.
  if (done || result) {
    const r = result || { score: sub.score, correct: sub.quizResult?.correct, total: sub.quizResult?.total, maxScore: m.maxScore };
    return (
      <div style={{ border: "1px solid rgba(46,204,113,.3)", background: "rgba(46,204,113,.08)", borderRadius: 12, padding: "12px 14px" }}>
        <b>Quiz complete — {r.score != null ? `${r.score} / ${m.maxScore}` : "submitted"}</b>
        {r.total != null && <p style={{ margin: "4px 0 0", fontSize: 14 }}>{r.correct} of {r.total} correct.</p>}
      </div>
    );
  }

  const questions = m.questions || [];
  const allAnswered = questions.length > 0 && questions.every((_, i) => picks[i] != null);

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      const answers = questions.map((_, i) => picks[i]);
      const r = await fetch("/api/training/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, moduleId: m.id, answers }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Couldn't submit"); setBusy(false); return; }
      setResult(d); setBusy(false); onChanged?.();
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <div>
      {questions.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>This quiz has no questions yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {questions.map((q, i) => (
            <div key={i}>
              <p style={{ fontWeight: 600, margin: "0 0 6px" }}>{i + 1}. {q.q}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(q.options || []).map((o, oi) => (
                  <label key={oi} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                    <input type="radio" name={`q-${m.id}-${i}`} checked={picks[i] === oi} onChange={() => setPicks((p) => ({ ...p, [i]: oi }))} />
                    {o}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {err && <div className="auth-error" style={{ marginTop: 8 }}>{err}</div>}
      <button className="btn-solid" style={{ marginTop: 12 }} disabled={busy || !allAnswered} onClick={submit}>
        {busy ? "Submitting…" : "Submit quiz"} <IconChevronRight width={14} height={14} />
      </button>
      {!allAnswered && questions.length > 0 && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Answer all questions to submit.</p>}
    </div>
  );
}

function SubmissionArea({ m, courseId, released, onChanged }) {
  const sub = m.submission;
  const graded = sub?.status === "graded";
  const [text, setText] = useState(sub?.text || "");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  // Graded + released → show the grade, not the form.
  if (graded && released) {
    return (
      <div style={{ border: "1px solid rgba(46,204,113,.3)", background: "rgba(46,204,113,.08)", borderRadius: 12, padding: "12px 14px" }}>
        <b>Score: {sub.score} / {m.maxScore}</b>
        {sub.feedback && <p style={{ margin: "6px 0 0", fontSize: 14 }}>{sub.feedback}</p>}
      </div>
    );
  }

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      let filePath = null;
      if (file) {
        const sb = getBrowserSupabase();
        const { data: { user } } = await sb.auth.getUser();
        const up = await uploadTrainingFile(sb, user.id, file);
        filePath = up.path;
      }
      const r = await fetch("/api/training/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, moduleId: m.id, text, filePath }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Couldn't submit"); setBusy(false); return; }
      setDone(true); setBusy(false); onChanged?.();
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <div style={{ marginTop: 10 }}>
      {sub && (
        <p className="pill-status pending" style={{ display: "inline-block", marginBottom: 8 }}>
          {graded ? "Graded — awaiting release" : "Submitted — awaiting grading"}
        </p>
      )}
      {!graded && (
        <>
          <label className="cv-step-label">Your answer</label>
          <textarea className="cvr-textarea" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your answer, or attach a file below." />
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
            <label className="btn-outline" style={{ cursor: "pointer" }}><IconFileText width={14} height={14} /> {file ? file.name : "Attach file"}<input type="file" accept=".pdf,.doc,.docx,.zip,.png,.jpg" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} /></label>
            <button className="btn-solid" disabled={busy || (!text.trim() && !file)} onClick={submit}>{busy ? "Submitting…" : sub ? "Resubmit" : "Submit"} <IconChevronRight width={14} height={14} /></button>
          </div>
          {done && <p className="role-note ok" style={{ marginTop: 8 }}>Submitted. Your tutor will grade it.</p>}
          {err && <div className="auth-error" style={{ marginTop: 8 }}>{err}</div>}
        </>
      )}
      {graded && !released && <p style={{ fontSize: 13, color: "var(--muted)" }}>This has been graded — your score appears once results are released.</p>}
    </div>
  );
}
