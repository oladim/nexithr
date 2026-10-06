"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, AI_PASS_MARK } from "@/components/context/AuthContext";
import { startPayment, formatMoney } from "@/lib/billing";
import {
  IconVideo,
  IconMic,
  IconEye,
  IconLock,
  IconClock,
  IconCheck,
  IconRefresh,
  IconCap,
  IconCard,
  IconChevronRight,
  IconUser,
} from "@/components/Icons";

// Max interview length (matches the AI interviewer brief).
const MAX_MINUTES = 45;
const MAX_SECS = MAX_MINUTES * 60;
// How long a pause (ms) after the candidate speaks before we treat the answer
// as finished and send it.
const SILENCE_MS = 2600;

// ---- Demo fallback (no ANTHROPIC key): scripted questions + mock scoring ----
const DEMO_QUESTIONS = [
  "To start, tell me a bit about yourself and a project you're proud of.",
  "Describe a challenging technical problem you solved and your specific role in it.",
  "Walk me through how you'd troubleshoot a production issue under time pressure.",
  "Tell me about a time you disagreed with a teammate. How did you handle it?",
  "Where do you want to grow next, and why this role?",
];
const DEMO_PLAN = {
  technical: [
    { title: "System design fundamentals", focus: "Shaky on scaling & trade-offs", resource: "freeCodeCamp / 'System Design Primer' (GitHub)", est_time: "2–3 weeks" },
    { title: "Testing & debugging practice", focus: "Thin production-debugging evidence", resource: "Build & test a small API; use the language's test runner docs", est_time: "2 weeks" },
  ],
  administrative: [
    { title: "Structured communication (STAR)", focus: "Answers lacked concrete outcomes", resource: "Practice STAR write-ups for 5 past projects", est_time: "1 week" },
    { title: "Time & task management", focus: "Prioritisation under pressure", resource: "Free 'Agile basics' course + a weekly planning habit", est_time: "ongoing" },
  ],
};
function demoResult(attemptNo) {
  if (attemptNo <= 1) {
    return {
      overall: 72,
      breakdown: { Technical: 70, Leadership: 72, Communication: 78, Teamwork: 74, Motivation: 66 },
      summary:
        "Solid communication and a willing attitude, but the technical depth and measurable outcomes needed for this role aren't fully evidenced yet. Targeted training will close the gap quickly.",
      suggestedTraining: DEMO_PLAN,
    };
  }
  return {
    overall: 88,
    breakdown: { Technical: 90, Leadership: 86, Communication: 89, Teamwork: 88, Motivation: 87 },
    summary:
      "Clear, specific, and technically strong answers with good ownership and reflection. Ready to move to the professional interview.",
    suggestedTraining: { technical: [{ title: "Keep sharp with a build project", focus: "Maintain momentum", resource: "Ship one portfolio project", est_time: "ongoing" }], administrative: [] },
  };
}

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// Turn a raw engine reason into a human explanation + fix steps.
function friendlyStartError(reason) {
  const r = String(reason || "");
  if (/no-context/i.test(r)) {
    return {
      summary: "The server couldn't assemble your interview from your CV and target role.",
      steps: [
        "Make sure you've uploaded a CV and chosen a target role in your profile.",
        "In real mode, confirm SUPABASE_SERVICE_ROLE_KEY is set so the server can read your CV.",
      ],
    };
  }
  if (/\b401\b|invalid x-api-key|authentication/i.test(r)) {
    return {
      summary: "Anthropic rejected the API key (authentication error).",
      steps: [
        "Check ANTHROPIC_API_KEY in .env.local for typos or extra spaces.",
        "Restart the dev server after changing .env.local (Next.js only reads it at startup).",
      ],
    };
  }
  if (/\b404\b|not_found|no model available|available models/i.test(r)) {
    return {
      summary: "The key works, but none of the tried models are available to it.",
      steps: [
        "Set INTERVIEW_MODEL in .env.local to a model your account can use (e.g. your Opus/Sonnet model id).",
        "Restart the dev server after editing .env.local.",
      ],
    };
  }
  if (/\b429\b|rate|overloaded/i.test(r)) {
    return { summary: "Anthropic is rate-limiting or overloaded right now.", steps: ["Wait a few seconds and press Try again."] };
  }
  if (/network|fetch failed|ENOTFOUND|ECONN/i.test(r)) {
    return { summary: "The server couldn't reach Anthropic (network error).", steps: ["Check the server's internet access, then press Try again."] };
  }
  return {
    summary: "The AI interviewer couldn't be reached.",
    steps: [
      "Confirm ANTHROPIC_API_KEY is set in .env.local and the dev server was restarted afterwards.",
      "Press Try again — if it persists, the technical detail below will say why.",
    ],
  };
}

