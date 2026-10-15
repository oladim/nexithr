"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadSuggestedResources } from "@/lib/db";
import TrainingTabs from "@/components/dashboard/TrainingTabs";
import Testimonials from "@/components/Testimonials";
import { startPayment, formatMoney } from "@/lib/billing";
import { IconCap } from "@/components/Icons";
import AiSuggestions from "@/components/training/AiSuggestions";
import { normalizeSuggestions } from "@/lib/trainingSuggestions";

function ResourceList({ heading, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, textTransform: "capitalize" }}>{heading}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: 12 }}>
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
    if (!r?.ok) { if (r?.error) alert(r.error); setBusy(false); }
  };

  const hasPlan = normalizeSuggestions(plan).length > 0;

  return (
    <>
      <TrainingTabs />

      {hasPlan ? (
        <div className="card pad" style={{ marginBottom: 18 }}>
          <AiSuggestions raw={plan} />
        </div>
      ) : (
        <div className="card pad" style={{ marginBottom: 18 }}>
          <h3 className="card-title" style={{ marginTop: 0 }}>Suggested training from your AI interview</h3>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>After your AI interview, you&apos;ll get up to 6 training topics picked for your gaps — with links to learn them on YouTube, Coursera, Udemy or online.</p>
        </div>
      )}

      {unlocked ? (
        <>
          <div className="card pad">
            <h3 className="card-title" style={{ marginTop: 0 }}>More resources from NexIT</h3>
            {resources.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>No extra resources from our team yet — the suggestions above are a great place to start.</p>
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
          <h3>More resources from NexIT are a subscriber benefit</h3>
          <p>
            Your AI suggestions above are free. Subscribe for a year to also get the
            extra resources our team curates for your role, plus unlimited AI
            interview retakes without the retake wait.
          </p>
          <button className="btn-solid" style={{ display: "inline-flex" }} disabled={busy} onClick={subscribe}>
            <IconCap width={16} height={16} /> {busy ? "Starting…" : `Subscribe — ${formatMoney(pricing.subscriptionAnnualAmount, pricing.currency)}/year`}
          </button>
        </div>
      )}
    </>
  );
}
