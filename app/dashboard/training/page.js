"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { startPayment, formatMoney } from "@/lib/billing";
import TrainingTabs from "@/components/dashboard/TrainingTabs";
import TrainingStanding from "@/components/dashboard/TrainingStanding";
import {
  IconCap,
  IconPlay,
  IconDownload,
  IconRocket,
  IconPencil,
  IconChat,
  IconPeople,
  IconCheck,
} from "@/components/Icons";

const QUICK_LINKS = [
  { label: "Watch Tutorial", Icon: IconPlay },
  { label: "Download Guide", Icon: IconDownload },
  { label: "Launch Course", Icon: IconRocket },
  { label: "Take Notes", Icon: IconPencil },
  { label: "Ask a Mentor", Icon: IconChat },
  { label: "Join Discussion", Icon: IconPeople },
];

const JS_TASKS = [
  { title: "Node.js", sub: "Completed", state: "done" },
  { title: "React Native", sub: "In progress", state: "active" },
  { title: "Uploading Code", sub: "Pending" },
  { title: "Uploading Code", sub: "Pending" },
  { title: "Uploading Code", sub: "Pending" },
];

const SKILL = [
  { label: "Completed", pct: 60, color: "#2ecc71" },
  { label: "In progress", pct: 14, color: "#007bff" },
  { label: "Pending", pct: 26, color: "#ffab00" },
];

export default function TrainingOverview() {
  const { user, app, supabaseEnabled } = useAuth();
  const firstName = (user?.name || "there").split(" ")[0];
  const [access, setAccess] = useState(null);
  const [pricing, setPricing] = useState({ subscriptionAnnualAmount: 29999, currency: "NGN" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await (await fetch("/api/settings")).json();
        if (s?.settings) setPricing({ subscriptionAnnualAmount: Number(s.settings.subscriptionAnnualAmount), currency: s.settings.currency || "NGN" });
      } catch { /* defaults */ }
      if (supabaseEnabled) {
        try { setAccess(await (await fetch("/api/me/access")).json()); } catch { setAccess(null); }
      }
    })();
  }, [supabaseEnabled]);

  const unlocked = !supabaseEnabled ? app.trainingUnlocked : (access?.subscribed || app.trainingUnlocked);
  const subscribe = async () => {
    setBusy(true);
    const r = await startPayment({ purpose: "subscription" });
    if (r?.error) { alert(r.error); setBusy(false); }
  };

  return (
    <>
      <TrainingTabs />

      {!unlocked ? (
        <div className="train-gate">
          <span className="gi"><IconCap width={32} height={32} /></span>
          <h3>Unlock your training programme</h3>
          <p>
            An annual subscription unlocks suggested training and gives you
            unlimited AI interview retakes. Browse{" "}
            <Link href="/dashboard/training/suggested" className="link">Suggested Training</Link>{" "}
            after subscribing, or buy{" "}
            <Link href="/dashboard/training/specific" className="link">Specific Training</Link>{" "}
            for your role.
          </p>
          <button className="btn-solid" style={{ display: "inline-flex" }} disabled={busy} onClick={subscribe}>
            <IconCap width={16} height={16} /> {busy ? "Starting…" : `Subscribe — ${formatMoney(pricing.subscriptionAnnualAmount, pricing.currency)}/year`}
          </button>
        </div>
      ) : (
        <>
          <h1 className="train-hero">Welcome back, {firstName}! Ready for the next step?</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginTop: 16 }}>
            <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="pi"><IconCap /></span>
              <h3 className="card-title" style={{ margin: 0 }}>Suggested training</h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>Your personalised plan from the AI interview, plus curated free resources to close your gaps.</p>
              <Link href="/dashboard/training/suggested" className="btn-solid" style={{ marginTop: "auto", justifyContent: "center" }}>Open suggested training</Link>
            </div>
            <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="pi"><IconRocket /></span>
              <h3 className="card-title" style={{ margin: 0 }}>Specific training</h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>Your NexIT role-specific courses — videos, readings, assignments and tests, graded by your tutor.</p>
              <Link href="/dashboard/training/specific" className="btn-solid" style={{ marginTop: "auto", justifyContent: "center" }}>Open my courses</Link>
            </div>
          </div>

          <TrainingStanding />
        </>
      )}
    </>
  );
}

// eslint-disable-next-line no-unused-vars
function Donut({ pct, segments }) {
  let acc = 0;
  const stops = segments
    .map((s) => {
      const from = acc;
      acc += s.pct;
      return `${s.color} ${from}% ${acc}%`;
    })
    .join(", ");
  return (
    <div style={{ width: 132, height: 132, borderRadius: "50%", background: `conic-gradient(${stops})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <strong style={{ fontSize: 24, color: "var(--navy)" }}>{pct}%</strong>
      </div>
    </div>
  );
}
