"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconChevronDown } from "@/components/Icons";

// Collapsible interview guide for the candidate's role-level: questions with
// "what good looks like", the competencies to score and the 1–5 anchors.
export default function InterviewGuide({ candidateId, stage }) {
  const { supabaseEnabled } = useAuth();
  const [d, setD] = useState(null);
  const [open, setOpen] = useState(true);
  const [showAnchors, setShowAnchors] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled || !candidateId) { setD({ demo: true }); return; }
    fetch(`/api/roles/guide?candidateId=${encodeURIComponent(candidateId)}&stage=${stage}`, { cache: "no-store" })
      .then((r) => r.json()).then(setD).catch(() => setD({ error: "Couldn't load the guide." }));
  }, [supabaseEnabled, candidateId, stage]);

  if (!d) return null;
  const g = d.guide;
  return (
    <div className="card pad ig">
      <button type="button" className="ig-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>{stage} interview guide</h3>
          <span>{d.role?.title ? `${d.role.title}${d.role.focus ? " — " + d.role.focus : ""}` : "Questions, what to look for and how to score"}</span>
        </div>
        <IconChevronDown width={18} height={18} className={open ? "up" : ""} />
      </button>
      {open && (
        d.demo ? <p className="ig-muted">The guide for this candidate&apos;s role and level appears here once Supabase is connected.</p>
        : d.error ? <p className="ig-muted">{d.error}</p>
        : !g ? <p className="ig-muted">{d.reason === "no-role" ? "This candidate hasn't chosen a target role." : "No guide has been set up for this role yet. Ask an admin to add one in Role Requirements."}</p>
        : (
          <div className="ig-body">
            <ol className="ig-qs">
              {g.questions.map((q, i) => (
                <li key={i}>
                  <b>{q.q}</b>{q.tag && <span className="ig-tag">{q.tag}</span>}
                  <span className="ig-look"><em>Look for:</em> {q.lookFor}</span>
                </li>
              ))}
            </ol>
            <div className="ig-cols">
              <div>
                <h4>Score these (1–5 each)</h4>
                <ul className="ig-comps">
                  {g.competencies.map((c) => (
                    <li key={c.name}><b>{c.name}{c.weight ? ` · ${c.weight}%` : ""}</b><span>{c.description}</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>How to run it</h4>
                <ul className="ig-notes">{g.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
                <button type="button" className="tb-link" onClick={() => setShowAnchors((s) => !s)}>{showAnchors ? "Hide" : "Show"} rating scale</button>
                {showAnchors && (
                  <ul className="ig-anchors">{g.ratingAnchors.map((a) => <li key={a.score}><b>{a.score} · {a.label}</b> — {a.meaning}</li>)}</ul>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
