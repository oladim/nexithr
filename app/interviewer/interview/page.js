"use client";

import { useState } from "react";
import Link from "next/link";
import { REQUESTS, CANDIDATES } from "@/components/interviewer/data";
import { IconCheck, IconChevronRight } from "@/components/Icons";

export default function InterviewerInterview() {
  const [decided, setDecided] = useState({}); // id -> 'accepted' | 'declined'
  const decide = (id, v) => setDecided((d) => ({ ...d, [id]: v }));

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
                <span className="av" style={{ background: c.color }}>
                  {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
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
