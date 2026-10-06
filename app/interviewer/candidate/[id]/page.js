"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { CANDIDATES, synthesizeNotes } from "@/components/interviewer/data";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadInterviewerCandidate } from "@/lib/db";
import { IconStar, IconArrowLeft, IconBolt, IconCheck, IconEnvelope } from "@/components/Icons";

export default function CandidateDetail() {
  const { id } = useParams();
  const { app, interviewerKind, user, addInterviewerNote, recordAiFinal, supabaseEnabled } = useAuth();

  const demoCandidate = CANDIDATES.find((c) => c.id === id);

  // Candidate + panel notes (real in Supabase mode, mock otherwise).
  const [info, setInfo] = useState(
    supabaseEnabled
      ? null
      : demoCandidate
      ? { name: demoCandidate.name, role: demoCandidate.role, email: "", color: demoCandidate.color, notes: demoCandidate.notes, myNote: null }
      : { notFound: true }
  );
  const [myId, setMyId] = useState(null);

  const mine = app.interviewerNotes?.[id] || null;
  const [rating, setRating] = useState(mine?.rating || 0);
  const [strengths, setStrengths] = useState(mine?.strengths || "");
  const [improvements, setImprovements] = useState(mine?.improvements || "");
  const [note, setNote] = useState(mine?.note || "");
  const [saved, setSaved] = useState(!!mine);

  const [aiFinal, setAiFinal] = useState(app.aiFinal?.[id] || null);

  // Verdict state (real mode): the interviewer's authoritative decision.
  const [decision, setDecision] = useState(null); // "advance" | "reject"
  const [outcome, setOutcome] = useState(null);    // recorded stage result
  const [booking, setBooking] = useState(null);
  const [vBusy, setVBusy] = useState(false);
  const [vMsg, setVMsg] = useState("");
  const [vErr, setVErr] = useState("");

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) return;
      const { data } = await sb.auth.getUser();
      const uid = data?.user?.id;
      setMyId(uid);
      const d = await loadInterviewerCandidate(sb, id, interviewerKind, uid);
      setInfo({ ...d, color: "#7c9cff" });
      setOutcome(d.outcome || null);
      setBooking(d.booking || null);
      if (d.myNote) {
        setRating(d.myNote.rating || 0);
        setStrengths(d.myNote.strengths || "");
        setImprovements(d.myNote.improvements || "");
        setNote(d.myNote.note || "");
        setSaved(true);
      }
    })();
    // eslint-disable-next-line
  }, [supabaseEnabled, id, interviewerKind]);

  if (info?.notFound) {
    return <div className="empty" style={{ marginTop: 24 }}>Candidate not found. <Link href="/interviewer/interview" className="link">Back</Link></div>;
  }
  if (info === null) {
    return <div className="empty" style={{ marginTop: 24 }}>Loading candidate…</div>;
  }

  // My note (as I've edited it) + everyone else's on file.
  const myNoteObj = saved ? { interviewerId: myId, interviewer: user?.name || "You", kind: interviewerKind, rating, strengths, improvements, note } : null;
  const others = (info.notes || []).filter((n) => n.interviewerId !== myId);
  const allNotes = [...others, ...(myNoteObj ? [myNoteObj] : [])];

  const saveNote = () => {
    addInterviewerNote(id, { rating, strengths, improvements, note, stage: interviewerKind });
    setSaved(true);
  };

  // The interviewer's authoritative decision — records the candidate's stage
  // result server-side (passing HR puts them on the board).
  const submitVerdict = async () => {
    setVErr(""); setVMsg("");
    if (!rating) { setVErr("Please rate the candidate first (stars on the left)."); return; }
    if (!decision) { setVErr("Choose Advance or Do not advance."); return; }
    if (!supabaseEnabled) {
      setOutcome({ passed: decision === "advance", verdict: decision === "advance" ? "Recommended to advance" : "Not recommended", avg: rating });
      setVMsg("Recorded (demo). In real mode this sets the candidate's official stage result and notifies them.");
      return;
    }
    setVBusy(true);
    try {
      const res = await fetch("/api/interviewer/verdict", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: id, stage: interviewerKind, decision, rating, strengths, improvements, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setOutcome(data.result);
      setSaved(true);
      setVMsg(data.passed ? "Verdict submitted — the candidate has advanced and been notified." : "Verdict submitted — the candidate has been notified.");
    } catch (e) { setVErr(e.message); } finally { setVBusy(false); }
  };

  const generate = () => {
    const summary = synthesizeNotes(allNotes);
    if (summary) {
      recordAiFinal(id, summary);
      setAiFinal({ ...summary, at: new Date().toISOString() });
    }
  };

  const verdictClass = (v) => (v?.startsWith("Recommended") ? "rec" : v === "Borderline" ? "bord" : "no");

  return (
    <>
      <Link href="/interviewer/interview" className="link" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 16 }}>
        <IconArrowLeft width={18} height={18} /> Back to interviews
      </Link>

      <div className="cand-head">
        <span className="big-av" style={{ background: info.color }}>
          {info.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </span>
        <div>
          <h1>{info.name}</h1>
          <p>{info.role} · {interviewerKind} stage</p>
        </div>
      </div>

      {/* Decision & verdict — the authoritative stage result */}
      <div className="card pad" style={{ marginTop: 18, borderColor: outcome ? (outcome.passed ? "rgba(46,204,113,.4)" : "rgba(255,59,48,.3)") : undefined }}>
        <h3 className="card-title" style={{ marginTop: 0 }}>Decision &amp; verdict</h3>
        {outcome ? (
          <div className={`role-note ${outcome.passed ? "ok" : ""}`} style={!outcome.passed ? { background: "rgba(255,59,48,.08)", color: "#c0392b" } : undefined}>
            Verdict recorded: <b>{outcome.verdict}</b>{outcome.avg ? ` · avg ${outcome.avg}/5` : ""}.{" "}
            {outcome.passed ? (interviewerKind === "HR" ? "The candidate has passed all stages and is on the board." : "The candidate has advanced to HR.") : "The candidate can retry this stage with an assessment token."}
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>
              {booking ? (
                <>Scheduled for <b>{booking.date}, {booking.time}</b>. {booking.meetLink && <a href={booking.meetLink} target="_blank" rel="noreferrer" className="link">Join on Google Meet →</a>}</>
              ) : "No upcoming booking for this stage yet."}
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Rate the candidate below, then record your decision. This sets their official <b>{interviewerKind}</b> result and notifies them.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "6px 0 12px" }}>
              <button className={decision === "advance" ? "btn-solid" : "btn-outline"} onClick={() => setDecision("advance")}>
                <IconCheck width={15} height={15} /> Advance
              </button>
              <button className={decision === "reject" ? "btn-solid" : "btn-outline"} onClick={() => setDecision("reject")}>
                Do not advance
              </button>
            </div>
            {vErr && <div className="auth-error" style={{ marginBottom: 10 }}>{vErr}</div>}
            {vMsg && <div className="role-note ok" style={{ marginBottom: 10 }}>{vMsg}</div>}
            <button className="btn-solid" disabled={vBusy || !rating || !decision} onClick={submitVerdict}>
              {vBusy ? "Submitting…" : "Submit verdict & record result"}
            </button>
          </>
        )}
        {outcome && vMsg && <div className="role-note ok" style={{ marginTop: 12 }}>{vMsg}</div>}
      </div>

      <div className="note-cols">
        {/* My feedback */}
        <div className="card pad">
          <h3 className="card-title">Your feedback ({interviewerKind})</h3>
          <p style={{ fontSize: 13, color: "var(--gray-500)", margin: "0 0 14px" }}>Rate the candidate and add notes. All interviewers&apos; notes on this stage are combined by AI into the candidate&apos;s final feedback.</p>

          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={n <= rating ? "on" : ""} onClick={() => { setRating(n); setSaved(false); }} aria-label={`${n} star`}>
                <IconStar />
              </button>
            ))}
          </div>

          <div className="note-field">
            <label>Strengths</label>
            <input value={strengths} onChange={(e) => { setStrengths(e.target.value); setSaved(false); }} placeholder="e.g. Strong communication, solid React" />
          </div>
          <div className="note-field">
            <label>Areas to improve</label>
            <input value={improvements} onChange={(e) => { setImprovements(e.target.value); setSaved(false); }} placeholder="e.g. System design depth" />
          </div>
          <div className="note-field">
            <label>Notes</label>
            <textarea rows={4} value={note} onChange={(e) => { setNote(e.target.value); setSaved(false); }} placeholder="Detailed notes from the interview…" />
          </div>
          <button className="btn-solid" onClick={saveNote} disabled={!rating}>
            {saved ? <><IconCheck width={16} height={16} /> Notes saved</> : "Save my notes"}
          </button>
        </div>

        {/* Panel notes */}
        <div className="card pad">
          <h3 className="card-title">Panel notes ({allNotes.length})</h3>
          {allNotes.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>No notes yet — add yours on the left.</p>
          ) : allNotes.map((n, i) => (
            <div className="other-note" key={i}>
              <div className="on-head">
                <b>{n.interviewer} <span style={{ fontWeight: 400, color: "var(--gray-500)", fontSize: 12 }}>· {n.kind}</span></b>
                <span className="on-stars">{"★".repeat(n.rating || 0)}{"☆".repeat(5 - (n.rating || 0))}</span>
              </div>
              {n.note && <p>{n.note}</p>}
              <div className="tags">
                {n.strengths && <><b>Strengths:</b> {n.strengths}. </>}
                {n.improvements && <><b>Improve:</b> {n.improvements}.</>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI final feedback */}
      <div style={{ marginTop: 24 }}>
        {aiFinal ? (
          <div className="ai-final-card">
            <div className="aih">
              <span className="sp"><IconBolt /></span>
              <b>AI Final Feedback</b>
              <span className={`verdict ${verdictClass(aiFinal.verdict)}`}>{aiFinal.verdict} · {aiFinal.avg}/5</span>
            </div>
            <p className="sum">{aiFinal.summary}</p>
            <div className="chips">
              {aiFinal.strengths.map((s) => <span className="chip2 s" key={s}>+ {s}</span>)}
            </div>
            <div className="chips">
              {aiFinal.improvements.map((s) => <span className="chip2 i" key={s}>△ {s}</span>)}
            </div>
            <p className="ai-final-note">
              Synthesised from {aiFinal.count} interviewer{aiFinal.count > 1 ? "s" : ""}. <button className="link" onClick={generate} style={{ background: "none" }}>Regenerate</button>
            </p>
          </div>
        ) : (
          <div className="card pad" style={{ textAlign: "center" }}>
            <h3 className="card-title">AI Final Feedback</h3>
            <p style={{ fontSize: 14, color: "var(--gray-500)", margin: "0 auto 16px", maxWidth: 460 }}>
              When the panel is done, AI merges every interviewer&apos;s notes into one final feedback for the candidate.
            </p>
            <button className="btn-solid" style={{ display: "inline-flex" }} onClick={generate} disabled={allNotes.length === 0}>
              <IconBolt width={16} height={16} /> Generate AI final feedback
            </button>
          </div>
        )}
      </div>

      {/* Note + notify the candidate */}
      <NotifyCandidate
        candidateId={id}
        stage={interviewerKind}
        supabaseEnabled={supabaseEnabled}
        prefill={aiFinal?.summary || ""}
      />
    </>
  );
}

