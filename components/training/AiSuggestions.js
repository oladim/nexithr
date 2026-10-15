"use client";

import { normalizeSuggestions, MAX_SUGGESTIONS } from "@/lib/trainingSuggestions";

const ICON = { youtube: "▶", coursera: "C", udemy: "U", online: "↗" };

// Up to 6 AI-suggested training topics, each with a link to learn it on
// YouTube, Coursera, Udemy or the web.
export default function AiSuggestions({ raw, title = "Suggested training from your AI interview", lead, compact = false }) {
  const items = normalizeSuggestions(raw);
  if (!items.length) return null;
  return (
    <section className={`ai-sug ${compact ? "compact" : ""}`} aria-label={title}>
      <h3>{title}</h3>
      <p className="ai-sug-lead">
        {lead || `Based on the gaps in your interview, here ${items.length === 1 ? "is a topic" : `are ${items.length} topics`} to study (up to ${MAX_SUGGESTIONS}). Each link opens matching courses or videos.`}
      </p>
      <ol className="ai-sug-list">
        {items.map((it, i) => (
          <li key={i} className="ai-sug-item">
            <span className={`ai-sug-ic ${it.platform}`} aria-hidden="true">{ICON[it.platform]}</span>
            <div className="ai-sug-main">
              <b>{it.topic}</b>
              {it.why && <span>{it.why}</span>}
            </div>
            <a className="ai-sug-link" href={it.url} target="_blank" rel="noopener noreferrer">
              {it.platform === "online" ? "Find online" : `Open on ${it.platformLabel}`} →
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
