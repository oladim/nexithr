"use client";
/**
 * Cross-browser voice for the AI interview (browser side).
 *
 * Why it used to be Chrome-only: the interview relied on the Web Speech API's
 * SpeechRecognition, which only Chromium browsers ship in a usable form
 * (Chrome/Edge send audio to Google/Microsoft). Firefox has no implementation,
 * Safari's is unreliable for long continuous answers, and Brave/Opera expose the
 * API but it fails with a "network" error.
 *
 * Now:
 *  - Listening: Chrome/Edge use built-in recognition (live captions). Every other
 *    browser records the answer with MediaRecorder + a silence detector and the
 *    server transcribes it (/api/interview/transcribe). If neither is possible,
 *    the candidate types.
 *  - Speaking: server TTS when configured (same natural voice everywhere), else
 *    the browser's own voices (loaded properly for Safari/Firefox, spoken in
 *    short chunks to dodge Chrome's ~15s cut-off), else on-screen text only.
 */

let audioCtx = null;
let audioEl = null;
const SILENT_WAV = "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";

const ua = () => (typeof navigator !== "undefined" ? navigator.userAgent || "" : "");

export function browserInfo() {
  const u = ua();
  const isIOS = /iPad|iPhone|iPod/.test(u) || (typeof navigator !== "undefined" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isFirefox = /Firefox\/|FxiOS/.test(u);
  const isEdge = /Edg\//.test(u);
  const isOpera = /OPR\//.test(u);
  const isSamsung = /SamsungBrowser/.test(u);
  const isBrave = typeof navigator !== "undefined" && !!navigator.brave;
  const isChrome = /Chrome\//.test(u) && !isEdge && !isOpera && !isSamsung && !isBrave && !isIOS;
  const isSafari = /Safari\//.test(u) && !/Chrome\/|Chromium|CriOS|FxiOS|Edg/.test(u);
  return { isIOS, isFirefox, isEdge, isOpera, isSamsung, isBrave, isChrome, isSafari };
}

export function hasBrowserStt() {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function canRecord() {
  return (
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    !!(window.AudioContext || window.webkitAudioContext)
  );
}

/**
 * Pick how to listen: "browser" | "server" | "typed".
 * Built-in recognition is only trusted where it really works (Chrome/Edge on
 * desktop & Android). Everything else records and uses server STT if it's on.
 */
export function chooseSttEngine({ serverStt }) {
  const b = browserInfo();
  const reliableBrowserStt = hasBrowserStt() && (b.isChrome || b.isEdge);
  if (reliableBrowserStt) return "browser";
  if (serverStt && canRecord()) return "server";
  if (hasBrowserStt() && !b.isBrave && !b.isOpera) return "browser"; // e.g. Safari / Samsung, best effort
  return "typed";
}

/** Ask the server which speech features are configured. */
export async function fetchVoiceCaps() {
  try {
    const r = await fetch("/api/interview/transcribe", { cache: "no-store" });
    if (!r.ok) return { stt: false, tts: false };
    const d = await r.json();
    return { stt: !!d.stt, tts: !!d.tts };
  } catch {
    return { stt: false, tts: false };
  }
}

/**
 * MUST be called synchronously inside the click that starts the interview.
 * iOS/Safari only allow audio and speech after a user gesture; this unlocks
 * speechSynthesis, an <audio> element and an AudioContext for later use.
 */
export function primeAudio() {
  try {
    const synth = window.speechSynthesis;
    if (synth) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      synth.speak(u);
      synth.getVoices();
    }
  } catch {}
  try {
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.setAttribute("playsinline", "");
      audioEl.preload = "auto";
    }
    audioEl.src = SILENT_WAV;
    audioEl.play?.().catch(() => {});
  } catch {}
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC && !audioCtx) audioCtx = new AC();
    audioCtx?.resume?.().catch(() => {});
  } catch {}
}

/** Resolve the browser's voice list (Safari/Firefox load it asynchronously). */
export function loadVoices(timeoutMs = 1500) {
  return new Promise((resolve) => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (!synth) return resolve([]);
    const now = synth.getVoices() || [];
    if (now.length) return resolve(now);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try { synth.removeEventListener?.("voiceschanged", finish); } catch {}
      resolve(synth.getVoices() || []);
    };
    try { synth.addEventListener?.("voiceschanged", finish); } catch {}
    setTimeout(finish, timeoutMs);
  });
}

