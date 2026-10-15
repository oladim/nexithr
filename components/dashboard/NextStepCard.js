"use client";

import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { nextStep, STAGE_LABELS } from "@/lib/nextStep";
import { ROLE_LABELS } from "@/lib/db";
import { CATALOG_LABELS } from "@/lib/roleCatalog";
import { IconChevronRight, IconCheck, IconClock } from "@/components/Icons";

// "Where am I and what do I do next?" — one clear card at the top of the
// candidate dashboard. Uses the same rules as the admin Remind button and the
// automatic reminder emails (lib/nextStep.js).
export default function NextStepCard({ roleTitle }) {
  const { app, signup } = useAuth();
  const roleKey = app.candidate?.target_role || signup?.targetRole || "";
  const step = nextStep({
    roleKey,
    roleTitle: roleTitle || CATALOG_LABELS[roleKey] || ROLE_LABELS[roleKey] || null,
    cv: app.cv ? { status: app.cv.status || "Pending review", reviewNote: app.cv.reviewNote } : null,
    ai: app.aiInterview || {},
    stages: app.stages || {},
    interviews: app.interviews || [],
    onBoard: !!app.candidate?.on_board,
  });
  const done = step.key === "done";

  return (
    <section className={`next-step ${step.actionable ? "act" : "wait"} ${done ? "done" : ""}`} aria-label="Your next step">
      <div className="ns-top">
        <span className="ns-kicker">
          {done ? "All stages complete" : step.actionable ? `Next step · Stage ${step.step} of ${step.of}` : `In progress · Stage ${step.step} of ${step.of}`}
        </span>
        <ol className="ns-track" aria-label="Your progress">
          {STAGE_LABELS.map((l, i) => {
            const n = i + 1;
            const state = n < step.step || done ? "done" : n === step.step ? "now" : "todo";
            return (
              <li key={l} className={state} aria-current={state === "now" ? "step" : undefined} title={l}>
                <i>{state === "done" ? <IconCheck width={11} height={11} /> : n}</i>
                <span>{l}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="ns-body">
        <span className="ns-icon" aria-hidden="true">{step.actionable || done ? <IconChevronRight width={18} height={18} /> : <IconClock width={18} height={18} />}</span>
        <div className="ns-text">
          <h3>{step.title}</h3>
          <p>{step.body}</p>
        </div>
        {step.cta && (
          <Link href={step.cta.path} className={step.actionable || done ? "btn-solid" : "btn-outline"}>
            {step.cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}