export default function AiInterviewPage() {
  const router = useRouter();
  const { signup, app, recordAiAttempt, unlockTraining, supabaseEnabled } = useAuth();

  // Configurable thresholds + candidate access (subscription / retake cooldown).
  const [passMark, setPassMark] = useState(AI_PASS_MARK); // "ready" band threshold
  const [foundationalMark, setFoundationalMark] = useState(60);
  const [freeRetakes, setFreeRetakes] = useState(1);
  const [requireApproval, setRequireApproval] = useState(false);
  const [pricing, setPricing] = useState({ subscriptionAnnualAmount: 29999, currency: "NGN" });
  const [access, setAccess] = useState(null); // { subscribed, lastAiAttemptAt }
  const [subBusy, setSubBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        const s = data?.settings;
        if (s?.passMarkAi != null) setPassMark(Number(s.passMarkAi));
        if (s?.aiFoundationalMark != null) setFoundationalMark(Number(s.aiFoundationalMark));
        if (s?.freeAiRetakes != null) setFreeRetakes(Number(s.freeAiRetakes));
        if (s?.aiResultRequiresApproval != null) setRequireApproval(!!s.aiResultRequiresApproval);
        if (s) setPricing({ subscriptionAnnualAmount: Number(s.subscriptionAnnualAmount), currency: s.currency || "NGN" });
      } catch { /* keep defaults */ }
      if (supabaseEnabled) {
        try {
          const r = await fetch("/api/me/access");
          setAccess(await r.json());
        } catch { setAccess(null); }
      }
    })();
  }, [supabaseEnabled]);

  // Band from a score.
  const bandOf = (score) => (score == null ? "foundational" : score >= passMark ? "ready" : score >= foundationalMark ? "close" : "foundational");

  // Retake cooldown: the first `freeRetakes` attempts are free; after that,
  // locked for 30 days unless subscribed.
  const attempts = app.aiInterview?.attempts ?? 0;
  const lastAt = access?.lastAiAttemptAt ? new Date(access.lastAiAttemptAt).getTime() : 0;
  const nextEligible = lastAt ? lastAt + 30 * 24 * 60 * 60 * 1000 : 0;
  const retakeLocked = supabaseEnabled && !access?.subscribed && attempts > freeRetakes && lastAt > 0 && Date.now() < nextEligible;
  const nextEligibleDate = nextEligible ? new Date(nextEligible).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
  const retakesLeft = Math.max(0, freeRetakes - attempts);

  const subscribe = async () => {
    setSubBusy(true);
    const res = await startPayment({ purpose: "subscription" });
    if (res?.error) { alert(res.error); setSubBusy(false); }
  };

  const [step, setStep] = useState("consent"); // consent | live | processing | result | payment
  const [consented, setConsented] = useState(false);

  // media
  const streamRef = useRef(null);
  const previewRef = useRef(null);
  const selfRef = useRef(null);
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(false);

  // interview engine
  const [mode, setMode] = useState(null); // "ai" | "demo"
  const [phase, setPhase] = useState("loading"); // loading | speaking | listening | thinking
  const [aiText, setAiText] = useState(""); // current interviewer turn (spoken)
  const [liveText, setLiveText] = useState(""); // candidate's words as they speak
  const [exchangeNo, setExchangeNo] = useState(0);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [engineError, setEngineError] = useState(null);
  const [startError, setStartError] = useState(null); // key set but engine couldn't start
  const [typedMode, setTypedMode] = useState(false); // fallback when STT unavailable
  const [typed, setTyped] = useState("");

  const convoRef = useRef([]); // [{role:"user"|"assistant", content}]
  const sessionIdRef = useRef(null);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const submittingRef = useRef(false);
  const answerRef = useRef(""); // accumulated final transcript for the current answer
  const silenceTimerRef = useRef(null);
  const finalizedRef = useRef(false);
  const qiRef = useRef(0); // demo question index

  const [result, setResult] = useState(null);

  const sttSupported =
    typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  /* ------------------------------ media ------------------------------ */
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

  // Consent device preview.
  useEffect(() => {
    if (step !== "consent") return;
    startMedia().then((s) => {
      const v = previewRef.current;
      if (s && v) {
        v.srcObject = s;
        v.play?.().catch(() => {});
      }
    });
  }, [step, startMedia, camOn]);

  // Live self-view.
  useEffect(() => {
    const v = selfRef.current;
    if (step === "live" && streamRef.current && v) {
      v.srcObject = streamRef.current;
      v.play?.().catch(() => {});
    }
  }, [step, aiText, camOn]);

  // Cleanup.
  useEffect(() => {
    return () => {
      teardownVoice();
      stopMedia();
      try { window.speechSynthesis?.cancel(); } catch {}
      if (typeof document !== "undefined" && document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopMedia]);

  // Session timer + 45-min cap.
  useEffect(() => {
    if (step !== "live") return;
    const t = setInterval(() => {
      setSessionSecs((s) => {
        const next = s + 1;
        if (next >= MAX_SECS && !finalizedRef.current) {
          finalizedRef.current = true;
          endInterview();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  /* ----------------------- text-to-speech (AI) ----------------------- */
  const pickVoice = () => {
    try {
      const voices = window.speechSynthesis?.getVoices?.() || [];
      return (
        voices.find((v) => /en[-_]?(US|GB)/i.test(v.lang) && /female|samantha|google|zira|aria/i.test(v.name)) ||
        voices.find((v) => /^en/i.test(v.lang)) ||
        voices[0] ||
        null
      );
    } catch {
      return null;
    }
  };

  const speak = useCallback((text, onDone) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onDone?.();
    };
    try {
      const synth = window.speechSynthesis;
      if (synth && text) {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const v = pickVoice();
        if (v) u.voice = v;
        u.rate = 1;
        u.pitch = 1;
        u.onend = finish;
        u.onerror = finish;
        synth.speak(u);
        // Safety: if onend never fires, continue after a length-based window.
        const secs = Math.min(40, Math.max(4, Math.ceil(text.length / 11)));
        setTimeout(finish, secs * 1000);
      } else {
        setTimeout(finish, 1200);
      }
    } catch {
      finish();
    }
  }, []);

  /* ------------------ speech-to-text (candidate voice) --------------- */
  const clearSilence = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const armSilence = () => {
    clearSilence();
    silenceTimerRef.current = setTimeout(() => {
      // Finished speaking → submit whatever we captured.
      if (answerRef.current.trim()) finishAnswerAndSubmit();
    }, SILENCE_MS);
  };

  const teardownVoice = () => {
    listeningRef.current = false;
    clearSilence();
    try {
      const r = recognitionRef.current;
      if (r) {
        r.onend = null;
        r.onerror = null;
        r.onresult = null;
        r.stop?.();
      }
    } catch {}
    recognitionRef.current = null;
  };

  // Begin capturing the candidate's spoken answer (hands-free).
  const startListening = () => {
    if (!sttSupported) {
      // No browser STT → typed fallback so the interview still works.
      setTypedMode(true);
      setPhase("listening");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    answerRef.current = "";
    setLiveText("");
    submittingRef.current = false;
    listeningRef.current = true;
    setPhase("listening");

    const startOne = () => {
      if (!listeningRef.current) return;
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) answerRef.current = (answerRef.current + " " + r[0].transcript).replace(/\s+/g, " ").trim();
          else interim += r[0].transcript;
        }
        setLiveText((answerRef.current + " " + interim).trim());
        if (answerRef.current.trim()) armSilence(); // only arm once they've said something
      };
      rec.onerror = (ev) => {
        // 'no-speech'/'aborted' are normal during pauses — keep the loop alive.
        if (ev?.error === "not-allowed" || ev?.error === "service-not-allowed") {
          listeningRef.current = false;
          setTypedMode(true);
        }
      };
      rec.onend = () => {
        // Chrome ends recognition on pauses; restart while still listening.
        if (listeningRef.current && !submittingRef.current) {
          try { startOne(); } catch {}
        }
      };
      recognitionRef.current = rec;
      try { rec.start(); } catch {}
    };
    startOne();
  };

  // Stop listening and send the captured answer.
  const finishAnswerAndSubmit = () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    listeningRef.current = false;
    clearSilence();
    try { recognitionRef.current?.stop?.(); } catch {}
    const text = (answerRef.current || liveText || "").trim();
    submitAnswer(text);
  };

  /* --------------------------- turn handling ------------------------- */
  // Present an interviewer turn: speak it, then open the mic automatically.
  const presentAiTurn = useCallback(
    (raw) => {
      // Never speak or show stray JSON / code fences (the final report).
      const text = String(raw || "")
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/\{[\s\S]*"competencies"[\s\S]*\}/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      // If stripping left nothing, the turn was really the report → finalize.
      if (!text) { finalizeAi(); return; }
      teardownVoice();
      setAiText(text);
      setLiveText("");
      setTyped("");
      setPhase("speaking");
      speak(text, () => {
        // Small gap so the speakers are quiet before the mic opens.
        setTimeout(() => {
          if (!finalizedRef.current && step !== "processing") startListening();
        }, 250);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [speak, step]
  );

  /* ---------------------------- API glue ----------------------------- */
  const post = async (payload) => {
    const res = await fetch("/api/interview/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  };

  const clientProfile = () => ({
    name: [signup.firstName, signup.lastName].filter(Boolean).join(" ") || "Candidate",
    roleLabel: signup.jobTitle || "",
    targetRole: signup.targetRole || "",
    experience: signup.experience || "",
    skills: signup.skills || "",
  });

  const beginLive = async () => {
    await startMedia();
    setSessionSecs(0);
    setExchangeNo(0);
    setEngineError(null);
    setStartError(null);
    setTypedMode(false);
    finalizedRef.current = false;
    submittingRef.current = false;
    convoRef.current = [];
    qiRef.current = 0;
    answerRef.current = "";
    setResult(null);
    setPhase("loading");
    setStep("live");
    try { await document.documentElement.requestFullscreen?.(); } catch {}
    // Warm up voices (some browsers populate the list lazily).
    try { window.speechSynthesis?.getVoices?.(); } catch {}

    let data = null;
    try {
      data = await post({ action: "start", profile: clientProfile() });
    } catch {
      data = { mode: "demo", reason: "network" };
    }

    if (data?.mode === "ai" && data.opening) {
      setMode("ai");
      sessionIdRef.current = data.sessionId || null;
      convoRef.current = [{ role: "assistant", content: data.opening }];
      presentAiTurn(data.opening);
    } else if (!data?.reason || data.reason === "no-key") {
      // Genuinely no API key configured → scripted practice interview.
      setMode("demo");
      presentAiTurn(DEMO_QUESTIONS[0]);
    } else {
      // A key IS configured but the engine couldn't start. Do NOT fall back to
      // fake scripted scores — surface the real reason so it can be fixed.
      try { window.speechSynthesis?.cancel(); } catch {}
      teardownVoice();
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      stopMedia();
      setStartError(data.reason);
      setStep("error");
    }
  };

  // Send an answer (from voice or the typed fallback) and advance the interview.
  const submitAnswer = async (rawText) => {
    const text = (rawText ?? "").trim();
    teardownVoice();
    try { window.speechSynthesis?.cancel(); } catch {}
    if (!text) {
      // Nothing captured — reopen the mic for another try.
      submittingRef.current = false;
      startListening();
      return;
    }
    setExchangeNo((n) => n + 1);
    setLiveText("");
    setTyped("");

    if (mode === "demo") {
      const nextIdx = qiRef.current + 1;
      qiRef.current = nextIdx;
      if (nextIdx < DEMO_QUESTIONS.length) presentAiTurn(DEMO_QUESTIONS[nextIdx]);
      else finishDemo();
      return;
    }

    // AI mode.
    convoRef.current = [...convoRef.current, { role: "user", content: text }];
    setPhase("thinking");
    let data;
    try {
      data = await post({ action: "reply", messages: convoRef.current, sessionId: sessionIdRef.current });
    } catch {
      data = { error: "network" };
    }

    if (data?.final) return finishAi(data.final);
    if (data?.needsFinalize) return finalizeAi(); // model ended; get a clean report
    if (data?.text) {
      convoRef.current = [...convoRef.current, { role: "assistant", content: data.text }];
      presentAiTurn(data.text);
      return;
    }
    setEngineError(data?.error || "engine");
    endInterview();
  };

  // Typed fallback submit (only shown when STT is unavailable).
  const submitTyped = () => {
    const t = typed.trim();
    if (!t) return;
    submittingRef.current = true;
    submitAnswer(t);
  };

  const finalizeAi = async () => {
    setStep("processing");
    teardownVoice();
    try { window.speechSynthesis?.cancel(); } catch {}
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    stopMedia();
    let data;
    try {
      data = await post({ action: "finalize", messages: convoRef.current, sessionId: sessionIdRef.current });
    } catch {
      data = { error: "network" };
    }
    if (data?.final) finishAi(data.final);
    else {
      const attemptNo = (app.aiInterview?.attempts ?? 0) + 1;
      recordAiAttempt({
        score: null,
        passed: false,
        breakdown: null,
        feedback: "The interview ended but an assessment couldn't be generated. Please retake.",
      });
      setResult({ incomplete: true, attemptNo, error: data?.error || data?.parseError || "no-assessment" });
      setStep("result");
    }
  };

  const finishAi = (assessment) => {
    const overall = assessment.overall;
    const band = bandOf(overall);
    const passed = band === "ready";
    const status = requireApproval ? "pending_review" : "released";
    const attemptNo = (app.aiInterview?.attempts ?? 0) + 1;
    recordAiAttempt({
      score: overall,
      breakdown: assessment.breakdown,
      feedback: assessment.summary,
      passed,
      band,
      suggestedTraining: assessment.suggestedTraining || null,
      status,
    });
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    stopMedia();
    setResult({ ...assessment, score: overall, passed, band, status, attemptNo });
    setStep("result");
  };

  const finishDemo = () => {
    setStep("processing");
    teardownVoice();
    try { window.speechSynthesis?.cancel(); } catch {}
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    stopMedia();
    setTimeout(() => {
      const attemptNo = (app.aiInterview?.attempts ?? 0) + 1;
      const r = demoResult(attemptNo);
      const band = bandOf(r.overall);
      const passed = band === "ready";
      recordAiAttempt({ score: r.overall, breakdown: r.breakdown, feedback: r.summary, passed, band, suggestedTraining: r.suggestedTraining, status: "released" });
      setResult({ ...r, score: r.overall, passed, band, status: "released", attemptNo });
      setStep("result");
    }, 1800);
  };

  const endInterview = () => {
    finalizedRef.current = true;
    setShowEnd(false);
    teardownVoice();
    if (mode === "ai") finalizeAi();
    else finishDemo();
  };

  const retake = () => {
    setResult(null);
    setConsented(false);
    setMode(null);
    setTypedMode(false);
    setStep("consent");
  };

  /* =============================== render =============================== */

  // ---- Retake cooldown lock (unless subscribed) ----
  if (step === "consent" && retakeLocked) {
    return (
      <>
        <div className="page-head">
          <h1>AI Interview — retake locked</h1>
          <p>You&apos;ve already taken the AI interview. You can retake it after a one-month wait, or subscribe for unlimited retakes.</p>
        </div>
        <div className="consent-grid">
          <div className="consent-notice">
            <h3>Your next free retake</h3>
            <div className="consent-warn">
              <IconClock />
              <span>Your last AI interview was recorded. Your next free retake is available on <b>{nextEligibleDate}</b>.</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--gray-500)" }}>
              Don&apos;t want to wait? The annual subscription gives you <b>unlimited AI interview retakes</b> for a year, plus access to suggested training.
            </p>
            <div className="assess-actions">
              <Link href="/dashboard/interview" className="btn-outline">Back to interviews</Link>
              <button className="btn-solid" disabled={subBusy} onClick={subscribe}>
                <IconCap width={16} height={16} /> {subBusy ? "Starting…" : `Subscribe — ${formatMoney(pricing.subscriptionAnnualAmount, pricing.currency)}/year`}
              </button>
            </div>
          </div>
          <div className="device-card">
            <h4>What a subscription unlocks</h4>
            <div className="device-status" style={{ flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
              <span className="d"><i /> Unlimited AI interview retakes for 12 months</span>
              <span className="d"><i /> Access to suggested training</span>
              <span className="d"><i /> No one-month waiting period</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---- Consent gate ----
  if (step === "consent") {
    return (
      <>
        <div className="page-head">
          <h1>AI Interview — before you begin</h1>
          <p>This is a proctored, adaptive <b>voice</b> interview. The AI interviewer talks with you — just answer out loud.</p>
        </div>
        <div className="consent-grid">
          <div className="consent-notice">
            <h3>Privacy &amp; proctoring notice</h3>
            <div className="pl">
              <span className="pi"><IconVideo /></span>
              <span><b>Video &amp; audio recording.</b> Your camera and microphone stay on for the whole session and the interview is recorded.</span>
            </div>
            <div className="pl">
              <span className="pi"><IconEye /></span>
              <span><b>AI proctoring.</b> An AI monitors your video for integrity — looking away, other people, or a second device may be flagged.</span>
            </div>
            <div className="pl">
              <span className="pi"><IconMic /></span>
              <span><b>Spoken conversation.</b> The AI asks each question aloud and listens to your reply. Speak naturally — when you pause, it responds and follows up. No typing.</span>
            </div>
            <div className="pl">
              <span className="pi"><IconLock /></span>
              <span><b>Data use.</b> Recordings and results are used only to assess your interview. See the <Link href="/dashboard/data-privacy" className="link">data &amp; recording notice</Link> (NDPR).</span>
            </div>
            <div className="consent-warn">
              <IconClock />
              <span>The interview lasts up to {MAX_MINUTES} minutes. Once started, ending early <b>counts as one of your attempts</b>.</span>
            </div>
            <label className="consent-check">
              <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)} />
              <span>I understand and consent to audio/video recording and AI proctoring for this interview.</span>
            </label>
            <button className="auth-btn" disabled={!consented} onClick={beginLive} style={{ maxWidth: 320 }}>
              Start interview
            </button>
            <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 10 }}>
              Tip: use Chrome or Edge for the spoken conversation, and allow the microphone when prompted. A quiet room gives the best results.
            </p>
          </div>

          <div className="device-card">
            <h4>Device check</h4>
            <div className="device-preview">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={previewRef} autoPlay muted playsInline />
              {!camOn && (
                <div className="ph">
                  <IconVideo />
                  Camera preview will appear here.
                  <br />
                  Allow camera &amp; microphone access when prompted.
                </div>
              )}
            </div>
            <div className="device-status">
              <span className={`d ${camOn ? "" : "off"}`}><i /> Camera {camOn ? "ready" : "off"}</span>
              <span className={`d ${micOn ? "" : "off"}`}><i /> Microphone {micOn ? "ready" : "off"}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---- Full-screen locked live interview ----
  if (step === "live") {
    const remaining = Math.max(0, MAX_SECS - sessionSecs);
    return (
      <div className="kiosk">
        <div className="kiosk-top">
          <div className="grp">
            <span className="rec"><span className="dot" /> REC</span>
            <span className="qn">
              {mode === "demo" ? "Practice interview" : "Adaptive voice interview"}
              {exchangeNo > 0 ? ` · ${exchangeNo} answered` : ""}
            </span>
          </div>
          <div className="grp">
            <span className="timer" title="Time remaining">{fmt(remaining)}</span>
            <button className="kiosk-end" onClick={() => setShowEnd(true)}>End interview</button>
          </div>
        </div>

        <div className="kiosk-stage">
          <div className="ai-speaker">
            <div className={`speaker-orb ${phase === "speaking" ? "speaking" : ""}`}>
              <IconUser />
            </div>
            <span className="label">
              {phase === "loading"
                ? "Connecting your interviewer…"
                : phase === "thinking"
                ? "Interviewer is considering your answer…"
                : phase === "speaking"
                ? "AI interviewer is speaking…"
                : phase === "listening"
                ? (typedMode ? "Type your answer below" : "Listening — answer out loud")
                : ""}
            </span>
            <p className="qtext">{phase === "loading" ? "Please wait a moment." : aiText}</p>
          </div>

          <div className="selfview">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={selfRef} autoPlay muted playsInline />
            {!camOn && (
              <div className="ph">
                <IconVideo />
                Camera unavailable
              </div>
            )}
            <span className={`proctor-chip ${camOn ? "" : "warn"}`}>
              <i /> {camOn ? "Monitoring active · face detected" : "Camera off — enable to continue"}
            </span>
          </div>
        </div>

        <div className="kiosk-foot">
          {phase === "thinking" || phase === "loading" ? (
            <div className="answer-row" style={{ justifyContent: "center", width: "100%" }}>
              <span className="answer-hint">
                <span className="spin" style={{ width: 18, height: 18, display: "inline-block", verticalAlign: "-4px", marginRight: 8 }} />
                {phase === "loading" ? "Starting…" : "Thinking…"}
              </span>
            </div>
          ) : phase === "speaking" ? (
            <div className="answer-row" style={{ justifyContent: "center", width: "100%" }}>
              <span className="answer-hint">The interviewer is speaking — listen, then answer when it&apos;s your turn.</span>
            </div>
          ) : typedMode ? (
            // Fallback: browser without speech recognition.
            <div style={{ width: "100%", maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="answer-hint">Voice input isn&apos;t available in this browser — type your answer.</span>
              <textarea
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                rows={3}
                placeholder="Type your answer, then send."
                style={{ width: "100%", resize: "vertical", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.08)", color: "#fff", fontSize: 15, lineHeight: 1.5, outline: "none" }}
              />
              <div className="answer-row" style={{ justifyContent: "flex-end" }}>
                <button className="kiosk-next" onClick={submitTyped} disabled={!typed.trim()} style={!typed.trim() ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
                  Send answer <IconChevronRight width={16} height={16} />
                </button>
              </div>
            </div>
          ) : (
            // Hands-free voice answering.
            <div style={{ width: "100%", maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <div className="waveform" aria-hidden>
                {Array.from({ length: 9 }).map((_, i) => <i key={i} />)}
              </div>
              <div style={{ minHeight: 44, textAlign: "center", color: "#eaf0ff", fontSize: 15, lineHeight: 1.5, maxWidth: 760 }}>
                {liveText ? `“${liveText}”` : <span className="answer-hint">Start speaking — I&apos;m listening. I&apos;ll respond when you pause.</span>}
              </div>
              <div className="answer-row" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button className="kiosk-next" onClick={finishAnswerAndSubmit} disabled={!liveText.trim()} style={!liveText.trim() ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
                  I&apos;m done — send <IconChevronRight width={16} height={16} />
                </button>
                <button
                  className="mic-btn"
                  aria-label="Restart answer"
                  title="Clear and re-answer"
                  onClick={() => { teardownVoice(); startListening(); }}
                >
                  <IconRefresh />
                </button>
              </div>
            </div>
          )}
        </div>

        {showEnd && (
          <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "#fff", color: "var(--navy)", borderRadius: 16, padding: 28, maxWidth: 420, textAlign: "center" }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>End the interview?</h3>
                <p style={{ margin: "0 0 20px", color: "var(--gray-500)", fontSize: 14, lineHeight: 1.5 }}>
                  We&apos;ll score the evidence gathered so far, and this <b>counts as one of your interview attempts</b>. You can&apos;t resume.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button className="btn-outline" onClick={() => setShowEnd(false)}>Keep going</button>
                  <button className="btn-solid" style={{ background: "#ff4d4d", backgroundImage: "none" }} onClick={endInterview}>
                    End &amp; score now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- Engine couldn't start (key is set but the call failed) ----
  if (step === "error") {
    const hint = friendlyStartError(startError);
    return (
      <div className="assess">
        <div className="page-head">
          <h1>AI interview couldn&apos;t start</h1>
          <p>Your API key is configured, so this isn&apos;t practice mode — something went wrong reaching the AI interviewer.</p>
        </div>
        <div className="feedback-card" style={{ background: "rgba(255,77,77,.08)", borderColor: "rgba(255,77,77,.3)" }}>
          <h5>What happened</h5>
          <p style={{ marginBottom: 10 }}>{hint.summary}</p>
          {hint.steps.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {hint.steps.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
            </ul>
          )}
          <p style={{ marginTop: 12, fontSize: 12, color: "var(--gray-500)" }}>
            Technical detail: <code>{String(startError)}</code>
          </p>
        </div>
        <div className="assess-actions">
          <Link href="/dashboard/interview" className="btn-outline">Back to interviews</Link>
          <button className="btn-solid" onClick={beginLive}><IconRefresh width={16} height={16} /> Try again</button>
        </div>
      </div>
    );
  }

  // ---- Processing ----
  if (step === "processing") {
    return (
      <div className="kiosk">
        <div className="kiosk-processing">
          <div className="spin" />
          <h2>Compiling your assessment…</h2>
          <p>The AI interviewer is reviewing the evidence from your answers. This only takes a moment.</p>
        </div>
      </div>
    );
  }

  // ---- Result ----
  if (step === "result" && result) {
    if (result.incomplete) {
      return (
        <div className="assess">
          <div className="page-head">
            <h1>Interview ended</h1>
            <p>Your session ended before a full assessment could be produced.</p>
          </div>
          <div className="feedback-card" style={{ background: "rgba(255,171,0,.10)", borderColor: "rgba(255,171,0,.3)" }}>
            <h5>This counted as attempt #{result.attemptNo}</h5>
            <p>We couldn&apos;t generate a score this time{result.error ? ` (${result.error})` : ""}. You can retake the interview, or unlock training for guided practice and retries.</p>
          </div>
          <div className="assess-actions">
            <button className="btn-outline" onClick={retake}><IconRefresh width={16} height={16} /> Retake test</button>
            <button className="btn-solid" onClick={() => setStep("payment")}><IconCap width={16} height={16} /> Unlock training</button>
          </div>
        </div>
      );
    }

    const gaps = result.critical_gaps || [];
    const plan = result.suggestedTraining || { technical: [], administrative: [] };
    const band = result.band || bandOf(result.score);
    const pending = result.status === "pending_review";

    const BANDS = {
      ready: { tone: "pass", title: "Ready", lead: "Your technical readiness meets the bar for this role. Next step: the professional interview." },
      close: { tone: "warn", title: "Almost there", lead: "You're close. A short, focused burst of training on the gaps below will get you ready." },
      foundational: { tone: "warn", title: "Foundational training recommended", lead: "You have a base to build on. The plan below targets exactly what's missing for this role." },
    };
    const b = BANDS[band] || BANDS.foundational;

    return (
      <div className="assess">
        <div className="page-head">
          <h1>Your Technical Readiness Report</h1>
          <p>This is a diagnostic — it shows where you stand and exactly what to work on next. It isn&apos;t a rejection.</p>
        </div>

        {mode === "demo" && (
          <div className="feedback-card" style={{ background: "rgba(255,171,0,.10)", borderColor: "rgba(255,171,0,.3)", marginBottom: 16 }}>
            <h5 style={{ marginTop: 0 }}>Practice mode — these scores are illustrative</h5>
            <p style={{ margin: 0, fontSize: 13 }}>
              The server didn&apos;t see an <code>ANTHROPIC_API_KEY</code>, so this ran as a scripted practice diagnostic. Set the key and restart the dev server for a real, CV-grounded report.
            </p>
          </div>
        )}

        {pending ? (
          <div className="feedback-card" style={{ background: "rgba(0,123,255,.07)", borderColor: "rgba(0,123,255,.25)" }}>
            <h5 style={{ marginTop: 0 }}><IconClock width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} /> Your report is being reviewed</h5>
            <p style={{ margin: 0 }}>
              A NexIT reviewer is confirming your results. You&apos;ll be notified as soon as it&apos;s ready — then you&apos;ll see your full readiness report and personalised plan here.
            </p>
          </div>
        ) : (
          <>
            {/* Band banner + readiness ring */}
            <div className="assess-top">
              <span className={`result-banner ${b.tone === "pass" ? "pass" : "fail"}`}>
                {b.tone === "pass" ? <IconCheck /> : <IconClock />}
                {b.title} · {result.score}% readiness
              </span>
              <ScoreRing score={result.score} passed={b.tone === "pass"} />
            </div>
            <p style={{ margin: "0 0 20px", color: "var(--gray-600)", fontSize: 15 }}>{b.lead}</p>

            {/* GAPS FIRST — what to work on */}
            {gaps.length > 0 && (
              <div className="feedback-card">
                <h5>What&apos;s standing between you and this role</h5>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {gaps.map((g, i) => <li key={i} style={{ marginBottom: 6 }}>{g}</li>)}
                </ul>
              </div>
            )}

            {/* AI-GENERATED PERSONALISED TRAINING PLAN */}
            {(plan.technical?.length > 0 || plan.administrative?.length > 0) && (
              <div className="feedback-card">
                <h5>Your personalised training plan</h5>
                <p style={{ marginTop: 0, fontSize: 13, color: "var(--gray-500)" }}>
                  Built from your interview. Start these on your own now — then NexIT&apos;s role-specific programme takes you the rest of the way.
                </p>
                <PlanGroup title="Technical skills" items={plan.technical} />
                <PlanGroup title="Administrative & professional skills" items={plan.administrative} />
              </div>
            )}

            {/* Competency breakdown */}
            <div className="breakdown">
              {Object.entries(result.breakdown || {}).map(([k, v]) => {
                const conf = result.competencies?.[k]?.confidence;
                return (
                  <div className="brow" key={k}>
                    <div className="bt">
                      <span>{k}{conf ? <em style={{ fontStyle: "normal", color: "var(--gray-500)", fontSize: 12, marginLeft: 8 }}>· {conf} confidence</em> : null}</span>
                      <b>{v}%</b>
                    </div>
                    <div className="track"><i style={{ width: `${v}%` }} /></div>
                  </div>
                );
              })}
            </div>

            {(result.summary || result.feedback) && (
              <div className="feedback-card">
                <h5>Summary</h5>
                <p>{result.summary || result.feedback}</p>
              </div>
            )}

            {/* Next actions by band */}
            {band === "ready" ? (
              <div className="assess-actions">
                <Link href="/dashboard/interview" className="btn-solid">
                  Continue to Professional interview <IconChevronRight width={16} height={16} />
                </Link>
                <Link href="/dashboard/training/specific" className="btn-outline">
                  <IconCap width={16} height={16} /> See NexIT specific training
                </Link>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "var(--gray-500)", margin: "0 0 16px" }}>
                  Work through your plan above (free), then take NexIT&apos;s role-specific training to become job-ready — it includes mentorship and live practical sessions.
                  {retakesLeft > 0
                    ? ` You have ${retakesLeft} free retake${retakesLeft === 1 ? "" : "s"} left.`
                    : " A subscription removes the one-month retake wait."}
                </p>
                <div className="assess-actions">
                  <Link href="/dashboard/training/specific" className="btn-solid">
                    <IconCap width={16} height={16} /> NexIT specific training
                  </Link>
                  <button className="btn-outline" onClick={retake}>
                    <IconRefresh width={16} height={16} /> Retake diagnostic
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  // ---- Unlock training / payment ----
  if (step === "payment") {
    return (
      <>
        <div className="page-head">
          <h1>Unlock Your Training Access</h1>
          <p>Get tailored training and 2 AI retries per month to pass the assessment.</p>
        </div>
        <div className="unlock">
          <div className="lock-box">
            <h4>Sample Questions</h4>
            <div className="lock-inner">
              <span className="lk"><IconLock width={64} height={64} /></span>
              <div className="lock-cta">Unlock Your Training For $29</div>
            </div>
          </div>
          <div className="pay-card">
            <h4>Payment</h4>
            <div className="field field-simple"><label>Card number</label><input placeholder="1234 5678 9012 3456" /></div>
            <div className="field-row">
              <div className="field field-simple"><label>MM / YY</label><input placeholder="08 / 27" /></div>
              <div className="field field-simple"><label>CVV</label><input placeholder="123" /></div>
            </div>
            <div className="field field-simple"><label>Billing email</label><input placeholder="you@example.com" defaultValue={signup.email} /></div>
            <button className="btn-solid" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => { unlockTraining(); router.push("/dashboard/training"); }}>
              <IconCard width={16} height={16} /> Continue payment
            </button>
            <button className="btn-outline" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={() => setStep("result")}>Cancel</button>
          </div>
        </div>
      </>
    );
  }

  return null;
}

/* One group (Technical / Administrative) of the AI training plan. */
function PlanGroup({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it, i) => (
          <div key={i} style={{ border: "1px solid #eef1f6", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <b style={{ fontSize: 14 }}>{it.title}</b>
              {it.est_time ? <span style={{ fontSize: 12, color: "var(--gray-500)" }}>{it.est_time}</span> : null}
            </div>
            {it.focus ? <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--gray-600)" }}>Closes: {it.focus}</p> : null}
            {it.resource ? <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--gray-500)" }}>Resource: {it.resource}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Conic-gradient score ring (no chart library). */
function ScoreRing({ score, passed }) {
  const color = passed ? "#2ecc71" : "#007bff";
  return (
    <div style={{ width: 140, height: 140, borderRadius: "50%", background: `conic-gradient(${color} ${score}%, #eef1f6 0)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 104, height: 104, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <strong style={{ fontSize: 30, color: "var(--navy)" }}>{score}%</strong>
      </div>
    </div>
  );
}
