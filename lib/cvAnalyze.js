/**
 * Real CV analysis — reads the actual PDF text and asks an LLM to judge fit
 * against the role. Falls back to the deterministic skills match when no LLM
 * key is configured or extraction fails, so the feature always returns
 * something useful.
 *
 * Enable the real read by setting ANTHROPIC_API_KEY in .env.local.
 * Server-only (uses the file bytes + the API key).
 */
import { computeCvMatch } from "@/lib/cvMatch";

// Extract text from a PDF buffer. Returns { text, error }.
// Uses pdf-parse v2's PDFParse class (the v1 API bundled an ancient pdf.js that
// failed on valid PDFs).
export async function extractPdfText(buffer) {
  try {
    const { PDFParse } = await import("pdf-parse");
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const parser = new PDFParse({ data: bytes });
    const result = await parser.getText();
    const text = (result?.text || "").replace(/-- \d+ of \d+ --/g, "").trim();
    if (!text) return { text: "", error: "No extractable text (the PDF may be a scanned image — needs OCR)." };
    return { text, error: null };
  } catch (e) {
    return { text: "", error: e?.message || String(e) };
  }
}

// Ask Anthropic which models this key can use. Returns { ids } or { error }.
async function listAnthropicModels(key) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/models?limit=100", {
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
    });
    if (!res.ok) {
      let body = ""; try { body = await res.text(); } catch {}
      return { error: `models ${res.status}: ${body.slice(0, 160)}` };
    }
    const data = await res.json();
    return { ids: (data?.data || []).map((m) => m.id).filter(Boolean) };
  } catch (e) {
    return { error: e.message };
  }
}

// Call Claude to analyse the CV text against the role.
// Returns { analysis } on success, or { error } with a readable reason.
async function llmAnalyze({ cvText, roleReq, candidateSkills }) {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return { error: "no-key" };
  if (!cvText) return { error: "no-text" };

  // Figure out which models THIS key can use. If a model is pinned via env, use
  // it; otherwise ask Anthropic's /v1/models endpoint and prefer a cheap one.
  let models;
  let availableIds = null;
  if (process.env.CV_ANALYSIS_MODEL) {
    models = [process.env.CV_ANALYSIS_MODEL.trim()];
  } else {
    const list = await listAnthropicModels(key);
    if (list.ids?.length) {
      availableIds = list.ids;
      // Prefer haiku (cheapest), then sonnet, then anything else.
      const pref = (kind) => list.ids.filter((id) => id.toLowerCase().includes(kind));
      models = [...pref("haiku"), ...pref("sonnet"), ...list.ids].filter((m, i, a) => a.indexOf(m) === i);
    } else {
      // Couldn't list models — fall back to dated IDs.
      models = ["claude-3-5-haiku-20241022", "claude-3-haiku-20240307", "claude-3-5-sonnet-20241022"];
    }
  }

  const required = (roleReq?.required_skills || []).join(", ");
  const brief = roleReq?.description ? `\nRole brief:\n${roleReq.description}\n` : "";

  const prompt =
    `You are screening a candidate CV for the role "${roleReq?.title || "the role"}".\n` +
    `Required skills: ${required || "(none specified)"}.` +
    `${brief}\n` +
    `Candidate's self-declared skills: ${(candidateSkills || []).join(", ") || "(none)"}.\n\n` +
    `Here is the text extracted from the candidate's CV:\n"""\n${cvText.slice(0, 12000)}\n"""\n\n` +
    `Assess how well the CV matches the role. Respond with ONLY a JSON object, no prose, of the form:\n` +
    `{"score": <0-100 integer>, "matched": [<skills evidenced in the CV>], "missing": [<required skills not evidenced>], "verdict": "Strong match|Partial match|Weak match", "comment": "<2-4 sentence assessment referencing the CV>"}`;

  let data = null;
  let lastError = "no model available";
  for (const model of models) {
    let res;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({ model, max_tokens: 800, messages: [{ role: "user", content: prompt }] }),
      });
    } catch (e) {
      return { error: `network: ${e.message}` };
    }

    if (res.ok) {
      try { data = await res.json(); } catch (e) { return { error: `bad JSON response: ${e.message}` }; }
      break;
    }

    let body = "";
    try { body = await res.text(); } catch {}
    lastError = `Anthropic ${res.status} (${model}): ${body.slice(0, 200)}`;
    // Only try the next model if THIS model isn't available; otherwise stop.
    const isModelNotFound = res.status === 404 || /not_found_error|model:/i.test(body);
    if (!isModelNotFound) return { error: lastError };
  }
  if (!data) {
    const avail = availableIds ? ` Your key's available models: ${availableIds.slice(0, 8).join(", ") || "none"}.` : "";
    return { error: `${lastError}.${avail} Set CV_ANALYSIS_MODEL to one of them.` };
  }
  const text = (data?.content?.[0]?.text || "").trim();
  if (!text) return { error: "empty model response" };

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) return { error: `model didn't return JSON: ${text.slice(0, 120)}` };
  let parsed;
  try { parsed = JSON.parse(text.slice(start, end + 1)); } catch (e) { return { error: `parse: ${e.message}` }; }

  return {
    analysis: {
      score: typeof parsed.score === "number" ? parsed.score : null,
      matched: Array.isArray(parsed.matched) ? parsed.matched : [],
      missing: Array.isArray(parsed.missing) ? parsed.missing : [],
      verdict: parsed.verdict || "—",
      comment: parsed.comment || "",
      hasRole: true,
      source: "ai",
    },
  };
}

/**
 * Analyse a CV. Tries the LLM read first (when configured + text available),
 * otherwise returns the deterministic skills match. `source` tells the UI
 * which one it got ("ai" vs "rules").
 */
export async function analyzeCv({ cvText, roleReq, candidateSkills, experienceYears }) {
  const llm = await llmAnalyze({ cvText, roleReq, candidateSkills });
  if (llm.analysis) return llm.analysis;
  const rules = computeCvMatch(candidateSkills, roleReq, { experienceYears });
  // Surface why the AI path didn't run (unless it was simply not configured).
  return { ...rules, source: "rules", llmError: llm.error && !["no-key", "no-text"].includes(llm.error) ? llm.error : null };
}
