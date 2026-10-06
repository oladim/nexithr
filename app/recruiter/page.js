"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadBoardCandidates, mapBoardCandidate, loadMyJobs, loadHireRequests } from "@/lib/db";
import { STATS, CANDIDATES, REVIEW } from "@/components/recruiter/data";
import BoardCard from "@/components/recruiter/BoardCard";

export default function RecruiterDashboard() {
  const { supabaseEnabled } = useAuth();
  const [loading, setLoading] = useState(supabaseEnabled);
  const [board, setBoard] = useState(supabaseEnabled ? [] : CANDIDATES);
  const [stats, setStats] = useState(supabaseEnabled ? null : STATS);
  const [requests, setRequests] = useState(supabaseEnabled ? [] : null);

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) { setLoading(false); return; }
      try {
        const { data: { user } } = await sb.auth.getUser();
        const [boardRows, myJobs, hires] = await Promise.all([
          loadBoardCandidates(sb),
          user ? loadMyJobs(sb, user.id) : Promise.resolve([]),
          loadHireRequests(sb),
        ]);
        setBoard(boardRows.map(mapBoardCandidate));
        setRequests(hires);
        setStats([
          { label: "Candidates on board", value: String(boardRows.length) },
          { label: "Your live jobs", value: String(myJobs.filter((j) => j.status === "approved").length) },
          { label: "Your hire requests", value: String(hires.length) },
        ]);
      } catch { /* leave fallbacks */ }
      setLoading(false);
    })();
  }, [supabaseEnabled]);

  const statCards = stats || [];

  return (
    <>
      <div className="welcome-row">
        <h1>Dashboard</h1>
        <span className="date-pill">Recruiter</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {loading && !stats
          ? [0, 1, 2].map((i) => <div className="iv-stat" key={i}><p className="v">—</p><p className="l">Loading…</p></div>)
          : statCards.map((s) => (
              <div className="iv-stat" key={s.label}>
                <p className="v">{s.value}</p>
                <p className="l">{s.label}</p>
              </div>
            ))}
      </div>

      <div className="jobs-head" style={{ marginBottom: 16 }}>
        <h3 className="card-title" style={{ marginBottom: 0 }}>Top candidates on the board</h3>
        <Link href="/recruiter/candidates" className="link" style={{ fontSize: 13 }}>See all</Link>
      </div>
      {board.length === 0 ? (
        <div className="card pad" style={{ marginBottom: 24 }}>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            No board-ready candidates yet. Candidates appear here once they&apos;ve passed the AI, Professional and HR interviews.
          </p>
        </div>
      ) : (
        <div className="board-grid" style={{ marginBottom: 24 }}>
          {board.slice(0, 3).map((c) => <BoardCard key={c.id} c={c} />)}
        </div>
      )}

      <div className="card pad">
        <h3 className="card-title">Your hire requests</h3>
        {requests === null ? (
          // Demo mode: illustrative review table.
          <table className="tbl">
            <thead><tr><th>Name</th><th>Tech Niche</th><th>Position</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {REVIEW.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td><td>{r.niche}</td><td>{r.position}</td><td>{r.time}</td>
                  <td><span className={`pill-status ${r.status === "Recommended" ? "done" : "pending"}`}>{r.status}</span></td>
                  <td><Link href="/recruiter/candidates" className="mini-btn">View Profile</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : requests.length === 0 ? (
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            You haven&apos;t requested to hire anyone yet. Browse the <Link href="/recruiter/candidates" className="link">candidate board</Link> and send a hire request.
          </p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Candidate</th><th>Position</th><th>Requested</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.candidate?.profiles?.full_name || "Candidate"}</td>
                  <td>{r.position || "—"}</td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</td>
                  <td><span className={`pill-status ${r.status === "accepted" || r.status === "approved" ? "done" : "pending"}`}>{r.status}</span></td>
                  <td><Link href="/recruiter/candidates" className="mini-btn">View board</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
