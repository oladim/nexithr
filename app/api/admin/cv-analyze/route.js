import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { analyzeCv, extractPdfText } from "@/lib/cvAnalyze";
import { loadRoleRequirements } from "@/lib/db";

// Node runtime (needs the PDF parser + fetch to the LLM).
export const runtime = "nodejs";

// POST /api/admin/cv-analyze { cvId } — admins only.
// Reads the stored CV, extracts its text, and returns an LLM assessment
// against the role (or a skills-match fallback when no LLM key is set).
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { cvId } = body || {};
  if (!cvId) return NextResponse.json({ error: "cvId required" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Load the CV + candidate + role requirement.
  const { data: cv, error } = await admin
    .from("cvs")
    .select("file_path, candidates(target_role, experience, skills)")
    .eq("id", cvId)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const roleKey = cv.candidates?.target_role;
  const { byKey } = await loadRoleRequirements(admin);
  const roleReq = byKey[roleKey] || null;
  const candidateSkills = cv.candidates?.skills || [];
  const experienceYears = parseInt(String(cv.candidates?.experience || "").replace(/\D/g, ""), 10) || null;

  // Try to read the actual PDF text from storage.
  let cvText = "";
  let fileFound = false;
  let extractError = null;
  if (cv.file_path) {
    const { data: file, error: dlErr } = await admin.storage.from("cvs").download(cv.file_path);
    if (dlErr) extractError = `download: ${dlErr.message}`;
    if (file) {
      fileFound = true;
      const buf = Buffer.from(await file.arrayBuffer());
      const ext = await extractPdfText(buf);
      cvText = ext.text;
      extractError = ext.error;
    }
  }

  const analysis = await analyzeCv({ cvText, roleReq, candidateSkills, experienceYears });
  return NextResponse.json({
    ok: true,
    analysis,
    fileFound,
    textChars: cvText.length,
    note:
      analysis.source === "ai"
        ? `Read from the CV text (${cvText.length} characters).`
        : !process.env.ANTHROPIC_API_KEY
        ? "Skills match (set ANTHROPIC_API_KEY to read the CV text with AI)."
        : !fileFound
        ? "Skills match (no file stored for this CV)."
        : extractError
        ? `Skills match (couldn't read the PDF: ${extractError})`
        : analysis.llmError
        ? `Skills match — AI call failed: ${analysis.llmError}`
        : "Skills match.",
  });
}
