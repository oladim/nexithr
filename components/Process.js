"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import { IconUploadCloud, IconChart, IconPeople, IconCap, IconCheck, IconUser, IconFileText } from "./Icons";

const STEPS = [
  {
    key: "submit",
    tab: "Create & upload",
    Icon: IconUploadCloud,
    title: "Create your profile & upload your CV",
    body: "Sign up, pick your target role, and upload your CV. We confirm the role is open and get your file ready for review — in minutes, not days.",
    features: [
      { Icon: IconFileText, h: "Pick your track", p: "Choose from software, data, product, cloud, security and support roles." },
      { Icon: IconUploadCloud, h: "Upload securely", p: "Your CV is stored privately and only used to assess your readiness." },
    ],
  },
  {
    key: "ai",
    tab: "AI interview",
    Icon: IconChart,
    title: "Take an adaptive AI interview",
    body: "A real voice conversation with an AI interviewer adapts to your answers and scores five competencies. You get an honest readiness band and a personalised plan — not a vague rejection.",
    features: [
      { Icon: IconChart, h: "Honest diagnostic", p: "See exactly where you're strong and what's holding you back." },
      { Icon: IconUser, h: "Personalised plan", p: "Technical and professional next steps, tailored to your gaps." },
    ],
  },
  {
    key: "interview",
    tab: "Human rounds",
    Icon: IconPeople,
    title: "Meet real Professional & HR interviewers",
    body: "Once you pass the AI stage, book your Professional and HR interviews on Google Meet — together or separately. Everything is scheduled around you, with the link on your dashboard.",
    features: [
      { Icon: IconPeople, h: "Live interviews", p: "Vetted interviewers assess your skills and fit on video." },
      { Icon: IconCheck, h: "Clear feedback", p: "Structured verdicts move you forward — no black boxes." },
    ],
  },
  {
    key: "placed",
    tab: "Train & get placed",
    Icon: IconCap,
    title: "Train, get verified & get hired",
    body: "Close your gaps with NexIT's role-specific training — graded assignments, tests and live practicals — then land on the candidate board where employers reach out to you directly.",
    features: [
      { Icon: IconCap, h: "Job-ready training", p: "Curated courses with real assignments and overall scores." },
      { Icon: IconCheck, h: "Verified & visible", p: "Employers hire from a board of fully-vetted candidates." },
    ],
  },
];

export default function Process() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section className="process" id="process">
      <div className="process-inner">
        <Reveal className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>From sign-up to job offer in four steps</h2>
          <p>Follow the path every NexIT candidate takes — tap a step to see what happens.</p>
        </Reveal>

        <Reveal className="steps-tabs" delay={60}>
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              className={`step-tab ${i === active ? "active" : ""} ${i < active ? "done" : ""}`}
              onClick={() => setActive(i)}
            >
              <span className="step-num">{i < active ? <IconCheck width={16} height={16} /> : i + 1}</span>
              <span className="step-tab-label"><s.Icon width={16} height={16} /> {s.tab}</span>
            </button>
          ))}
        </Reveal>

        <div className="step-panel" key={step.key}>
          <div className="step-visual">
            <StepVisual which={step.key} />
          </div>
          <div className="step-copy">
            <div className="step-copy-ic"><step.Icon width={26} height={26} color="#fff" /></div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <div className="feature-list">
              {step.features.map((f) => (
                <div className="feature" key={f.h}>
                  <div className="icn"><f.Icon color="var(--navy)" /></div>
                  <h4>{f.h}</h4>
                  <p>{f.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepVisual({ which }) {
  if (which === "submit") {
    return (
      <div className="mock">
        <div className="mock-drop">
          <IconUploadCloud width={40} height={40} color="var(--blue)" />
          <b>Upload your CV</b>
          <span>PDF or DOCX · stored privately</span>
        </div>
        <div className="mock-chips"><span>Software</span><span className="on">Data</span><span>Cloud</span><span>Product</span></div>
      </div>
    );
  }
  if (which === "ai") {
    return (
      <div className="mock">
        <div className="mock-score"><div className="ring"><b>82</b><small>Ready</small></div>
          <div className="mock-bars">
            {[["Technical", 84], ["Communication", 78], ["Problem solving", 73], ["Teamwork", 80], ["Motivation", 88]].map(([k, v]) => (
              <div key={k} className="mb-row"><span>{k}</span><i style={{ width: `${v}%` }} /></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (which === "interview") {
    return (
      <div className="mock">
        <div className="mock-meet">
          <div className="tile a" /><div className="tile b" />
          <span className="live"><i /> Live · Google Meet</span>
        </div>
        <div className="mock-rows">
          <div className="mr"><span className="who"><i />Professional interview</span><span className="tag done">Passed</span></div>
          <div className="mr"><span className="who"><i />HR interview</span><span className="tag">Scheduled</span></div>
        </div>
      </div>
    );
  }
  return (
    <div className="mock">
      <div className="mock-course">
        <div className="mc-head"><b>Cloud Engineering · Intensive</b><span className="tag done">78% overall</span></div>
        {[["Assignment 1", 92], ["Test · Networking", 71], ["Practical project", 80]].map(([k, v]) => (
          <div key={k} className="mc-row"><span>{k}</span><i style={{ width: `${v}%` }} /><em>{v}%</em></div>
        ))}
      </div>
      <div className="mock-board"><IconCheck width={16} height={16} /> You&apos;re on the candidate board</div>
    </div>
  );
}
