"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth, MAX_STAGE_RETRIES } from "@/components/context/AuthContext";
import { STAGE_META, computeStageResult } from "@/components/interview/stage";
import {
  IconUser,
  IconBriefcase,
  IconVideo,
  IconMic,
  IconClock,
  IconCheck,
  IconLock,
  IconCalendar,
  IconChart,
  IconRefresh,
  IconCard,
  IconArrowRight,
  IconPlay,
} from "@/components/Icons";

const ROLE_LABELS = {
  software: "Software Development",
  data: "Data & Analytics",
  product: "Product & Design",
  cloud: "Cloud & DevOps",
  security: "Cybersecurity",
  support: "IT Support",
};

const AGENDA = {
  Professional: [
    "Walk-through of a recent project",
    "A live technical / problem-solving question",
    "System design & trade-off discussion",
    "Your questions for the panel",
  ],
  HR: [
    "Your motivation & career goals",
    "Communication & teamwork scenarios",
    "Role expectations & availability",
    "Compensation & next steps",
  ],
};

export default function StageRoom({ kind }) {
  const { app, signup, user, completeStage, retryStage, supabaseEnabled, refreshApp } = useAuth();
  const meta = STAGE_META[kind];
  const stage = app.stages?.[kind] || { attempts: 0, passed: false, result: null };
  const role = ROLE_LABELS[signup.targetRole] || "Front End Development";
  const StageIcon = kind === "HR" ? IconBriefcase : IconUser;

  // Gate: the previous stage must be passed first.
  const prevPassed =
    kind === "Professional" ? !!app.aiInterview?.passed : !!app.stages?.Professional?.passed;
  const prevLabel = kind === "Professional" ? "AI Interview" : "Professional Interview";

  const scheduled = app.interviews.find((i) => i.type === kind);

  // ---- view state ----
  // REAL mode: once booked, the candidate joins the Meet and waits for the
  // interviewer's verdict ("awaiting"). DEMO mode: the simulated live call.
  const derive = () => {
    if (!prevPassed) return "locked";
    if (stage.result) return "result";
    if (scheduled) return supabaseEnabled ? "awaiting" : "waiting";
    return "needSchedule";
  };
  const [view, setView] = useState(derive);
  const [result, setResult] = useState(stage.result || null);

  // Real mode: when the interviewer's verdict lands in our refreshed state,
  // show it. Also poll periodically while awaiting.
  useEffect(() => {
    if (supabaseEnabled && stage.result && view !== "result") {
      setResult(stage.result);
      setView("result");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.result]);

  useEffect(() => {
    if (!(supabaseEnabled && view === "awaiting" && refreshApp)) return;
    const t = setInterval(() => refreshApp(), 20000);
    return () => clearInterval(t);
  }, [supabaseEnabled, view, refreshApp]);

  // ---- media (self-view for the device check + live call) ----
  const streamRef = useRef(null);
  const selfRef = useRef(null);
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [sessionSecs, setSessionSecs] = useState(0);

  const startMedia = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setCamOn(stream.getVideoTracks().length > 0);
      setMicOn(stream.getAudioTracks().length > 0);
      return stream;
    } catch {
      setCamOn(false);
      setMicOn(false);
      return null;
    }
  }, []);

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCamOn(false);
    setMicOn(false);
  }, []);

  // Acquire + attach the camera in the waiting room and the live call.
  useEffect(() => {
    if (view !== "waiting" && view !== "live") return;
    let cancelled = false;
    startMedia().then((s) => {
      if (cancelled) return;
      const v = selfRef.current;
      if (s && v) {
        v.srcObject = s;
        v.play?.().catch(() => {});
      }
    });
    return () => {
      cancelled = true;
    };
  }, [view, startMedia]);

  // Session timer while live.
  useEffect(() => {
    if (view !== "live") return;
    const t = setInterval(() => setSessionSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [view]);

  // Cleanup on unmount.
  useEffect(() => () => stopMedia(), [stopMedia]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleCam = () => {
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  };
  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks?.()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const join = () => {
    setSessionSecs(0);
    setView("live");
  };

  const endCall = () => {
    stopMedia();
    setView("processing");
    const attemptNo = (stage.attempts ?? 0) + 1;
    setTimeout(async () => {
      // The server computes and records the verdict (real mode); demo computes
      // locally. We display whatever the authoritative source returns.
      const out = await completeStage(kind);
      const r = out?.result || computeStageResult(kind, attemptNo);
      setResult(r);
      setView("result");
    }, 2600);
  };

  const doRetry = async () => {
    const ok = await retryStage(kind);
    if (ok) {
      setResult(null);
      setView("needSchedule");
    }
  };

  const attemptsUsed = stage.attempts ?? 0;
  const retriesLeft = Math.max(0, MAX_STAGE_RETRIES - (attemptsUsed - 1));
  const canRetry = retriesLeft > 0 && (app.tokens ?? 0) > 0;

  return (
    <>
      <div className="page-head">
        <h1>{meta.label}</h1>
        <p>{meta.blurb}</p>
      </div>

      {/* LOCKED */}
      {view === "locked" && (
        <div className="stage-locked card pad">
          <span className="sl-ic">
            <IconLock width={26} height={26} />
          </span>
          <h3>{meta.label} is locked</h3>
          <p>
            You need to pass the <b>{prevLabel}</b> before this stage unlocks. Stages are taken in
            order: AI → Professional → HR.
          </p>
          <Link
            href={kind === "Professional" ? "/dashboard/interview/ai" : "/dashboard/interview/professional"}
            className="btn-solid"
          >
            Go to {prevLabel} <IconArrowRight width={15} height={15} />
          </Link>
        </div>
      )}

      {/* NEED SCHEDULE */}
      {view === "needSchedule" && (
        <div className="stage-schedule card pad">
          <span className="ss-ic">
            <IconCalendar width={24} height={24} />
          </span>
          <h3>Book your {meta.label}</h3>
          <p>
            This is a live session with {meta.panel.length > 1 ? "a panel of human interviewers" : "a human interviewer"}
            . Pick a time that works for you, then come back here to join.
          </p>
          <div className="ss-actions">
            <Link href="/dashboard/interview" className="btn-solid">
              <IconCalendar width={15} height={15} /> Schedule a time
            </Link>
            {!supabaseEnabled && (
              <button className="btn-outline" onClick={join}>
                <IconPlay width={14} height={14} /> Join a demo session now
              </button>
            )}
          </div>
        </div>
      )}

      {/* AWAITING INTERVIEWER VERDICT (real mode) */}
      {view === "awaiting" && (
        <div className="stage-schedule card pad">
          <span className="ss-ic"><IconClock width={24} height={24} /></span>
          <h3>Your {meta.label} is booked</h3>
          <p>
            {scheduled ? <>Scheduled for <b>{scheduled.date}, {scheduled.time}</b>. </> : null}
            Join the call at your scheduled time. After the interview, your {meta.panel.length > 1 ? "panel" : "interviewer"} submits a verdict and your result appears here automatically.
          </p>
          <div className="ss-actions">
            {scheduled?.meetLink ? (
              <a href={scheduled.meetLink} target="_blank" rel="noreferrer" className="btn-solid">
                <IconVideo width={15} height={15} /> Join on Google Meet
              </a>
            ) : (
              <Link href="/dashboard/interview" className="btn-solid"><IconCalendar width={15} height={15} /> View booking</Link>
            )}
            <button className="btn-outline" onClick={() => refreshApp?.()}>
              <IconRefresh width={14} height={14} /> Check for result
            </button>
          </div>
          <p className="li-note" style={{ marginTop: 14 }}>
            <IconChart width={14} height={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            You&apos;ll be notified in-app and by email as soon as the verdict is in.
          </p>
        </div>
      )}

      {/* WAITING ROOM / DEVICE CHECK */}
      {view === "waiting" && (
        <div className="stage-lobby">
          <div className="card pad lobby-video">
            <div className="lv-frame">
              <video ref={selfRef} autoPlay muted playsInline />
              {!camOn && (
                <div className="lv-placeholder">
                  <IconVideo width={30} height={30} />
                  <span>Enable your camera to check your setup</span>
                </div>
              )}
              <span className="lv-self-tag">You</span>
            </div>
            <div className="lv-devices">
              <span className={`dev-chip ${camOn ? "ok" : "off"}`}>
                <IconVideo width={15} height={15} /> Camera {camOn ? "ready" : "off"}
              </span>
              <span className={`dev-chip ${micOn ? "ok" : "off"}`}>
                <IconMic width={15} height={15} /> Microphone {micOn ? "ready" : "off"}
              </span>
            </div>
          </div>

          <div className="card pad lobby-info">
            <span className={`stage-badge ${kind === "HR" ? "hr" : "pro"}`}>
              <StageIcon width={20} height={20} />
            </span>
            <h3>{meta.label}</h3>
            <p className="li-role">{role}</p>
            <div className="li-rows">
              <div className="li-row">
                <span>When</span>
                <b>{scheduled ? `${scheduled.date}, ${scheduled.time}` : "Now"}</b>
              </div>
              <div className="li-row">
                <span>Mode</span>
                <b>{scheduled?.mode || (kind === "HR" ? "HR In-House" : "Virtual")}</b>
              </div>
              <div className="li-row">
                <span>{meta.panel.length > 1 ? "Panel" : "Interviewer"}</span>
                <b>{meta.interviewer}{meta.panel.length > 1 ? ` +${meta.panel.length - 1}` : ""}</b>
              </div>
              <div className="li-row">
                <span>Attempt</span>
                <b>{attemptsUsed + 1} of {MAX_STAGE_RETRIES + 1}</b>
              </div>
            </div>
            <button className="btn-solid lobby-join" onClick={join}>
              <IconVideo width={16} height={16} /> Join interview
            </button>
            <p className="li-note">
              Retries cost 1 token · you have <b>{app.tokens}</b>.
            </p>
          </div>
        </div>
      )}

      {/* LIVE CALL */}
      {view === "live" && (
        <div className="call-room">
          <div className="call-top">
            <span className="call-live">
              <i /> Live · {meta.label}
            </span>
            <span className="call-timer">
              <IconClock width={14} height={14} /> {fmt(sessionSecs)}
            </span>
          </div>

          <div className="call-stage">
            {/* interviewer tile */}
            <div className="call-main">
              <div className="cm-avatar">
                {meta.interviewer
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="cm-name">
                {meta.interviewer} <span className="cm-live-dot" />
              </div>
              <div className="cm-sub">{kind === "HR" ? "HR Team" : `${role} Panel`}</div>
              {/* self view */}
              <div className="call-self">
                <video ref={selfRef} autoPlay muted playsInline />
                {!camOn && (
                  <div className="cs-off">
                    <IconVideo width={18} height={18} />
                  </div>
                )}
                <span className="cs-tag">You</span>
              </div>
            </div>

            {/* agenda */}
            <aside className="call-agenda card">
              <h4>Session agenda</h4>
              <ol>
                {AGENDA[kind].map((a, i) => (
                  <li key={i}>
                    <span className="ag-n">{i + 1}</span>
                    {a}
                  </li>
                ))}
              </ol>
              <div className="ag-note">
                <IconChart width={15} height={15} />
                Your interviewers score the session; NexIT AI then synthesises their notes into your
                feedback.
              </div>
            </aside>
          </div>

          <div className="call-controls">
            <button className={`cc-btn ${micOn ? "" : "off"}`} onClick={toggleMic} aria-label="Toggle microphone">
              <IconMic width={20} height={20} />
            </button>
            <button className={`cc-btn ${camOn ? "" : "off"}`} onClick={toggleCam} aria-label="Toggle camera">
              <IconVideo width={20} height={20} />
            </button>
            <button className="cc-end" onClick={endCall}>
              End interview
            </button>
          </div>
        </div>
      )}

      {/* PROCESSING */}
      {view === "processing" && (
        <div className="stage-processing card pad">
          <span className="sp-spin" />
          <h3>Synthesising your feedback…</h3>
          <p>NexIT AI is merging the panel&apos;s notes into your final result.</p>
        </div>
      )}

      {/* RESULT */}
      {view === "result" && result && (
        <StageResult
          kind={kind}
          meta={meta}
          result={result}
          passed={result.passed}
          attemptsUsed={attemptsUsed}
          retriesLeft={retriesLeft}
          canRetry={canRetry}
          tokens={app.tokens}
          onRetry={doRetry}
        />
      )}
    </>
  );
}

function StageResult({ kind, meta, result, passed, attemptsUsed, retriesLeft, canRetry, tokens, onRetry }) {
  return (
    <div className="stage-result">
      <div className={`sr-head ${passed ? "pass" : "fail"}`}>
        <span className="sr-badge">
          {passed ? <IconCheck width={26} height={26} /> : <IconRefresh width={24} height={24} />}
        </span>
        <div>
          <h2>{passed ? "Stage passed" : "Not quite there yet"}</h2>
          <p>
            {meta.label} · panel verdict: <b>{result.verdict}</b> · avg {result.avg}/5
          </p>
        </div>
        <span className="sr-score">{result.avg}<small>/5</small></span>
      </div>

      <div className="sr-grid">
        <div className="card pad sr-col">
          <h4>What the panel liked</h4>
          {result.strengths.length ? (
            <ul className="sr-list good">
              {result.strengths.map((s) => (
                <li key={s}>
                  <IconCheck width={14} height={14} /> {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="sr-empty">No specific strengths recorded.</p>
          )}
        </div>
        <div className="card pad sr-col">
          <h4>Where to improve</h4>
          {result.improvements.length ? (
            <ul className="sr-list work">
              {result.improvements.map((s) => (
                <li key={s}>
                  <IconArrowRight width={14} height={14} /> {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="sr-empty">Nothing flagged — great work.</p>
          )}
        </div>
      </div>

      <div className="card pad sr-summary">
        <h4>
          <IconChart width={16} height={16} /> AI-synthesised summary
        </h4>
        <p>{result.summary}</p>
      </div>

      {/* Next action */}
      {passed ? (
        <div className="sr-next card pad ok">
          {meta.next ? (
            <>
              <div>
                <h4>You&apos;ve unlocked the {STAGE_META[meta.next].label}</h4>
                <p>One stage left before you join the candidate board.</p>
              </div>
              <Link href={`/dashboard/interview/${meta.next.toLowerCase()}`} className="btn-solid">
                Continue to {STAGE_META[meta.next].short} <IconArrowRight width={15} height={15} />
              </Link>
            </>
          ) : (
            <>
              <div>
                <h4>🎉 You&apos;re on the candidate board</h4>
                <p>
                  You&apos;ve passed all three stages. Verified recruiters from partner companies can
                  now see your profile and reach you directly.
                </p>
              </div>
              <Link href="/dashboard" className="btn-solid">
                Go to dashboard <IconArrowRight width={15} height={15} />
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="sr-next card pad retry">
          <div>
            <h4>Retry this stage</h4>
            <p>
              {retriesLeft > 0 ? (
                <>
                  You have <b>{retriesLeft}</b> {retriesLeft === 1 ? "retry" : "retries"} left. Each
                  retry uses <b>1 assessment token</b> — you have <b>{tokens}</b>.
                </>
              ) : (
                <>You&apos;ve used all retries for this stage. Contact support to discuss options.</>
              )}
            </p>
          </div>
          {retriesLeft > 0 &&
            (canRetry ? (
              <button className="btn-solid" onClick={onRetry}>
                <IconCard width={15} height={15} /> Use 1 token &amp; rebook
              </button>
            ) : (
              <Link href="/dashboard" className="btn-outline">
                Get more tokens
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