function pickVoice(voices) {
  const en = voices.filter((v) => /^en/i.test(v.lang));
  return (
    en.find((v) => /natural|neural|online/i.test(v.name)) || // Edge "Online (Natural)" voices
    en.find((v) => /google (us|uk) english/i.test(v.name)) ||
    en.find((v) => /samantha|aria|jenny|zira|karen|moira|serena|daniel/i.test(v.name)) ||
    en.find((v) => /en[-_]?(US|GB)/i.test(v.lang)) ||
    en[0] ||
    voices[0] ||
    null
  );
}

// Split into sentence-ish chunks ≤ ~180 chars (Chrome stops long utterances).
function chunkText(text) {
  const parts = String(text).match(/[^.!?;:]+[.!?;:]*\s*/g) || [String(text)];
  const out = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + p).length > 180 && cur) { out.push(cur.trim()); cur = ""; }
    if (p.length > 180) {
      for (const w of p.split(/(?<=,)\s+|\s+/)) {
        if ((cur + " " + w).length > 180 && cur) { out.push(cur.trim()); cur = ""; }
        cur += (cur ? " " : "") + w;
      }
    } else cur += p;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/**
 * Create a speaker. speak(text) → Promise that resolves when finished (or
 * cancelled). Never rejects — any failure just falls through to "done".
 */
export function createSpeaker({ serverTts = false } = {}) {
  let token = 0;
  let voices = [];
  let serverOk = serverTts;
  loadVoices().then((v) => { voices = v; });

  const stop = () => {
    token++;
    try { window.speechSynthesis?.cancel(); } catch {}
    try { if (audioEl) { audioEl.pause(); audioEl.onended = null; audioEl.onerror = null; } } catch {}
  };

  const viaServer = async (text, my) => {
    const r = await fetch("/api/interview/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!r.ok) throw new Error(`tts ${r.status}`);
    const blob = await r.blob();
    if (my !== token) return;
    const url = URL.createObjectURL(blob);
    const el = audioEl || (audioEl = new Audio());
    await new Promise((resolve, reject) => {
      const cleanup = () => { try { URL.revokeObjectURL(url); } catch {} };
      el.onended = () => { cleanup(); resolve(); };
      el.onerror = () => { cleanup(); reject(new Error("audio error")); };
      el.src = url;
      const p = el.play();
      if (p?.catch) p.catch((e) => { cleanup(); reject(e); });
      // Safety in case "ended" never fires.
      setTimeout(() => { cleanup(); resolve(); }, Math.min(90, Math.max(6, text.length / 9)) * 1000);
    });
  };

  const viaBrowser = async (text, my) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      // No speech at all — give the candidate time to read the question.
      await new Promise((r) => setTimeout(r, Math.min(12000, 1500 + text.length * 40)));
      return;
    }
    if (!voices.length) voices = await loadVoices(1200);
    const voice = pickVoice(voices);
    for (const chunk of chunkText(text)) {
      if (my !== token) return;
      await new Promise((resolve) => {
        let settled = false;
        const done = () => { if (!settled) { settled = true; clearInterval(keepAlive); resolve(); } };
        const u = new SpeechSynthesisUtterance(chunk);
        if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-US";
        u.rate = 1;
        u.pitch = 1;
        u.onend = done;
        u.onerror = done;
        // Chrome sometimes pauses synthesis silently; nudge it.
        const keepAlive = setInterval(() => { try { if (synth.paused) synth.resume(); } catch {} }, 4000);
        try { synth.speak(u); } catch { done(); }
        setTimeout(done, Math.min(30, Math.max(3, Math.ceil(chunk.length / 10))) * 1000);
      });
    }
  };

  // Resolves true when finished, false when cancelled by stop()/a newer speak().
  const speak = async (text) => {
    stop();
    const my = ++token;
    const t = String(text || "").trim();
    if (!t) return true;
    if (serverOk) {
      try { await viaServer(t, my); return my === token; } catch { serverOk = false; /* fall back for the rest of the session */ }
    }
    if (my !== token) return false;
    try { await viaBrowser(t, my); } catch {}
    return my === token;
  };

  return { speak, stop };
}

