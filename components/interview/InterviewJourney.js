"use client";

import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { IconChart, IconUser, IconBriefcase, IconRocket, IconCheck, IconLock, IconArrowRight } from "@/components/Icons";

/**
 * Candidate-facing progress pipeline: AI → Professional → HR → Candidate Board.
 * Each stage is gated on the previous one passing.
 */
export default function InterviewJourney() {
  const { app } = useAuth();

  const aiPassed = !!app.aiInterview?.passed;
  const aiAttempted = (app.aiInterview?.attempts ?? 0) > 0;
  const pro = app.stages?.Professional || {};
  const hr = app.stages?.HR || {};

  const steps = [
    {
      key: "AI",
      label: "AI Interview",
      Icon: IconChart,
      href: "/dashboard/interview/ai",
      status: aiPassed ? "passed" : aiAttempted ? "failed" : "ready",
      unlocked: true,
    },
    {
      key: "Professional",
      label: "Professional",
      Icon: IconUser,
      href: "/dashboard/interview/professional",
      status: pro.passed ? "passed" : pro.result ? "failed" : aiPassed ? "ready" : "locked",
      unlocked: aiPassed,
    },
    {
      key: "HR",
      label: "HR Interview",
      Icon: IconBriefcase,
      href: "/dashboard/interview/hr",
      status: hr.passed ? "passed" : hr.result ? "failed" : pro.passed ? "ready" : "locked",
      unlocked: pro.passed,
    },
    {
      key: "Board",
      label: "Candidate Board",
      Icon: IconRocket,
      href: "/dashboard",
      status: hr.passed ? "passed" : "locked",
      unlocked: hr.passed,
    },
  ];

  const done = steps.filter((s) => s.status === "passed").length;
  const pct = Math.round((done / steps.length) * 100);

  const labelFor = (s) =>
    s.status === "passed"
      ? "Passed"
      : s.status === "failed"
      ? "Retry needed"
      : s.status === "ready"
      ? "Ready"
      : "Locked";

  return (
    <div className="journey card pad">
      <div className="journey-head">
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>Your interview journey</h3>
          <p className="journey-sub">Pass each stage in order to reach the candidate board.</p>
        </div>
        <span className="journey-count">{done}/{steps.length} stages</span>
      </div>

      <div className="journey-track">
        <div className="jt-line">
          <div className="jt-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="jt-steps">
          {steps.map((s) => {
            const clickable = s.unlocked && s.key !== "Board";
            const inner = (
              <>
                <span className={`jt-node ${s.status}`}>
                  {s.status === "passed" ? (
                    <IconCheck width={18} height={18} />
                  ) : s.status === "locked" ? (
                    <IconLock width={15} height={15} />
                  ) : (
                    <s.Icon width={18} height={18} />
                  )}
                </span>
                <span className="jt-label">{s.label}</span>
                <span className={`jt-status ${s.status}`}>{labelFor(s)}</span>
              </>
            );
            return clickable ? (
              <Link key={s.key} href={s.href} className="jt-step is-link">
                {inner}
              </Link>
            ) : (
              <div key={s.key} className="jt-step">
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      {/* contextual next action */}
      <JourneyCta steps={steps} />
    </div>
  );
}

function JourneyCta({ steps }) {
  const next = steps.find((s) => s.unlocked && s.status !== "passed" && s.key !== "Board");
  if (!next) {
    const board = steps.find((s) => s.key === "Board");
    if (board?.status === "passed") {
      return (
        <div className="journey-cta ok">
          <span><IconCheck width={16} height={16} /> All stages passed — you&apos;re on the candidate board.</span>
        </div>
      );
    }
    return null;
  }
  return (
    <div className="journey-cta">
      <span>
        Next up: <b>{next.label} Interview</b>
        {next.status === "failed" ? " — a retry is needed." : ""}
      </span>
      <Link href={next.href} className="btn-solid" style={{ padding: "9px 18px", fontSize: 13 }}>
        {next.status === "failed" ? "Review & retry" : "Go to stage"} <IconArrowRight width={14} height={14} />
      </Link>
    </div>
  );
}
