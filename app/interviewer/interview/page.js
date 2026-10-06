"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadInterviewerDashboard } from "@/lib/db";
import { REQUESTS, CANDIDATES } from "@/components/interviewer/data";
import { IconChevronRight, IconVideo } from "@/components/Icons";

export default function InterviewerInterview() {
  const { supabaseEnabled } = useAuth();
  const [data, setData] = useState(null); // { scheduled, feedback } (real) | null
  const [decided, setDecided] = useState({});
  const decide = (id, v) => setDecided((d) => ({ ...d, [id]: v }));

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) return;
      try {
        const { data: { user } } = await sb.auth.getUser();
        if (user) setData(await loadInterviewerDashboard(sb, user.id));
      } catch { setData({ scheduled: [], feedback: [] }); }
    })();
  }, [supabaseEnabled]);

  // ---------- REAL MODE ----------
  if (supabaseEnabled) {
    const upcoming = (data?.scheduled || []).filter((s) => s.status !== "Reviewed");
    const feedback = data?.feedback || [];
    return (
      <>
        <div className="page-head">
          <h1>Interview</h1>
          <p>Your scheduled interviews. Conduct each on Google Meet, then submit your verdict to set the candidate&apos;s result.</p>
        </div>

        <div className="iv-2col">
          <div className="card pad">
            <h3 className="card-title">Upcoming interviews</h3>
            {data === null ? (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>
            ) : upcoming.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>No upcoming interviews booked with you right now.</p>
            ) : (
              <div className="feedback-list">
                {upcoming.map((s) => (
                  <div className="fb-row" key={s.id}>
                    <div className="info">
                      <h5>{s.name}</h5>
                      <p>{s.role} · {s.date}{s.time ? `, ${s.time}` : ""}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {s.meetLink && (
                        <a href={s.meetLink} target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: "7px 12px" }}>
                          <IconVideo width={14} height={14} /> Join
                        </a>
                      )}
                      <Link href={`/interviewer/candidate/${s.candidateId || s.id}`} className="act">
                        Grade <IconChevronRight width={14} height={14} style={{ display: "inline", verticalAlign: "-2px" }} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card pad">
            <h3 className="card-title">Candidates &amp; feedback</h3>
            {feedback.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>Candidates you&apos;re assigned to will appear here.</p>
            ) : (
              <div className="feedback-list">
                {feedback.map((c) => (
                  <div className="fb-row" key={c.id}>
                    <span className="av" style={{ background: c.color }}>{c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                    <div className="info">
                      <h5>{c.name}</h5>
                      <p>{c.role} · {c.reviewed ? "Reviewed" : "Awaiting your verdict"}</p>
                    </div>
                    <Link href={`/interviewer/candidate/${c.id}`} className="act">
                      {c.reviewed ? "View" : "Grade"} <IconChevronRight width={14} height={14} style={{ display: "inline", verticalAlign: "-2px" }} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ---------- DEMO MODE (illustrative) ----------
  return (
    <>
      <div className="page-head">
        <h1>Interview</h1>
        <p>Review interview requests, respond, and leave feedback for candidates you interviewed.</p>
      </div>

      <div className="pay-banner">
        <span className="ci">$</span>
        <span className="amt">50 <small>Per interview</small></span>
        <div className="acts">
          <button className="btn-accept">Accept</button>
          <button className="btn-decline">Decline</button>
        </div>
      </div>

      <div className="iv-2col">
        <div className="card pad">
          <h3 className="card-title">Candidate Waiting-List</h3>
          {REQUESTS.map((r) => {
            const state = decided[r.id];
            return (
              <div className="wait-row" key={r.id}>
                <div>
                  <div className="nm">{r.name}</div>
                  <div className="rl">{r.role} · {r.date}</div>
                </div>
                <div>${r.fee}</div>
                {state ? (
                  <div className={state === "accepted" ? "wa-accept" : "wa-decline"} style={{ gridColumn: "span 2", textAlign: "right" }}>
                    {state === "accepted" ? "Accepted" : "Declined"}
                  </div>
                ) : (
                  <div className="wact" style={{ gridColumn: "span 2", justifyContent: "flex-end" }}>
                    <button className="wa-accept" onClick={() => decide(r.id, "accepted")}>Accept</button>
                    <button className="wa-decline" onClick={() => decide(r.id, "declined")}>Decline</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="card pad">
          <h3 className="card-title">Leave / view feedback</h3>
          <div className="feedback-list">
            {CANDIDATES.map((c) => (
              <div className="fb-row" key={c.id}>
                <span className="av" style={{ background: c.color }}>{c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                <div className="info">
                  <h5>{c.name}</h5>
                  <p>{c.role} · {c.status}</p>
                </div>
                <Link href={`/interviewer/candidate/${c.id}`} className="act">
                  {c.status === "Reviewed" ? "View" : "Add notes"} <IconChevronRight width={14} height={14} style={{ display: "inline", verticalAlign: "-2px" }} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
