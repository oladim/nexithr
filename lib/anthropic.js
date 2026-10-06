/**
 * Shared Anthropic (Claude) chat helper — SERVER ONLY.
 *
 * Wraps the Messages API with the same model auto-discovery that the CV
 * analysis proved out: some accounts don't have the `-latest` aliases or the
 * dated IDs enabled, so we ask /v1/models which ones THIS key can use and pick
 * a sensible one (prefer cheaper models for throwaway calls; the caller can
 * pin a model via env).
 *
 * Returns readable { error } strings instead of throwing, so routes can surface
 * the real reason to the UI.
 */

const API = "https://api.anthropic.com/v1";
const VERSION = "2023-06-01";

// True when a key is configured. Used to branch to demo mode.
export function anthropicEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

// Ask which models this key can use. Returns { ids } or { error }.
export async function listAnthropicModels(key) {
  try {
    const res = await fetch(`${API}/models?limit=100`, {
      headers: { "x-api-key": key, "anthropic-version": VERSION },
    });
    if (!res.ok) {
      let body = "";
      try { body = await res.text(); } catch {}
      return { error: `models ${res.status}: ${body.slice(0, 160)}` };
    }
    const data = await res.json();
    return { ids: (data?.data || []).map((m) => m.id).filter(Boolean) };
  } catch (e) {
    return { error: e.message };
  }
}

// Decide the ordered list of models to try for a given env override key.
// `envModel` lets a specific feature pin its own model (e.g. INTERVIEW_MODEL),
// falling back to CV_ANALYSIS_MODEL, then discovery.
async function resolveModels(key, envModel) {
  const pinned = (envModel || process.env.INTERVIEW_MODEL || process.env.ANTHROPIC_MODEL || "").trim();
  if (pinned) return { models: [pinned], availableIds: null };

  const list = await listAnthropicModels(key);
  if (list.ids?.length) {
    const pref = (kind) => list.ids.filter((id) => id.toLowerCase().includes(kind));
    // For an interview we want the strongest reasoning; prefer opus/sonnet,
    // then fall back to whatever's available (incl. haiku).
    const models = [...pref("opus"), ...pref("sonnet"), ...pref("haiku"), ...list.ids].filter(
      (m, i, a) => a.indexOf(m) === i
    );
    return { models, availableIds: list.ids };
  }
  // Couldn't list — last-resort dated IDs.
  return {
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-haiku-20240307"],
    availableIds: null,
  };
}

/**
 * Send a chat completion. Returns { text, model } or { error }.
 *
 * @param {object}   opts
 * @param {string}   opts.system    System prompt.
 * @param {Array}    opts.messages  [{ role:"user"|"assistant", content:string }]
 * @param {number}   opts.maxTokens Max output tokens (default 1024).
 * @param {number}   opts.temperature
 * @param {string}   opts.envModel  Optional env var value to pin a model.
 */
export async function anthropicChat({ system, messages, maxTokens = 1024, temperature = 0.7, envModel } = {}) {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return { error: "no-key" };
  if (!Array.isArray(messages) || messages.length === 0) return { error: "no-messages" };

  const { models, availableIds } = await resolveModels(key, envModel);

  let data = null;
  let usedModel = null;
  let lastError = "no model available";

  // We deliberately do NOT send `temperature`: newer models (Opus 4.8 / 5.x)
  // reject it ("temperature is deprecated for this model"), and the default is
  // fine for an interview. `temperature` is accepted but ignored for
  // backward-compatibility with callers that still pass it.
  void temperature;
  const sendOnce = (model) =>
    fetch(`${API}/messages`, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages,
      }),
    });

  for (const model of models) {
    let res;
    try {
      res = await sendOnce(model);
    } catch (e) {
      return { error: `network: ${e.message}` };
    }

    if (res.ok) {
      try { data = await res.json(); } catch (e) { return { error: `bad JSON response: ${e.message}` }; }
      usedModel = model;
      break;
    }

    let body = "";
    try { body = await res.text(); } catch {}
    lastError = `Anthropic ${res.status} (${model}): ${body.slice(0, 200)}`;
    // Advance to the next model only when THIS model isn't available.
    const isModelNotFound = res.status === 404 || /not_found_error|model:/i.test(body);
    if (!isModelNotFound) return { error: lastError };
  }

  if (!data) {
    const avail = availableIds ? ` Available models: ${availableIds.slice(0, 8).join(", ") || "none"}.` : "";
    return { error: `${lastError}.${avail}` };
  }

  const text = (data?.content || [])
    .filter((b) => b?.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  if (!text) return { error: "empty model response" };
  return { text, model: usedModel };
}