function pickMime() {
  const MR = window.MediaRecorder;
  const opts = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4", "audio/webm", "audio/aac"];
  for (const m of opts) {
    try { if (MR.isTypeSupported?.(m)) return m; } catch {}
  }
  return "";
}

/**
 * Record one spoken answer from `stream` and stop automatically after the
 * candidate goes quiet. Returns a controller:
 *   { stop(): Promise<Blob|null>, cancel(), mimeType }
 * Callbacks: onLevel(0..1), onSpeechStart(), onAutoStop(), onElapsed(sec)
 */
export function createAnswerRecorder(stream, { silenceMs = 3000, maxMs = 180000, onLevel, onSpeechStart, onAutoStop, onElapsed } = {}) {
  const audioTracks = stream?.getAudioTracks?.() || [];
  if (!audioTracks.length) throw new Error("no-mic");
  const audioStream = new MediaStream(audioTracks);
  const mimeType = pickMime();
  const rec = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };

  const AC = window.AudioContext || window.webkitAudioContext;
  if (!audioCtx && AC) audioCtx = new AC();
  try { audioCtx?.resume?.(); } catch {}
  let source = null;
  let analyser = null;
  try {
    source = audioCtx.createMediaStreamSource(audioStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
  } catch {}

  const buf = new Float32Array(1024);
  const started = Date.now();
  let floor = 0.004;
  let calibN = 0;
  let loudFrames = 0;
  let spoke = false;
  let lastVoice = Date.now();
  let stopped = false;
  let stopResolve;
  const stoppedP = new Promise((r) => { stopResolve = r; });

  rec.onstop = () => {
    const blob = chunks.length ? new Blob(chunks, { type: rec.mimeType || mimeType || "audio/webm" }) : null;
    stopResolve(spoke ? blob : blob && blob.size > 4000 ? blob : null);
  };

  const tick = setInterval(() => {
    if (stopped) return;
    const elapsed = Date.now() - started;
    onElapsed?.(Math.floor(elapsed / 1000));
    let rms = 0;
    if (analyser) {
      try {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        rms = Math.sqrt(sum / buf.length);
      } catch {}
    }
    // Calibrate background noise for the first ~400ms.
    if (calibN < 8) { floor = (floor * calibN + rms) / (calibN + 1); calibN++; }
    const threshold = Math.max(0.012, floor * 2.8);
    onLevel?.(Math.min(1, rms / (threshold * 4)));
    if (rms > threshold) {
      loudFrames++;
      if (loudFrames >= 3) {
        lastVoice = Date.now();
        if (!spoke) { spoke = true; onSpeechStart?.(); }
      }
    } else {
      loudFrames = 0;
    }
    if ((spoke && Date.now() - lastVoice > silenceMs) || elapsed > maxMs) {
      onAutoStop?.();
    }
  }, 50);

  const teardown = () => {
    stopped = true;
    clearInterval(tick);
    try { source?.disconnect(); } catch {}
  };

  try { rec.start(1000); } catch (e) { teardown(); throw e; }

  return {
    mimeType: rec.mimeType || mimeType,
    get spoke() { return spoke; },
    stop: () => {
      if (!stopped) {
        teardown();
        try { if (rec.state !== "inactive") rec.stop(); else stopResolve(null); } catch { stopResolve(null); }
      }
      return stoppedP;
    },
    cancel: () => {
      if (!stopped) {
        teardown();
        rec.onstop = () => stopResolve(null);
        try { if (rec.state !== "inactive") rec.stop(); else stopResolve(null); } catch { stopResolve(null); }
      }
    },
  };
}

/** Send a recorded answer to the server for transcription. */
export async function transcribeBlob(blob) {
  const r = await fetch("/api/interview/transcribe", {
    method: "POST",
    headers: { "content-type": (blob.type || "audio/webm").split(";")[0] },
    body: blob,
  });
  let d = {};
  try { d = await r.json(); } catch {}
  if (!r.ok) return { error: d.error || `transcribe ${r.status}` };
  return { text: String(d.text || "").trim() };
}
