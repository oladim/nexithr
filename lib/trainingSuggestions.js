/**
 * AI-suggested training — up to 6 topics per candidate after their AI
 * interview, each with a link on YouTube, Coursera, Udemy or the web.
 *
 * Links are SEARCH links built here from the topic (not URLs written by the
 * AI), so they always open real, current results instead of a made-up page.
 * Pure helpers — safe in client and server code.
 */
export const MAX_SUGGESTIONS = 6;

export const PLATFORMS = {
  youtube: { label: "YouTube", url: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` },
  coursera: { label: "Coursera", url: (q) => `https://www.coursera.org/search?query=${encodeURIComponent(q)}` },
  udemy: { label: "Udemy", url: (q) => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(q)}` },
  online: { label: "Online", url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
};

const platformKey = (p) => {
  const s = String(p || "").toLowerCase();
  if (s.includes("youtube")) return "youtube";
  if (s.includes("coursera")) return "coursera";
  if (s.includes("udemy")) return "udemy";
  return "online";
};
const clip = (s, n) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);

/**
 * Normalise whatever is stored into [{ topic, platform, platformLabel, url, why }]
 * (max 6). Accepts the current shape ({ items: [...] } or an array) and the
 * older { technical: [...], administrative: [...] } plan.
 */
export function normalizeSuggestions(raw) {
  if (!raw) return [];
  let list = [];
  if (Array.isArray(raw)) list = raw;
  else if (Array.isArray(raw.items)) list = raw.items;
  else list = [...(raw.technical || []), ...(raw.administrative || [])];

  const out = [];
  const seen = new Set();
  for (const it of list) {
    const topic = clip(typeof it === "string" ? it : it?.topic || it?.title, 90);
    if (!topic || seen.has(topic.toLowerCase())) continue;
    seen.add(topic.toLowerCase());
    const platform = platformKey(it?.platform || it?.resource);
    const query = clip(it?.query || topic, 120);
    out.push({
      topic,
      platform,
      platformLabel: PLATFORMS[platform].label,
      url: PLATFORMS[platform].url(query),
      why: clip(it?.why || it?.focus || "", 200),
    });
    if (out.length >= MAX_SUGGESTIONS) break;
  }
  return out;
}

// What we store: { items: [...] } — keeps the column a JSON object.
export function toStored(raw) {
  return { items: normalizeSuggestions(raw).map(({ topic, platform, why, url }) => ({ topic, platform, why, url })) };
}
