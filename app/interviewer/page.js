"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import {
  STATS,
  CONDUCTED,
  MONTHS,
  OUTCOMES,
  CANDIDATES,
  PAYMENTS,
} from "@/components/interviewer/data";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadInterviewerDashboard } from "@/lib/db";
import { IconChevronRight } from "@/components/Icons";

// Demo fallbacks mapped to the same shapes the live loader returns.
const DEMO_SCHEDULED = CANDIDATES.map((c) => ({ id: c.id, name: c.name, role: c.role, date: c.date, status: c.status === "Reviewed" ? "Reviewed" : "Upcoming" }));
const DEMO_FEEDBACK = CANDIDATES.map((c) => ({ id: c.id, name: c.name, role: c.role, color: c.color, reviewed: c.status === "Reviewed" }));
const DEMO_PAYMENTS = PAYMENTS.map((p) => ({ candidate: p.candidate, date: p.date, position: p.position, status: p.status, amount: p.amount }));

export default function InterviewerDashboard() {
  const { user, interviewerKind, supabaseEnabled } = useAuth();
  const max = Math.max(...CONDUCTED);

  const [stats, setStats] = useState(STATS);
  const [outcomes, setOutcomes] = useState(OUTCOMES);
  const [scheduled, setScheduled] = useState(DEMO_SCHEDULED);
  const [feedback, setFeedback] = useState(DEMO_FEEDBACK);
  const [payments, setPayments] = useState(DEMO_PAYMENTS);

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) return;
      const { data } = await sb.auth.getUser();
      if (!data?.user) return;
      const d = await loadInterviewerDashboard(sb, data.user.id);
      setStats(d.stats);
      if (d.outcomes.some((o) => o.pct > 0)) setOutcomes(d.outcomes);
      setScheduled(d.scheduled);
      setFeedback(d.feedback);
      setPayments(d.payments);
    })();
  }, [supabaseEnabled]);

  return (
    <>
      <div className="welcome-row">
        <h1>Welcome, {user.name}</h1>
        <span className="date-pill">{interviewerKind} Interviewer</span>
      </div>

      <div className="iv-stats">
        {stats.map((s) => (
          <div className="iv-stat" key={s.label}>
            <p className="v">{s.value}</p>
            <p className="l">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="iv-2col" style={{ marginBottom: 24 }}>
        <div className="card pad">
          <h3 className="card-title">Interviews Conducted</h3>
          <div className="bars-chart">
            {CONDUCTED.map((v, i) => (
              <div className="col" key={i}>
                <div className="bar" style={{ height: `${(v / max) * 100}%` }} />
                <small>{MONTHS[i]}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="card pad">
          <h3 className="card-title">Feedback Outcomes</h3>
          <div className="chart-row">
            <Donut segments={outcomes} />
            <div className="donut-legend">
              {outcomes.map((s) => (
                <span className="row" key={s.label}>
                  <i style={{ background: s.color }} />
                  {s.label} · {s.pct}%
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="iv-2col" style={{ marginBottom: 24 }}>
        <div className="card pad">
          <div className="jobs-head" style={{ marginBottom: 12 }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>Scheduled Interviews</h3>
            <Link href="/interviewer/interview" className="link" style={{ fontSize: 13 }}>Schedule New</Link>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Candidate</th><th>Role</th><th>Date</th><th>Meet</th><th>Status</th></tr>
            </thead>
            <tbody>
              {scheduled.length === 0 ? (
                <tr><td colSpan={5} style={{ color: "var(--muted)", fontSize: 13 }}>No interviews assigned yet.</td></tr>
              ) : scheduled.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.role}</td>
                  <td>{c.date}{c.time ? <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.time}</div> : null}</td>
                  <td>{c.meetLink ? <a href={c.meetLink} target="_blank" rel="noreferrer" className="link" style={{ fontSize: 13 }}>Join</a> : "—"}</td>
                  <td>
                    <span className={`pill-status ${c.status === "Reviewed" ? "done" : "pending"}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card pad">
          <h3 className="card-title">Candidate Feedback</h3>
          <div className="feedback-list">
            {feedback.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13 }}>No candidates to review yet.</p>
            ) : feedback.map((c, i) => (
              <div className="fb-row" key={`${c.id}-${i}`}>
                <span className="av" style={{ background: c.color }}>
                  {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <div className="info">
                  <h5>{c.name}</h5>
                  <p>{c.role}</p>
                </div>
                <Link href={`/interviewer/candidate/${c.id}`} className="act">
                  {c.reviewed ? "View Feedback" : "Add Feedback"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card pad">
        <h3 className="card-title">Payments</h3>
        <table className="tbl">
          <thead>
            <tr><th>Candidate</th><th>Date</th><th>Position</th><th>Status</th><th>Amount</th><th>Action</th></tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={6} style={{ color: "var(--muted)", fontSize: 13 }}>No payments yet.</td></tr>
            ) : payments.map((p, i) => (
              <tr key={i}>
                <td>{p.candidate}</td>
                <td>{p.date}</td>
                <td>{p.position}</td>
                <td><span className={`pill-status ${p.status.toLowerCase()}`}>{p.status}</span></td>
                <td>{p.amount}</td>
                <td><Link href="/interviewer/earnings" className="mini-btn">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Donut({ segments }) {
  let acc = 0;
  const stops = segments.map((s) => { const from = acc; acc += s.pct; return `${s.color} ${from}% ${acc}%`; }).join(", ");
  return (
    <div className="donut-ring" style={{ width: 132, height: 132, borderRadius: "50%", background: `conic-gradient(${stops})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{ width: 82, height: 82, borderRadius: "50%", background: "#fff" }} />
    </div>
  );
}
