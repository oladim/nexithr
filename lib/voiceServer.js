/**
 * Server-side speech for the AI interview — SERVER ONLY.
 *
 * Browsers differ: Chrome/Edge ship speech recognition (Web Speech API), but
 * Firefox has none and Safari's is unreliable for long answers. So the
 * interview can record the candidate's answer with MediaRecorder (works in
 * every modern browser) and send the audio here for transcription.
 *
 * Providers (first configured wins, or force one with STT_PROVIDER / TTS_PROVIDER):
 *   STT: OPENAI_API_KEY (gpt-4o-mini-transcribe), GROQ_API_KEY (whisper-large-v3-turbo),
 *        DEEPGRAM_API_KEY (nova-3)
 *   TTS: OPENAI_API_KEY (gpt-4o-mini-tts), DEEPGRAM_API_KEY (aura-2)
 * Keys are read here only and never sent to the browser.
 */

const clean = (v) => (v || "").trim().replace(/^["']|["']$/g, "");

export function sttProvider() {
  const forced = clean(process.env.STT_PROVIDER).toLowerCase();
  const has = { openai: !!clean(process.env.OPENAI_API_KEY), groq: !!clean(process.env.GROQ_API_KEY), deepgram: !!clean(process.env.DEEPGRAM_API_KEY) };
  if (forced) return has[forced] ? forced : null;
  return has.openai ? "openai" : has.groq ? "groq" : has.deepgram ? "deepgram" : null;
}

export function ttsProvider() {
  const forced = clean(process.env.TTS_PROVIDER).toLowerCase();
  const has = { openai: !!clean(process.env.OPENAI_API_KEY), deepgram: !!clean(process.env.DEEPGRAM_API_KEY) };
  if (forced === "browser" || forced === "off") return null;
  if (forced) return has[forced] ? forced : null;
  return has.openai ? "openai" : has.deepgram ? "deepgram" : null;
}

export const AUDIO_MAX_BYTES = 8 * 1024 * 1024; // ~8 MB ≈ several minutes of opus
const AUDIO_TYPES = /^(audio\/(webm|ogg|mp4|mpeg|mp3|wav|x-wav|wave|aac|m4a|x-m4a)|video\/webm|video\/mp4)/i;

export function audioTypeOk(type) {
  return AUDIO_TYPES.test(String(type || ""));
}

function extFor(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("ogg")) return "ogg";
  if (t.includes("mp4") || t.includes("m4a") || t.includes("aac")) return "mp4";
  if (t.includes("mpeg") || t.includes("mp3")) return "mp3";
  if (t.includes("wav")) return "wav";
  return "webm";
}

async function readError(res) {
  let body = "";
  try { body = await res.text(); } catch {}
  if (res.status === 401) return "the speech provider rejected the API key (401)";
  if (res.status === 429) return "speech provider rate limit reached (429)";
  return `speech provider ${res.status}: ${body.slice(0, 160)}`;
}

/** Transcribe audio. Returns { text } or { error }. */
export async function transcribe(buf, type, { language = "en" } = {}) {
  const provider = sttProvider();
  if (!provider) return { error: "no-stt" };
  const contentType = String(type || "audio/webm").split(";")[0];

  try {
    if (provider === "deepgram") {
      const model = clean(process.env.STT_MODEL) || "nova-3";
      const res = await fetch(`https://api.deepgram.com/v1/listen?model=${encodeURIComponent(model)}&smart_format=true&punctuate=true&language=${language}`, {
        method: "POST",
        headers: { Authorization: `Token ${clean(process.env.DEEPGRAM_API_KEY)}`, "Content-Type": contentType },
        body: buf,
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) return { error: await readError(res) };
      const data = await res.json();
      return { text: (data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "").trim() };
    }

    // OpenAI and Groq share the same multipart API.
    const isGroq = provider === "groq";
    const url = isGroq ? "https://api.groq.com/openai/v1/audio/transcriptions" : "https://api.openai.com/v1/audio/transcriptions";
    const key = clean(isGroq ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY);
    const model = clean(process.env.STT_MODEL) || (isGroq ? "whisper-large-v3-turbo" : "gpt-4o-mini-transcribe");
    const form = new FormData();
    form.append("file", new Blob([buf], { type: contentType }), `answer.${extFor(contentType)}`);
    form.append("model", model);
    form.append("language", language);
    form.append("response_format", "json");
    // Bias toward the vocabulary of a tech interview.
    form.append("prompt", "A candidate answering a technical job interview question.");
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return { error: await readError(res) };
    const data = await res.json();
    return { text: String(data?.text || "").trim() };
  } catch (e) {
    return { error: e?.name === "TimeoutError" ? "speech provider timed out" : `network: ${e.message}` };
  }
}

/** Synthesize speech. Returns { audio: ArrayBuffer, type } or { error }. */
export async function synthesize(text) {
  const provider = ttsProvider();
  if (!provider) return { error: "no-tts" };
  const input = String(text || "").slice(0, 3000);
  if (!input.trim()) return { error: "empty" };
  try {
    if (provider === "deepgram") {
      const model = clean(process.env.TTS_VOICE) || "aura-2-thalia-en";
      const res = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(model)}&encoding=mp3`, {
        method: "POST",
        headers: { Authorization: `Token ${clean(process.env.DEEPGRAM_API_KEY)}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) return { error: await readError(res) };
      return { audio: await res.arrayBuffer(), type: "audio/mpeg" };
    }
    const ttsModel = clean(process.env.TTS_MODEL) || "gpt-4o-mini-tts";
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${clean(process.env.OPENAI_API_KEY)}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ttsModel,
        voice: clean(process.env.TTS_VOICE) || "alloy",
        input,
        response_format: "mp3",
        // Only the gpt-4o TTS models accept style instructions (tts-1 rejects them).
        ...(/gpt-4o/i.test(ttsModel) ? { instructions: "Speak as a warm, professional job interviewer. Clear, steady pace." } : {}),
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return { error: await readError(res) };
    return { audio: await res.arrayBuffer(), type: "audio/mpeg" };
  } catch (e) {
    return { error: e?.name === "TimeoutError" ? "speech provider timed out" : `network: ${e.message}` };
  }
}

// Small per-user rate limit (in-memory; per server instance) so the speech
// endpoints can't be used as a free transcription/TTS service.
const hits = new Map();
export function rateLimited(key, max = 40, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}
