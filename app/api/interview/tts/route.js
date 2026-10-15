import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { SUPABASE_ENABLED } from "@/lib/supabase/config";
import { ttsProvider, synthesize, rateLimited } from "@/lib/voiceServer";

export const runtime = "nodejs";
export const maxDuration = 60;

const supabaseConfigured = () => SUPABASE_ENABLED;

/**
 * POST /api/interview/tts { text } → audio/mpeg
 * Natural interviewer voice for browsers with no (or poor) built-in voices.
 */
export async function POST(request) {
  const me = await getSessionProfile().catch(() => null);
  if (supabaseConfigured() && !me?.id) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!ttsProvider()) return NextResponse.json({ error: "no-tts" }, { status: 503 });
  if (rateLimited(`tts:${me?.id || request.headers.get("x-forwarded-for") || "anon"}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const text = String(body?.text || "").slice(0, 3000);
  if (!text.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });
  const res = await synthesize(text);
  if (res.error) return NextResponse.json({ error: res.error }, { status: 502 });
  return new Response(res.audio, { headers: { "content-type": res.type, "cache-control": "no-store" } });
}
