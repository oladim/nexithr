"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";

// The candidate's training standing: roll-up stats + per-course progress and
// status. Real-mode only; falls back to a friendly note in demo mode.
export default function TrainingStanding() {
  const { supabaseEnabled } = useAuth();
  const [data, setData] = useState(null); // { courses, stats }
  const [loading, setLoading] = useState(supabaseEnabled);

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      try { const r = await fetch("/api/training/standing"); const d = await r.json(); if (r.ok) setData(d); }
      catch { /* ignore */ }
      setLoading(false);
    })();
  }, [supabaseEnabled]);

  if (!supabaseEnabled) {
    return (
      <div className="card pad" style={{ marginTop: 18 }}>
        <h3 className="card-title" style={{ marginTop: 0 }}>Your training standing</h3>
        <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>Enrol in a role-specific programme to track your courses, progress and results here.</p>
      </div>
    );
  }

  if (loading) return <div className="card pad" style={{ marginTop: 18 }}><p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>Loading your training standing…</p></div>;

  const courses = data?.courses || [];
  const s = data?.stats || {};

  if (courses.length === 0) {
    return (
      <div className="card pad" style={{ marginTop: 18 }}>
        <h3 className="card-title" style={{ marginTop: 0 }}>Your training standing</h3>
        <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
          You&apos;re not enrolled in any specific courses yet. Once you enrol, your courses, progress and results appear here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 18 }}>
      <h3 className="card-title">Your training standing</h3>

      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card a"><p className="lbl">Courses enrolled</p><p className="val">{s.totalCourses ?? courses.length}</p></div>
        <div className="stat-card b"><p className="lbl">Completed</p><p className="val">{s.completedCourses ?? 0}</p></div>
        <div className="stat-card c"><p className="lbl">Remaining</p><p className="val">{s.remainingCourses ?? 0}</p></div>
        <div className="stat-card a"><p className="lbl">Average result</p><p className="val">{s.avgScore != null ? `${s.avgScore}%` : "—"}</p></div>
      </div>

      <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {courses.map((c) => (
          <div key={c.id} style={{ borderBottom: "1px solid #eef1f6", paddingBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ minWidth: 0 }}>
                <b style={{ fontSize: 14 }}>{c.title}</b>
                {c.level && <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 8, textTransform: "capitalize" }}>{c.level}</span>}
              </div>
              <StatusBadge status={c.status} label={c.statusLabel} score={c.overallScore} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <div style={{ flex: 1, height: 8, borderRadius: 999, background: "#eef1f6", overflow: "hidden" }}>
                <div style={{ width: `${c.pct}%`, height: "100%", borderRadius: 999, background: barColor(c.status) }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                {c.gradable > 0 ? `${c.completed}/${c.gradable} tasks` : "Self-paced"}
              </span>
              <Link href={`/dashboard/training/course/${c.id}`} className="link" style={{ fontSize: 13, whiteSpace: "nowrap" }}>Open →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function barColor(status) {
  if (status === "released") return "#2ecc71";
  if (status === "completed") return "#007bff";
  if (status === "in_progress") return "#ffab00";
  return "#cbd5e1";
}

function StatusBadge({ status, label, score }) {
  const styles = {
    released: { bg: "rgba(46,204,113,.12)", color: "#1b8f4d" },
    completed: { bg: "rgba(0,123,255,.12)", color: "#0b5ed7" },
    in_progress: { bg: "rgba(255,171,0,.14)", color: "#9a6b00" },
    not_started: { bg: "#f1f5f9", color: "#64748b" },
  }[status] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: styles.bg, color: styles.color, whiteSpace: "nowrap" }}>
      {status === "released" && score != null ? `Result: ${score}%` : label}
    </span>
  );
}
