/**
 * Robust JSON extraction from LLM output.
 *
 * Models often wrap JSON in ```json fences, add a sentence before/after it,
 * or emit a second object (e.g. an example) after the real one. Slicing from
 * the first "{" to the last "}" then breaks with errors like
 * "Unexpected non-whitespace character after JSON at position 898".
 *
 * This scans for balanced {...} objects (string- and escape-aware), tries to
 * JSON.parse each candidate, and returns the first one that parses (optionally
 * the first that satisfies `accept`). A light repair pass handles the most
 * common model slips: trailing commas and smart quotes around keys.
 */

function balancedObjects(text) {
  const out = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "{") continue;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let j = i; j < text.length; j++) {
      const ch = text[j];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          out.push(text.slice(i, j + 1));
          i = j; // continue scanning after this object
          break;
        }
      }
    }
    if (out.length >= 12) break;
  }
  return out;
}

function repair(s) {
  return s
    .replace(/[“”]/g, '"')
    .replace(/,\s*([}\]])/g, "$1");
}

function tryParse(s) {
  try { return { value: JSON.parse(s) }; } catch (e) {
    try { return { value: JSON.parse(repair(s)) }; } catch { return { error: e.message }; }
  }
}

/**
 * @param {string} text   raw model output
 * @param {(obj:any)=>boolean} [accept]  optional predicate to pick the right object
 * @returns {{ value:any } | { error:string }}
 */
export function extractJson(text, accept) {
  if (!text || typeof text !== "string") return { error: "empty model response" };
  const ok = (v) => v && typeof v === "object" && !Array.isArray(v) && (!accept || accept(v));

  // 1) Whole text is JSON.
  const whole = tryParse(text.trim());
  if (ok(whole.value)) return { value: whole.value };

  // 2) Fenced blocks, then 3) balanced objects anywhere (inside fences first).
  const sources = [];
  for (const m of text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)) sources.push(m[1]);
  sources.push(text);

  let firstError = whole.error || null;
  for (const src of sources) {
    const t = tryParse(src.trim());
    if (ok(t.value)) return { value: t.value };
    for (const cand of balancedObjects(src)) {
      const r = tryParse(cand);
      if (ok(r.value)) return { value: r.value };
      if (r.error && !firstError) firstError = r.error;
    }
  }

  if (!text.includes("{")) return { error: `model didn't return JSON: ${text.slice(0, 120)}` };
  // An opening brace with no balanced close almost always means truncation.
  if (balancedObjects(text).length === 0) return { error: "model response was cut off before the JSON finished (truncated)" };
  return { error: `parse: ${firstError || "no valid JSON object found"}` };
}

/** Text from an Anthropic Messages response (skips thinking/tool blocks). */
export function messageText(data) {
  return (data?.content || [])
    .filter((b) => b?.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("")
    .trim();
}
