"use client";

import Link from "next/link";
import SettingsCrumb from "@/components/SettingsCrumb";

// Plain-language data & recording notice (NDPR-aligned). Edit the specifics to
// match your registered data-protection practices before going live.
export default function DataPrivacyPage() {
  return (
    <div className="assess" style={{ maxWidth: 760 }}>
      <SettingsCrumb current="Data & recording notice" onlyWhenFrom />
      <div className="page-head">
        <h1>Data &amp; recording notice</h1>
        <p>How NexIT-Africa handles your interview recordings and personal data.</p>
      </div>

      <div className="feedback-card">
        <h5>What we collect</h5>
        <p>During the AI interview we capture your <b>video and audio</b>, a transcript of your spoken answers, and the assessment the AI produces (scores, evidence notes and a training plan). We also hold the profile and CV you provide.</p>
      </div>
      <div className="feedback-card">
        <h5>Why we collect it</h5>
        <p>Solely to assess your interview, give you feedback and a training plan, and — with your participation — support your progress toward placement. We do not sell your data or use it for advertising.</p>
      </div>
      <div className="feedback-card">
        <h5>Proctoring</h5>
        <p>The session is monitored for integrity (e.g. looking away, other people, or a second device). Flags are signals for human review, not automatic accusations.</p>
      </div>
      <div className="feedback-card">
        <h5>Retention &amp; your rights</h5>
        <p>Recordings are kept only as long as needed to assess and support you, then deleted. Under the Nigeria Data Protection Regulation (NDPR) you may request access to, correction of, or deletion of your personal data, and you may withdraw consent. To exercise any of these, contact our data protection contact.</p>
      </div>
      <div className="feedback-card">
        <h5>Consent</h5>
        <p>You consent to the above when you tick the consent box before the AI interview. You can decline — but the AI interview requires recording to run.</p>
      </div>

      <p style={{ fontSize: 12, color: "var(--gray-500)" }}>
        This is a template notice. Replace the retention period, lawful basis and the data-protection contact with your registered details before launch.
      </p>

      <div className="assess-actions">
        <Link href="/dashboard/interview/ai" className="btn-solid">Back to the interview</Link>
      </div>
    </div>
  );
}