function NotifyCandidate({ candidateId, stage, supabaseEnabled, prefill }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const start = () => {
    setMessage(prefill || "");
    setMsg("");
    setErr("");
    setOpen(true);
  };

  const send = async () => {
    setErr(""); setMsg("");
    if (!message.trim()) { setErr("Write a message for the candidate."); return; }
    if (!supabaseEnabled) {
      setMsg("Sent (demo). In real mode the candidate is notified in-app and by email.");
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/interviewer/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, stage, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(data.emailSent ? "Sent — the candidate was notified in-app and by email." : "Sent — the candidate was notified in-app (email provider not configured).");
      setOpen(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card pad notify-card" style={{ marginTop: 24 }}>
      <div className="notify-head">
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>Send a note to the candidate</h3>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>
            Share feedback directly — for example if their CV or answers don&apos;t match the role. Delivered in-app and by email.
          </p>
        </div>
        {!open && <button className="btn-solid" onClick={start}><IconEnvelope width={15} height={15} /> Compose note</button>}
      </div>

      {msg && <div className="role-note ok" style={{ marginTop: 14 }}>{msg}</div>}

      {open && (
        <div style={{ marginTop: 16 }}>
          <textarea
            className="cvr-textarea"
            rows={5}
            placeholder="e.g. Thanks for interviewing. Your experience leans frontend, but this role is backend-heavy — consider applying to a frontend role, or strengthen backend examples before your retry."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {prefill && (
            <button className="link" style={{ background: "none", fontSize: 13, marginTop: 8 }} onClick={() => setMessage(prefill)}>
              Use the AI final feedback
            </button>
          )}
          {err && <div className="auth-error" style={{ marginTop: 10 }}>{err}</div>}
          <div className="cvr-actions" style={{ marginTop: 14 }}>
            <button className="btn-outline" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-solid" disabled={busy} onClick={send}>
              <IconEnvelope width={15} height={15} /> {busy ? "Sending…" : "Send & notify"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
