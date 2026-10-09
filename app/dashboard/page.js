"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadApprovedJobs } from "@/lib/db";
import {
  IconSearch,
  IconCalendar,
  IconCheck,
  IconClock,
  IconUploadCloud,
  IconCode,
  IconChart,
  IconChevronRight,
} from "@/components/Icons";

const JOBS = [
  { title: "UX Designer", meta: "Full-time · Remote · 1 week ago", Icon: IconChart },
  { title: "Frontend Developer", meta: "Full-time · Hybrid · 3 days ago", Icon: IconCode },
];

// "3 days ago" style label for a posting date.
function timeAgo(iso) {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "today";
  if (d === 1) return "1 day ago";
  if (d < 7) return `${d} days ago`;
  const w = Math.floor(d / 7);
  return w === 1 ? "1 week ago" : w < 5 ? `${w} weeks ago` : new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Palette used to colour the competency ring/legend.
const SKILL_COLORS = ["#007bff", "#2ecc71", "#1c1f2a", "#ffab00", "#8b5cf6", "#ef4444"];

// Build competency segments from the AI interview breakdown
// ({ Technical: 70, ... }). Returns [{ label, pct, color }] with the real
// scores; the ring normalises these internally so it always renders full.
function skillSegments(breakdown) {
  if (!breakdown || typeof breakdown !== "object") return [];
  return Object.entries(breakdown)
    .filter(([, v]) => typeof v === "number")
    .map(([label, pct], i) => ({ label, pct, color: SKILL_COLORS[i % SKILL_COLORS.length] }));
}

export default function DashboardHome() {
  const { user, app, supabaseEnabled } = useAuth();
  const firstName = (user?.name || "there").split(" ")[0];
  const hasCv = !!app.cv;
  const [jobs, setJobs] = useState(supabaseEnabled ? null : JOBS); // null = loading (real mode)

  // Real mode: live token balance + open jobs from the database.
  const tokenValue = app.tokens ?? 0;

  // ---- Derived assessment stats (real data, no mocks) ----
  const ai = app.aiInterview || {};
  const aiReleased = ai.status ? ai.status === "released" : true;
  const aiScore = aiReleased && typeof ai.lastScore === "number" ? ai.lastScore : null;
  const profAvg = app.stages?.Professional?.result?.avg;
  const hrAvg = app.stages?.HR?.result?.avg;

  const segments = aiReleased ? skillSegments(ai.breakdown) : [];
  const topSkill = segments.length
    ? segments.reduce((a, b) => (b.pct > a.pct ? b : a))
    : null;

  // Average across whatever assessments have a score so far.
  const scoreList = [aiScore, numOrNull(profAvg), numOrNull(hrAvg)].filter((v) => v != null);
  const avgScore = scoreList.length ? Math.round(scoreList.reduce((a, b) => a + b, 0) / scoreList.length) : null;

  // Assessment bars: the three pipeline stages (real scores, 0 until taken).
  const assessmentBars = [
    { label: "AI", value: aiScore },
    { label: "Prof", value: numOrNull(profAvg) },
    { label: "HR", value: numOrNull(hrAvg) },
  ];

  // Days in the current month that have a scheduled interview (calendar marks).
  const markedDays = (() => {
    const now = new Date();
    const set = new Set();
    (app.interviews || []).forEach((iv) => {
      if (!iv.date) return;
      const d = new Date(iv.date);
      if (!isNaN(d) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) set.add(d.getDate());
    });
    return set;
  })();
  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) { setJobs([]); return; }
      try {
        // Only jobs an admin has approved are shown to candidates.
        const rows = await loadApprovedJobs(sb);
        setJobs(
          rows.slice(0, 4).map((j) => ({
            id: j.id,
            title: j.title,
            meta: [j.company, j.type, j.location, timeAgo(j.posted_at)].filter(Boolean).join(" · "),
            Icon: /design|ux|ui/i.test(j.title) ? IconChart : IconCode,
          }))
        );
      } catch { setJobs([]); }
    })();
  }, [supabaseEnabled]);
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div className="welcome-row">
        <h1>Welcome back, {firstName}! 👋</h1>
        <div className="tools">
          <button type="button" className="search-box search-trigger" onClick={() => window.dispatchEvent(new Event("nexit:open-search"))} aria-label="Search pages">
            <IconSearch width={18} height={18} />
            <span>Search pages…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <span className="date-pill">
            <IconCalendar width={16} height={16} /> {dateStr}
          </span>
        </div>
      </div>

      {/* Certificate — unlocked once every stage is passed */}
      {app.aiInterview?.passed && app.stages?.Professional?.passed && app.stages?.HR?.passed && (
        <div className="card pad" style={{ marginBottom: 18, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, background: "linear-gradient(120deg,#070a14,#12204a)", color: "#fff", border: 0 }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".16em", color: "#8fbcff" }}>N|VP · NEXIT VERIFIED PROFESSIONAL</div>
            <h3 style={{ margin: "6px 0 4px", fontSize: 19, color: "#fff" }}>Congratulations — your certificate is ready</h3>
            <p style={{ margin: 0, fontSize: 14, color: "#c5cee2" }}>You&apos;ve passed all three stages. Print your certificate and add N|VP to your title.</p>
          </div>
          <Link href="/dashboard/certificate" className="btn-solid">View &amp; print certificate</Link>
        </div>
      )}

      {/* CV status / upload prompt */}
      <div className="cv-banner">
        {hasCv ? (
          <>
            <span className="chip ok">
              <IconCheck /> Registration completed &amp; CV uploaded
            </span>
            <span className="chip wait">
              <IconClock /> {app.cv.status || "Waiting for approval"}
            </span>
          </>
        ) : (
          <span className="chip wait">
            <IconClock /> No CV uploaded yet — add one to start your AI interview
          </span>
        )}
        <span className="grow" />
        <Link href="/dashboard/cv-upload" className="btn-sm">
          <IconUploadCloud /> {hasCv ? "Upload New CV" : "Upload CV"}
        </Link>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card a">
          <p className="lbl">Total Assessment Token</p>
          <p className="val">{tokenValue}</p>
        </div>
        <div className="stat-card b">
          <p className="lbl">Average Score</p>
          <p className="val">{avgScore != null ? `${avgScore}%` : "—"}</p>
        </div>
        <div className="stat-card c">
          <p className="lbl">Top Skill</p>
          <p className="val">{topSkill ? `${topSkill.pct}%` : "—"}</p>
        </div>
      </div>

      <div className="dash-grid">
        <div>
          <div className="two-col" style={{ marginBottom: 24 }}>
            {/* Skill radar (donut) */}
            <div className="card pad">
              <h3 className="card-title">Skill Master Radar</h3>
              {segments.length ? (
                <div className="chart-row">
                  <Donut segments={segments} center={topSkill} />
                  <div className="donut-legend">
                    {segments.map((s) => (
                      <span className="row" key={s.label}>
                        <i style={{ background: s.color }} />
                        {s.label} · {s.pct}%
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-cta">
                  <p>Your competency breakdown appears here after your AI interview.</p>
                  <Link href={hasCv ? "/dashboard/interview/ai" : "/dashboard/cv-upload"} className="btn-outline">
                    {hasCv ? "Take the AI interview" : "Upload your CV to begin"}
                  </Link>
                </div>
              )}
            </div>

            {/* Assessment scores (bars) */}
            <div className="card pad">
              <h3 className="card-title">Assessment Scores</h3>
              <div className="score-rows">
                {assessmentBars.map((b, i) => {
                  const full = { AI: "AI interview", Prof: "Professional interview", HR: "HR interview" }[b.label] || b.label;
                  const has = b.value != null;
                  return (
                    <div className="score-row" key={i}>
                      <div className="sr-top">
                        <span>{full}</span>
                        <b className={has ? "" : "muted"}>{has ? `${b.value}%` : "Not taken yet"}</b>
                      </div>
                      <div className="sr-track" role="progressbar" aria-label={full} aria-valuemin={0} aria-valuemax={100} aria-valuenow={has ? b.value : 0}>
                        <i style={{ width: `${has ? Math.max(2, b.value) : 0}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 12, color: "var(--gray-500)", margin: "10px 0 0" }}>
                AI diagnostic, Professional and HR interview scores.
              </p>
            </div>
          </div>

          {/* Jobs */}
          <div className="card pad">
            <div className="jobs-head">
              <h3 className="card-title" style={{ marginBottom: 0 }}>
                Available Job Opportunities
              </h3>
              <Link href="/dashboard/jobs" className="link">See all</Link>
            </div>
            {jobs === null ? (
              <p className="tb-empty" style={{ textAlign: "left", padding: "14px 0" }}>Loading open positions…</p>
            ) : jobs.length === 0 ? (
              <div className="empty-cta" style={{ padding: "6px 0 4px" }}>
                <p>No open positions right now. New roles from our hiring partners appear here as soon as they&apos;re approved.</p>
              </div>
            ) : jobs.map(({ title, meta, Icon }) => (
              <div className="job-row" key={title}>
                <span className="jico">
                  <Icon width={22} height={22} />
                </span>
                <div className="jinfo">
                  <h4>{title}</h4>
                  <p>{meta}</p>
                </div>
                <Link href="/dashboard/jobs" className="apply">View</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card pad">
            <MiniCalendar marked={markedDays} />
          </div>

          <div className="card pad">
            <h3 className="card-title">Schedule an interview</h3>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--gray-500)", lineHeight: 1.5 }}>
              Book your AI, Professional, or HR interview at a time that works
              for you.
            </p>
            <Link
              href="/dashboard/interview"
              className="btn-solid"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Go to scheduling <IconChevronRight width={16} height={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

const numOrNull = (v) => { const n = Number(v); return Number.isFinite(n) && v != null && v !== "" ? Math.round(n) : null; };

/* Inline SVG-free donut using a conic-gradient ring (renders everywhere).
   Segments carry real competency scores; we normalise them so the ring always
   renders full, while the legend/centre show the true values. */
function Donut({ segments, center }) {
  const total = segments.reduce((a, s) => a + (s.pct || 0), 0) || 1;
  let acc = 0;
  const stops = segments
    .map((s) => {
      const from = acc;
      acc += ((s.pct || 0) / total) * 100;
      return `${s.color} ${from}% ${acc}%`;
    })
    .join(", ");
  return (
    <div
      className="donut-ring"
      style={{
        width: 132,
        height: 132,
        borderRadius: "50%",
        background: `conic-gradient(${stops})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: "50%",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <strong style={{ fontSize: 22, color: "var(--navy)" }}>{center ? `${center.pct}%` : "—"}</strong>
        <span style={{ fontSize: 11, color: "var(--gray-500)" }}>{center ? center.label : "Top skill"}</span>
      </div>
    </div>
  );
}

/* Simple current-month calendar. */
function MiniCalendar({ marked }) {
  const has = marked instanceof Set ? marked : new Set();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7; // Mon-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="cal">
      <div className="cal-head">
        <b>{monthName}</b>
        <span className="nav">
          <IconChevronRight width={16} height={16} style={{ transform: "rotate(180deg)" }} />
          <IconChevronRight width={16} height={16} />
        </span>
      </div>
      <div className="cal-grid">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <span className="dow" key={d}>
            {d}
          </span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={`day ${d === null ? "muted" : ""} ${
              d === now.getDate() ? "today" : ""
            } ${d && has.has(d) ? "has" : ""}`}
          >
            {d || ""}
          </span>
        ))}
      </div>
    </div>
  );
}
