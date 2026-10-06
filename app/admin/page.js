"use client";

import { useEffect, useState } from "react";
import { STATS, TREND, ROLE_DIST, STAGE_BARS } from "@/components/admin/data";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadAdminStats, loadAdminCharts } from "@/lib/db";

export default function AdminDashboard() {
  const { supabaseEnabled } = useAuth();
  const [stats, setStats] = useState(STATS);
  const [roleDist, setRoleDist] = useState(ROLE_DIST);
  const [trend, setTrend] = useState(TREND);
  const [trendLabels, setTrendLabels] = useState(null);
  const [stageBars, setStageBars] = useState(STAGE_BARS);
  const maxBar = Math.max(...stageBars.map((b) => b.value), 1);

  // Real mode: replace the KPI cards + distribution donut with live counts.
  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) return;
      const s = await loadAdminStats(sb);
      setStats([
        { value: s.candidates.toLocaleString(), label: "Total Candidates", delta: "" },
        { value: s.interviewers.toLocaleString(), label: "Total Interviewers", delta: "" },
        { value: s.recruiters.toLocaleString(), label: "Total Recruiters", delta: "" },
        { value: s.cvs.toLocaleString(), label: "CVs Received", delta: "" },
      ]);
      const total = s.candidates + s.interviewers + s.recruiters || 1;
      const pct = (n) => Math.round((n / total) * 100);
      setRoleDist([
        { label: "Candidates", color: "#007bff", pct: pct(s.candidates) },
        { label: "Interviewers", color: "#2ecc71", pct: pct(s.interviewers) },
        { label: "Recruiters", color: "#1c1f2a", pct: pct(s.recruiters) },
      ]);
      const charts = await loadAdminCharts(sb);
      if (charts.trend?.length) {
        setTrend(charts.trend);
        setTrendLabels(charts.trendLabels);
      }
      if (charts.pipeline?.length) setStageBars(charts.pipeline);
    })();
  }, [supabaseEnabled]);

  return (
    <>
      <div className="welcome-row">
        <h1>Admin Dashboard</h1>
        <span className="date-pill">Platform overview</span>
      </div>

      <div className="iv-stats iv-stats-4">
        {stats.map((s) => (
          <div className="iv-stat" key={s.label}>
            <p className="v">{s.value}</p>
            <p className="l">{s.label} {s.delta && <span className="stat-delta">{s.delta}</span>}</p>
          </div>
        ))}
      </div>

      <div className="iv-2col" style={{ marginBottom: 24 }}>
        <div className="card pad">
          <h3 className="card-title">Applications trend</h3>
          <LineChart data={trend} />
        </div>
        <div className="card pad">
          <h3 className="card-title">User distribution</h3>
          <div className="chart-row">
            <Donut segments={roleDist} />
            <div className="donut-legend">
              {roleDist.map((s) => (
                <span className="row" key={s.label}><i style={{ background: s.color }} />{s.label} · {s.pct}%</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card pad">
        <h3 className="card-title">Pipeline conversion</h3>
        <div className="bars-chart">
          {stageBars.map((b) => (
            <div className="col" key={b.label}>
              <div className="bar" style={{ height: `${(b.value / maxBar) * 100}%` }} />
              <small>{b.label}</small>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function LineChart({ data }) {
  const w = 520, h = 160, pad = 8;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    return [x, y];
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;
  return (
    <svg className="line-chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path className="area" d={area} />
      <path className="line" d={line} />
    </svg>
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
