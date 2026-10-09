"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { startPayment, formatMoney } from "@/lib/billing";
import TrainingTabs from "@/components/dashboard/TrainingTabs";
import { IconCap, IconBook, IconCheck, IconClock, IconChart, IconPencil, IconStar, IconChevronRight, IconPlay, IconFileText } from "@/components/Icons";

// Sample data so the dashboard is complete in demo mode (no backend).
const DEMO = {
  access: { subscribed: true, subscriptionUntil: new Date(Date.now() + 200 * 86400000).toISOString(), trainingRoles: ["software"] },
  stats: { totalCourses: 3, completedCourses: 1, inProgressCourses: 1, notStartedCourses: 1, releasedCourses: 1, avgScore: 82, tasksTotal: 11, tasksDone: 6, awaitingGrading: 1, overallPct: 55 },
  next: { courseId: "d2", course: "Production Engineering Intensive", pct: 40, task: { id: "m5", title: "Design a rate-limited API", type: "assignment" } },
  courses: [
    { id: "d1", title: "Backend Foundations", level: "foundational", duration: "4 weeks", gradable: 4, completed: 4, pct: 100, status: "released", statusLabel: "Results released", overallScore: 82 },
    { id: "d2", title: "Production Engineering Intensive", level: "intensive", duration: "8 weeks", gradable: 5, completed: 2, pct: 40, status: "in_progress", statusLabel: "In progress", overallScore: null },
    { id: "d3", title: "Cloud Deployment Essentials", level: "foundational", duration: "3 weeks", gradable: 2, completed: 0, pct: 0, status: "not_started", statusLabel: "Not started", overallScore: null },
  ],
  todo: [
    { moduleId: "m5", courseId: "d2", course: "Production Engineering Intensive", title: "Design a rate-limited API", type: "assignment", maxScore: 20 },
    { moduleId: "m6", courseId: "d2", course: "Production Engineering Intensive", title: "CI/CD pipeline quiz", type: "quiz", maxScore: 10 },
    { moduleId: "m9", courseId: "d3", course: "Cloud Deployment Essentials", title: "Deploy a container", type: "test", maxScore: 30 },
  ],
  recent: [
    { moduleId: "m4", course: "Production Engineering Intensive", title: "Observability quiz", type: "quiz", score: 8, maxScore: 10, at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { moduleId: "m2", course: "Backend Foundations", title: "Build a REST API", type: "assignment", score: 17, maxScore: 20, at: new Date(Date.now() - 9 * 86400000).toISOString() },
  ],
};

const TYPE = { assignment: "Assignment", test: "Test", quiz: "Quiz" };
const STATUS_COLOR = { released: "#14803c", completed: "#2f9e5b", in_progress: "#0a66d8", not_started: "#c4ccd8" };
const ago = (iso) => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : d < 7 ? `${d} days ago` : new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function TrainingOverview() {
  const { user, app, supabaseEnabled } = useAuth();
  const firstName = (user?.name || "there").split(" ")[0];
  const [data, setData] = useState(supabaseEnabled ? null : DEMO);
  const [err, setErr] = useState("");
  const [pricing, setPricing] = useState({ subscriptionAnnualAmount: 29999, currency: "NGN" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await (await fetch("/api/settings")).json();
        if (s?.settings) setPricing({ subscriptionAnnualAmount: Number(s.settings.subscriptionAnnualAmount ?? s.settings.subscription_annual_amount ?? 29999), currency: s.settings.currency || "NGN" });
      } catch { /* defaults */ }
      if (!supabaseEnabled) return;
      try {
        const r = await fetch("/api/training/standing", { cache: "no-store" });
        const d = await r.json();
        if (r.ok) setData(d); else { setErr(d.error || "Couldn't load your training"); setData({ courses: [], stats: {}, todo: [], recent: [], access: {} }); }
      } catch { setErr("Couldn't load your training"); setData({ courses: [], stats: {}, todo: [], recent: [], access: {} }); }
    })();
  }, [supabaseEnabled]);

  const subscribe = async () => {
    setBusy(true);
    const r = await startPayment({ purpose: "subscription" });
    if (r?.error) { alert(r.error); setBusy(false); }
  };

  // Personalised plan from the AI interview.
  const plan = app.aiInterview?.suggestedTraining || null;
  const planCount = plan ? (plan.technical?.length || 0) + (plan.administrative?.length || 0) : 0;

  if (data === null) {
    return (<><TrainingTabs /><p style={{ color: "var(--muted)", fontSize: 14 }}>Loading your training…</p></>);
  }

  const s = data.stats || {};
  const courses = data.courses || [];
  const access = data.access || {};
  const subscribed = !!access.subscribed || (!supabaseEnabled && app.trainingUnlocked);
  const hasSpecific = (access.trainingRoles || []).length > 0;

  return (
    <>
      <TrainingTabs />

      <div className="td-head">
        <div>
          <h1>Your training, {firstName}</h1>
          <p>Track your courses, finish your next task and see your results — all in one place.</p>
        </div>
        <div className="td-head-actions">
          {data.next?.courseId && (
            <Link href={`/dashboard/training/course/${data.next.courseId}`} className="btn-solid"><IconPlay width={15} height={15} /> Continue learning</Link>
          )}
          <Link href="/dashboard/training/specific" className="btn-outline">Browse courses</Link>
        </div>
      </div>

      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}

      {/* ---- KPI tiles ---- */}
      <div className="td-kpis">
        <Kpi icon={<IconChart />} label="Overall progress" value={`${s.overallPct ?? 0}%`} sub={`${s.tasksDone ?? 0} of ${s.tasksTotal ?? 0} tasks done`} bar={s.overallPct ?? 0} />
        <Kpi icon={<IconBook />} label="Courses" value={String(s.totalCourses ?? 0)} sub={`${s.completedCourses ?? 0} completed · ${s.inProgressCourses ?? 0} in progress`} />
        <Kpi icon={<IconClock />} label="Awaiting grading" value={String(s.awaitingGrading ?? 0)} sub={s.awaitingGrading ? "Your tutor will grade these soon" : "Nothing waiting"} />
        <Kpi icon={<IconStar />} label="Average result" value={s.avgScore != null ? `${s.avgScore}%` : "—"} sub={s.releasedCourses ? `${s.releasedCourses} course result${s.releasedCourses === 1 ? "" : "s"} released` : "Shown once results are released"} />
      </div>

      <div className="td-grid">
        {/* ================= LEFT ================= */}
        <div className="td-col">
          {data.next ? (
            <div className="td-continue">
              <span className="td-eyebrow">Continue where you left off</span>
              <h3>{data.next.course}</h3>
              {data.next.task && (
                <p>Next: <b>{data.next.task.title}</b> <span className="td-type">{TYPE[data.next.task.type] || data.next.task.type}</span></p>
              )}
              <div className="td-continue-bar"><i style={{ width: `${data.next.pct}%` }} /></div>
              <div className="td-continue-foot">
                <span>{data.next.pct}% complete</span>
                <Link href={`/dashboard/training/course/${data.next.courseId}`} className="td-continue-btn">Open course <IconChevronRight width={15} height={15} /></Link>
              </div>
            </div>
          ) : (
            <div className="card pad td-empty">
              <span className="td-empty-ic"><IconCap width={22} height={22} /></span>
              <div>
                <h3 className="card-title" style={{ margin: 0 }}>{hasSpecific ? "Your curriculum is being prepared" : "Start a role-specific programme"}</h3>
                <p>{hasSpecific
                  ? "Your courses appear here as soon as they're published. We'll notify you when your first course opens."
                  : "Foundational and Intensive programmes with graded assignments, live practicals and a tutor — built for your target role."}</p>
                {!hasSpecific && <Link href="/dashboard/training/specific" className="btn-solid" style={{ display: "inline-flex" }}>See programmes</Link>}
              </div>
            </div>
          )}

          <div className="card pad">
            <div className="td-card-head">
              <h3 className="card-title" style={{ margin: 0 }}>My courses</h3>
              {courses.length > 0 && <span className="td-muted">{courses.length} course{courses.length === 1 ? "" : "s"}</span>}
            </div>
            {courses.length === 0 ? (
              <p className="td-muted" style={{ margin: "10px 0 0" }}>No courses yet. Once you enrol, each course shows its progress, tasks and result here.</p>
            ) : (
              <div className="td-courses">
                {courses.map((c) => (
                  <Link href={`/dashboard/training/course/${c.id}`} className="td-course" key={c.id}>
                    <div className="td-course-top">
                      <div style={{ minWidth: 0 }}>
                        <b>{c.title}</b>
                        <span className="td-muted">
                          <span className="td-level">{c.level}</span>
                          {c.duration ? ` · ${c.duration}` : ""}
                          {c.gradable > 0 ? ` · ${c.completed}/${c.gradable} tasks` : " · Self-paced"}
                        </span>
                      </div>
                      <span className={`td-status s-${c.status}`}>
                        {c.status === "released" && c.overallScore != null ? `${c.overallScore}% · Released` : c.statusLabel}
                      </span>
                    </div>
                    <div className="td-bar" aria-label={`${c.pct}% complete`}><i style={{ width: `${c.pct}%`, background: STATUS_COLOR[c.status] }} /></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="card pad">
            <h3 className="card-title" style={{ marginTop: 0 }}>Plan &amp; access</h3>
            <div className="td-access">
              <div className="td-access-row">
                <span className={`td-dot ${subscribed ? "on" : ""}`} />
                <div>
                  <b>Annual subscription</b>
                  <span className="td-muted">{subscribed
                    ? `Active${access.subscriptionUntil ? ` until ${new Date(access.subscriptionUntil).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""} · unlimited AI retakes & suggested training`
                    : "Not active — unlocks suggested training and unlimited AI retakes"}</span>
                </div>
              </div>
              <div className="td-access-row">
                <span className={`td-dot ${hasSpecific ? "on" : ""}`} />
                <div>
                  <b>Specific training</b>
                  <span className="td-muted">{hasSpecific ? "Enrolled for your role" : "Not enrolled yet"}</span>
                </div>
              </div>
              <div className="td-access-row">
                <span className={`td-dot ${planCount ? "on" : ""}`} />
                <div>
                  <b>AI suggested plan</b>
                  <span className="td-muted">{planCount ? `${planCount} skill${planCount === 1 ? "" : "s"} to work on from your AI interview` : "Take the AI interview to get a personalised plan"}</span>
                </div>
              </div>
            </div>
            <div className="td-access-actions">
              {!subscribed && (
                <button type="button" className="btn-solid" disabled={busy} onClick={subscribe}>
                  {busy ? "Starting…" : `Subscribe — ${formatMoney(pricing.subscriptionAnnualAmount, pricing.currency)}/yr`}
                </button>
              )}
              <Link href="/dashboard/training/suggested" className="btn-outline">Suggested training</Link>
              {!hasSpecific && <Link href="/dashboard/training/specific" className="btn-outline">Specific training</Link>}
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="td-col">
          <div className="card pad">
            <h3 className="card-title" style={{ marginTop: 0 }}>Course status</h3>
            <StatusDonut stats={s} />
          </div>

          <div className="card pad">
            <div className="td-card-head">
              <h3 className="card-title" style={{ margin: 0 }}>To do</h3>
              {(data.todo || []).length > 0 && <span className="td-muted">{data.todo.length} open</span>}
            </div>
            {(data.todo || []).length === 0 ? (
              <p className="td-muted td-allclear"><IconCheck width={15} height={15} /> You&apos;re all caught up.</p>
            ) : (
              <div className="td-list">
                {data.todo.map((t) => (
                  <Link key={t.moduleId} href={`/dashboard/training/course/${t.courseId}`} className="td-item">
                    <span className={`td-ic t-${t.type}`}>{t.type === "quiz" ? <IconCheck width={15} height={15} /> : t.type === "test" ? <IconFileText width={15} height={15} /> : <IconPencil width={15} height={15} />}</span>
                    <div style={{ minWidth: 0 }}>
                      <b>{t.title}</b>
                      <span className="td-muted">{TYPE[t.type] || t.type}{t.maxScore ? ` · ${t.maxScore} pts` : ""} · {t.course}</span>
                    </div>
                    <IconChevronRight width={15} height={15} className="td-chev" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card pad">
            <h3 className="card-title" style={{ marginTop: 0 }}>Recent results</h3>
            {(data.recent || []).length === 0 ? (
              <p className="td-muted" style={{ margin: 0 }}>Graded work appears here. Assignment and test scores show once your tutor releases course results.</p>
            ) : (
              <div className="td-list">
                {data.recent.map((r) => {
                  const pct = r.score != null && r.maxScore ? Math.round((r.score / r.maxScore) * 100) : null;
                  return (
                    <div key={r.moduleId} className="td-item static">
                      <span className={`td-score ${pct == null ? "hidden" : pct >= 70 ? "good" : pct >= 50 ? "ok" : "low"}`}>{pct == null ? "—" : `${pct}%`}</span>
                      <div style={{ minWidth: 0 }}>
                        <b>{r.title}</b>
                        <span className="td-muted">{r.score != null ? `${r.score}/${r.maxScore} · ` : "Score held until results are released · "}{ago(r.at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

function Kpi({ icon, label, value, sub, bar }) {
  return (
    <div className="td-kpi">
      <div className="td-kpi-top"><span className="td-kpi-ic">{icon}</span><span className="td-kpi-l">{label}</span></div>
      <div className="td-kpi-v">{value}</div>
      {bar != null && <div className="td-bar sm"><i style={{ width: `${bar}%` }} /></div>}
      <div className="td-kpi-s">{sub}</div>
    </div>
  );
}

// Courses by status as a ring + legend.
function StatusDonut({ stats }) {
  const parts = useMemo(() => [
    { label: "Completed", n: stats.completedCourses || 0, color: STATUS_COLOR.released },
    { label: "In progress", n: stats.inProgressCourses || 0, color: STATUS_COLOR.in_progress },
    { label: "Not started", n: stats.notStartedCourses || 0, color: STATUS_COLOR.not_started },
  ], [stats]);
  const total = parts.reduce((a, p) => a + p.n, 0);
  let acc = 0;
  const stops = total
    ? parts.map((p) => { const from = acc; acc += (p.n / total) * 100; return `${p.color} ${from}% ${acc}%`; }).join(", ")
    : "#e7ebf2 0% 100%";
  return (
    <div className="td-donut-wrap">
      <div className="td-donut" style={{ background: `conic-gradient(${stops})` }} role="img" aria-label={parts.map((p) => `${p.label}: ${p.n}`).join(", ")}>
        <div className="td-donut-in"><b>{total}</b><span>course{total === 1 ? "" : "s"}</span></div>
      </div>
      <div className="td-legend">
        {parts.map((p) => (
          <div key={p.label}><i style={{ background: p.color }} /><span>{p.label}</span><b>{p.n}</b></div>
        ))}
      </div>
    </div>
  );
}
