"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconCheck } from "@/components/Icons";

// Shown to a candidate when the CV review suggests a lower level of their
// role. Accept → their target role changes and the CV is approved at that
// level. Keep → the review goes back to the NexIT team.
export default function LevelSuggestion({ onResolved }) {
  const { supabaseEnabled } = useAuth();
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!supabaseEnabled) return;
    fetch("/api/cv/level", { cache: "no-store" }).then((r) => r.json()).then((d) => setS(d.suggestion || null)).catch(() => {});
  }, [supabaseEnabled]);

  if (done) {
    return (
      <div className="lvl-sug" role="status">
        <h3>{done.accepted ? `You're now applying as ${done.title}` : "Thanks — we'll review your CV again"}</h3>
        <p className="lvl-sub" style={{ margin: 0 }}>
          {done.accepted ? "Your CV is approved at this level and your AI interview is unlocked." : "Our team will look at your CV for the level you chose and let you know the outcome."}
        </p>
      </div>
    );
  }
  if (!s?.to) return null;

  const respond = async (accept) => {
    if (accept === false && !confirm(`Keep ${s.from?.title || "your current level"}? Our team will review your CV again for that level — it may be approved, or you may be asked for changes.`)) return;
    setErr(""); setBusy(accept ? "accept" : "keep");
    try {
      const r = await fetch("/api/cv/level", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accept }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Something went wrong");
      setDone({ accepted: d.accepted, title: d.title || s.to.title });
      onResolved?.(d);
      if (d.accepted) setTimeout(() => window.location.reload(), 1600); // refresh role everywhere
    } catch (e) { setErr(e.message); }
    setBusy("");
  };

  return (
    <div className="lvl-sug" role="region" aria-label="Level suggestion">
      <h3>We suggest a better starting level</h3>
      <p className="lvl-sub">Your CV was reviewed against the level you chose. Here&apos;s what our reviewer recommends:</p>
      <div className="lvl-cmp">
        <div className="lvl-box"><small>You applied for</small><b>{s.from?.title || "—"}</b>{s.from?.focus && <span>{s.from.focus}</span>}</div>
        <div className="lvl-arrow" aria-hidden="true">→</div>
        <div className="lvl-box to"><small>Suggested</small><b>{s.to.title}</b>{s.to.focus && <span>{s.to.focus}</span>}</div>
      </div>
      {s.note && <div className="lvl-note">{s.note}</div>}
      {err && <div className="auth-error" style={{ marginBottom: 10 }}>{err}</div>}
      <div className="lvl-btns">
        <button className="btn-solid" disabled={!!busy} onClick={() => respond(true)}>
          <IconCheck width={15} height={15} /> {busy === "accept" ? "Updating…" : `Accept ${s.to.title}`}
        </button>
        <button className="btn-outline" disabled={!!busy} onClick={() => respond(false)}>{busy === "keep" ? "Sending…" : "Keep my level"}</button>
      </div>
    </div>
  );
}
