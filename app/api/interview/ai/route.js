import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { extractPdfText } from "@/lib/cvAnalyze";
import { loadRoleRequirements, ROLE_LABELS } from "@/lib/db";
import { anthropicChat, anthropicEnabled } from "@/lib/anthropic";
import {
  buildInterviewSystem,
  parseFinalAssessment,
  KICKOFF_USER_TURN,
  END_SIGNAL,
  FINAL_MARKER,
} from "@/lib/interviewPrompt";

// Strip anything that shouldn't be read aloud (fenced code / JSON blocks) from
// a spoken interviewer turn, as a guard against the report leaking to TTS.
function speakable(text) {
  let t = String(text || "");
  t = t.replace(/```[\s\S]*?```/g, " ");      // fenced blocks
  t = t.replace(/\{[\s\S]*"competencies"[\s\S]*\}/g, " "); // stray report object
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

// Node runtime: needs the PDF parser + server fetch to Anthropic.
export const runtime = "nodejs";

/**
 * AI Adaptive Interview — the conversational engine.
 *
 * POST /api/interview/ai  { action, messages?, sessionId?, profile? }
 *   action "start"    → begins the interview, returns the opening turn.
 *   action "reply"    → sends the transcript, returns the next interviewer turn
 *                       (and the final assessment if the interview has ended).
 *   action "finalize" → forces the Final Assessment Report (time up / ended).
 *
 * The system prompt (rubric + the two documents) is ALWAYS built server-side and
 * never trusted from the client, so a candidate can't rewrite their own rubric.
 * We cache the built prompt per user for the session so we don't re-read the PDF
 * on every turn.
 */

// userId|sessionId -> { system, ts }
const systemCache = new Map();
const TTL_MS = 60 * 60 * 1000; // 1 hour

function cacheGet(key) {
  const hit = systemCache.get(key);
  if (hit && Date.now() - hit.ts < TTL_MS) return hit.system;
  if (hit) systemCache.delete(key);
  return null;
}
function cacheSet(key, system) {
  systemCache.set(key, { system, ts: Date.now() });
}

// Build the interview system prompt from the signed-in candidate's real data.
async function buildFromSession(profile) {
  const admin = getServiceSupabase();
  if (!admin) return null;
  const userId = profile.id;

  const { data: cand } = await admin
    .from("candidates")
    .select("target_role, experience, skills")
    .eq("id", userId)
    .maybeSingle();

  const { data: cvRow } = await admin
    .from("cvs")
    .select("file_path")
    .eq("candidate_id", userId)
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { byKey } = await loadRoleRequirements(admin);
  const roleReq = byKey[cand?.target_role] || null;

  let cvText = "";
  if (cvRow?.file_path) {
    const { data: file } = await admin.storage.from("cvs").download(cvRow.file_path);
    if (file) {
      const buf = Buffer.from(await file.arrayBuffer());
      const ext = await extractPdfText(buf);
      cvText = ext.text || "";
    }
  }

  const candidate = {
    name: profile.full_name || "Candidate",
    roleLabel: ROLE_LABELS[cand?.target_role] || cand?.target_role || "—",
    experience: cand?.experience || "",
    skills: cand?.skills || [],
  };

  return buildInterviewSystem({ roleReq, cvText, candidate });
}

// Build a degraded system prompt from client-provided profile (demo mode, no
// server session / no stored CV). Used only to keep the feature usable.
function buildFromProfile(profile) {
  const candidate = {
    name: profile?.name || "Candidate",
    roleLabel: profile?.roleLabel || profile?.targetRole || "—",
    experience: profile?.experience || "",
    skills: Array.isArray(profile?.skills)
      ? profile.skills
      : String(profile?.skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
  };
  return buildInterviewSystem({ roleReq: null, cvText: "", candidate });
}

// Resolve the system prompt for this request (cache → session → profile).
async function resolveSystem(key, body) {
  const cached = cacheGet(key);
  if (cached) return cached;

  const me = await getSessionProfile();
  let system = null;
  if (me && me.role === "candidate") {
    system = await buildFromSession(me).catch(() => null);
  }
  if (!system && body?.profile) system = buildFromProfile(body.profile);
  if (system) cacheSet(key, system);
  return system;
}

// Clean the transcript into Anthropic's alternating user/assistant shape.
function sanitizeMessages(raw) {
  const msgs = (Array.isArray(raw) ? raw : [])
    .map((m) => ({
      role: m?.role === "assistant" ? "assistant" : "user",
      content: typeof m?.content === "string" ? m.content : String(m?.content ?? ""),
    }))
    .filter((m) => m.content.trim().length > 0);

  // Merge consecutive same-role turns.
  const merged = [];
  for (const m of msgs) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content += "\n\n" + m.content;
    else merged.push({ ...m });
  }
  // Must start with a user turn.
  if (merged.length && merged[0].role !== "user") {
    merged.unshift({ role: "user", content: KICKOFF_USER_TURN });
  }
  return merged;
}

async function keyFor(body) {
  const me = await getSessionProfile().catch(() => null);
  if (me?.id) return `u:${me.id}`;
  if (body?.sessionId) return `s:${body.sessionId}`;
  return `s:anon`;
}

// GET /api/interview/ai — safe diagnostic. Returns whether the server can see
// an API key (never the key itself) and the model pin, so you can confirm the
// interview will run in real AI mode. Visit this URL after setting the key.
export async function GET() {
  return NextResponse.json({
    aiEnabled: anthropicEnabled(),
    modelPin: process.env.INTERVIEW_MODEL || process.env.ANTHROPIC_MODEL || null,
    hint: anthropicEnabled()
      ? "Key detected — the AI interview will run in real mode."
      : "No key detected. Set ANTHROPIC_API_KEY in .env.local and RESTART the dev server (Next.js reads env only at startup).",
  });
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const action = body?.action;

  // No key → tell the client to run the built-in demo interview.
  if (!anthropicEnabled()) {
    return NextResponse.json({ mode: "demo", reason: "no-key" });
  }

  const key = await keyFor(body);

  // ---- start ----
  if (action === "start") {
    const system = await resolveSystem(key, body);
    if (!system) return NextResponse.json({ mode: "demo", reason: "no-context" });

    const res = await anthropicChat({
      system,
      messages: [{ role: "user", content: KICKOFF_USER_TURN }],
      maxTokens: 500,
      temperature: 0.7,
      envModel: process.env.INTERVIEW_MODEL,
    });
    if (res.error) return NextResponse.json({ mode: "demo", reason: res.error });
    return NextResponse.json({
      mode: "ai",
      sessionId: key.startsWith("s:") ? key.slice(2) : undefined,
      opening: res.text,
      model: res.model,
    });
  }

  // ---- reply ----
  if (action === "reply") {
    const system = await resolveSystem(key, body);
    if (!system) return NextResponse.json({ error: "no-context", mode: "demo" }, { status: 200 });

    const messages = sanitizeMessages(body?.messages);
    if (messages.length === 0) return NextResponse.json({ error: "no-messages" }, { status: 400 });

    // Give enough room that if the model decides to end on this turn, the whole
    // Final Assessment JSON fits (truncation is what used to leak it to TTS).
    const res = await anthropicChat({ system, messages, maxTokens: 1400 });
    if (res.error) return NextResponse.json({ error: res.error, mode: "demo" }, { status: 200 });

    // If the model is ending the interview on this turn, NEVER speak the report.
    const looksFinal = res.text.includes(FINAL_MARKER) || /```/.test(res.text) || /"competencies"\s*:/.test(res.text);
    if (looksFinal) {
      const parsed = parseFinalAssessment(res.text);
      if (parsed.assessment) return NextResponse.json({ mode: "ai", final: parsed.assessment });
      // Report was emitted but couldn't be parsed (e.g. truncated) — ask the
      // client to run a clean finalize pass instead of speaking raw JSON.
      return NextResponse.json({ mode: "ai", needsFinalize: true });
    }

    // Normal question turn — strip any stray fenced/JSON content from speech.
    return NextResponse.json({ mode: "ai", text: speakable(res.text) });
  }

  // ---- finalize ----
  if (action === "finalize") {
    const system = await resolveSystem(key, body);
    if (!system) return NextResponse.json({ error: "no-context", mode: "demo" }, { status: 200 });

    const messages = sanitizeMessages(body?.messages);
    messages.push({ role: "user", content: END_SIGNAL });

    const res = await anthropicChat({ system, messages, maxTokens: 1500, temperature: 0.3 });
    if (res.error) return NextResponse.json({ error: res.error, mode: "demo" }, { status: 200 });

    const parsed = parseFinalAssessment(res.text);
    if (parsed.error) return NextResponse.json({ mode: "ai", text: res.text, final: null, parseError: parsed.error });
    return NextResponse.json({ mode: "ai", final: parsed.assessment });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
