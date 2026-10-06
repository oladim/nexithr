"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadSuggestedResources } from "@/lib/db";
import TrainingTabs from "@/components/dashboard/TrainingTabs";
import Testimonials from "@/components/Testimonials";
import { startPayment, formatMoney } from "@/lib/billing";
import { IconCap } from "@/components/Icons";

function ResourceList({ heading, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, textTransform: "capitalize" }}>{heading}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {items.map((r) => (
          <div key={r.id} className="card pad" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <b style={{ fontSize: 14 }}>{r.title}</b>
            {r.description && <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>{r.description}</p>}
            {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="link" style={{ fontSize: 13, marginTop: "auto" }}>Open resource →</a>}
          </div>
        ))}
      </div>
    </div>
  );
}

// One group of the AI-generated plan.
function PlanGroup({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it, i) => (
          <div key={i} style={{ border: "1px solid #eef1f6", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <b style={{ fontSize: 14 }}>{it.title}</b>
              {it.est_time ? <span style={{ fontSize: 12, color: "var(--gray-500)" }}>{it.est_time}</span> : null}
            </div>
            {it.focus ? <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--gray-600)" }}>Closes: {it.focus}</p> : null}
            {it.resource ? <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--gray-500)" }}>Resource: {it.resource}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// Suggested Training — a perk of the annual subscription.
export default function SuggestedTrainingPage() {
  const { app, signup, supabaseEnabled } = useAuth();
  const plan = app.aiInterview?.suggestedTraining || null;
  const [access, setAccess] = useState(null);
  const [pricing, setPricing] = useState({ subscriptionAnnualAmount: 29999, currency: "NGN" });
  const [resources, setResources] = useState([]);
  const [busy, setBusy] = useState(false);

  const roleKey = app.candidate?.target_role || signup.targetRole || "";

  useEffect(() => {
    (async () => {
      try {
        const s = await (await fetch("/api/settings")).json();
        if (s?.settings) setPricing({ subscriptionAnnualAmount: Number(s.settings.subscriptionAnnualAmount), currency: s.settings.currency || "NGN" });
      } catch { /* defaults */ }
      if (supabaseEnabled) {
        try { setAccess(await (await fetch("/api/me/access")).json()); } catch { setAccess(null); }
        try { const sb = getBrowserSupabase(); if (sb) setResources(await loadSuggestedResources(sb, roleKey)); } catch { /* ignore */ }
      }
    })();
  }, [supabaseEnabled, roleKey]);

  const unlocked = !supabaseEnabled || access?.subscribed || app.trainingUnlocked;

  const subscribe = async () => {
    setBusy(true);
    const r = await startPayment({ purpose: "subscription" });
    if (r?.error) { alert(r.error); setBusy(false); }
  };

  const hasPlan = plan && ((plan.technical?.length || 0) + (plan.administrative?.length || 0) > 0);

  return (
    <>
      <TrainingTabs />

      {hasPlan && (
        <div className="card pad" style={{ marginBottom: 18 }}>
          <h3 className="card-title" style={{ marginTop: 0 }}>Your personalised plan (from your AI interview)</h3>
          <p style={{ marginTop: 0, fontSize: 13, color: "var(--muted)" }}>
            Built from your diagnostic. Work through these free resources on your own — then NexIT&apos;s specific training takes you the rest of the way.
          </p>
          <PlanGroup title="Technical skills" items={plan.technical} />
          <PlanGroup title="Administrative &amp; professional skills" items={plan.administrative} />
        </div>
      )}

      {unlocked ? (
        <>
          <div className="card pad">
            <h3 className="card-title" style={{ marginTop: 0 }}>Recommended resources</h3>
            {resources.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>No curated resources yet — your personalised plan above is a great place to start.</p>
            ) : (
              <>
                <ResourceList heading="Technical" items={resources.filter((r) => r.category === "technical")} />
                <ResourceList heading="Administrative & professional" items={resources.filter((r) => r.category === "administrative")} />
                <ResourceList heading="General" items={resources.filter((r) => r.category === "general")} />
              </>
            )}
          </div>
          <Testimonials />
        </>
      ) : (
        <div className="train-gate">
          <span className="gi"><IconCap width={32} height={32} /></span>
          <h3>Suggested Training is a subscriber benefit</h3>
          <p>
            Subscribe for a year to unlock suggested training and get unlimited AI
            interview retakes. Your subscription keeps you moving without the
            one-month retake wait.
          </p>
          <button className="btn-solid" style={{ display: "inline-flex" }} disabled={busy} onClick={subscribe}>
            <IconCap width={16} height={16} /> {busy ? "Starting…" : `Subscribe — ${formatMoney(pricing.subscriptionAnnualAmount, pricing.currency)}/year`}
          </button>
        </div>
      )}
    </>
  );
}
