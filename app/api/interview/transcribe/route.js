import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/config";
import { sttProvider, ttsProvider, transcribe, audioTypeOk, AUDIO_MAX_BYTES, rateLimited } from "@/lib/voiceServer";

export const runtime = "nodejs";
export const maxDuration = 60;

const supabaseConfigured = () => SUPABASE_ENABLED;

/**
 * GET  /api/interview/transcribe → { stt, tts } which server speech features are on.
 * POST /api/interview/transcribe  (raw audio body, Content-Type audio/*) → { text } | { error }
 *
 * Used by browsers without reliable built-in speech recognition (Firefox,
 * Safari, some mobile browsers) so they get the same voice interview.
 */
export async function GET() {
  return NextResponse.json({ stt: !!sttProvider(), tts: !!ttsProvider() });
}

export async function POST(request) {
  const me = await getSessionProfile().catch(() => null);
  if (supabaseConfigured() && !me?.id) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!sttProvider()) return NextResponse.json({ error: "no-stt" }, { status: 503 });
  if (rateLimited(`stt:${me?.id || request.headers.get("x-forwarded-for") || "anon"}`)) {
    return NextResponse.json({ error: "Too many requests — slow down a little." }, { status: 429 });
  }

  const type = request.headers.get("content-type") || "";
  if (!audioTypeOk(type)) return NextResponse.json({ error: "Unsupported audio type" }, { status: 415 });
  const len = Number(request.headers.get("content-length") || 0);
  if (len > AUDIO_MAX_BYTES) return NextResponse.json({ error: "Answer too long — please keep it under a few minutes." }, { status: 413 });

  let buf;
  try { buf = Buffer.from(await request.arrayBuffer()); } catch { return NextResponse.json({ error: "Couldn't read audio" }, { status: 400 }); }
  if (buf.length > AUDIO_MAX_BYTES) return NextResponse.json({ error: "Answer too long — please keep it under a few minutes." }, { status: 413 });
  if (buf.length < 800) return NextResponse.json({ text: "" }); // essentially silence

  const res = await transcribe(buf, type);
  if (res.error) return NextResponse.json({ error: res.error }, { status: 502 });
  return NextResponse.json({ text: res.text });
}
