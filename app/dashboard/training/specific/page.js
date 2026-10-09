"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import TrainingTabs from "@/components/dashboard/TrainingTabs";
import Testimonials from "@/components/Testimonials";
import { ROLE_LABELS, loadSpecificCourses } from "@/lib/db";
import { startPayment, formatMoney } from "@/lib/billing";
import { IconLock, IconCheck } from "@/components/Icons";
import CourseRequest from "@/components/dashboard/CourseRequest";

// NexIT-curated, role-specific programme with live practical sessions.
export default function SpecificTrainingPage() {
  const { app, signup, supabaseEnabled } = useAuth();
  const [access, setAccess] = useState(null);
  const [roles, setRoles] = useState([]);
  const [pricing, setPricing] = useState({ trainingDefaultAmount: 450000, trainingFoundationalAmount: 150000, currency: "NGN" });
  const [courses, setCourses] = useState([]);
  const [busyTier, setBusyTier] = useState("");

  const roleKey = app.candidate?.target_role || signup.targetRole || "";

  useEffect(() => {
    (async () => {
      try {
        const s = await (await fetch("/api/settings")).json();
        if (s?.settings) setPricing({
          trainingDefaultAmount: Number(s.settings.trainingDefaultAmount),
          trainingFoundationalAmount: Number(s.settings.trainingFoundationalAmount),
          currency: s.settings.currency || "NGN",
        });
        if (Array.isArray(s?.roles)) setRoles(s.roles);
      } catch { /* defaults */ }
      if (supabaseEnabled) {
        try { setAccess(await (await fetch("/api/me/access")).json()); } catch { setAccess(null); }
        try { const sb = getBrowserSupabase(); if (sb && roleKey) setCourses(await loadSpecificCourses(sb, roleKey)); } catch { /* ignore */ }
      }
    })();
  }, [supabaseEnabled, roleKey]);

  const roleRow = roles.find((r) => r.roleKey === roleKey);
  const roleTitle = roleRow?.title || ROLE_LABELS[roleKey] || "your role";
  const intensivePrice = roleRow?.trainingAmount != null ? roleRow.trainingAmount : pricing.trainingDefaultAmount;
  const foundationalPrice = roleRow?.foundationalAmount != null ? roleRow.foundationalAmount : pricing.trainingFoundationalAmount;
  const unlocked = (supabaseEnabled && access?.trainingRoles?.includes(roleKey)) || (!supabaseEnabled && app.trainingUnlocked);

  const buy = async (tier) => {
    if (!roleKey) { alert("Set your target role first."); return; }
    setBusyTier(tier);
    const r = await startPayment({ purpose: "training", roleKey, tier });
    if (r?.error) { alert(r.error); setBusyTier(""); }
  };

  const byLevel = (lvl) => courses.filter((c) => c.level === lvl);

  if (unlocked) {
    return (
      <>
        <TrainingTabs />
        <div className="page-head">
          <h1>Specific Training — {roleTitle}</h1>
          <p>Your NexIT role-specific programme. Live practical sessions are scheduled as you progress.</p>
        </div>
        {courses.length === 0 ? (
          <div className="feedback-card"><p style={{ margin: 0 }}>Your curriculum is being prepared — check back shortly, or watch for a notification about your first live session.</p></div>
        ) : (
          ["foundational", "intensive"].map((lvl) =>
            byLevel(lvl).length === 0 ? null : (
              <div key={lvl} style={{ marginBottom: 18 }}>
                <h3 className="card-title" style={{ textTransform: "capitalize" }}>{lvl} courses</h3>
                <div className="board-grid">
                  {byLevel(lvl).map((c) => (
                    <div className="card pad" key={c.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <b>{c.title}</b>
                      {c.duration && <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.duration}</div>}
                      {c.summary && <p style={{ fontSize: 13, margin: 0 }}>{c.summary}</p>}
                      <Link href={`/dashboard/training/course/${c.id}`} className="btn-solid" style={{ marginTop: "auto", justifyContent: "center" }}>Open course</Link>
                    </div>
                  ))}
                </div>
              </div>
            )
          )
        )}
        <CourseRequest />
        <Testimonials />
      </>
    );
  }

  return (
    <>
      <TrainingTabs />
      <div className="page-head">
        <h1>Specific Training for {roleTitle}</h1>
        <p>Curated by the NexIT team to close exactly the gaps this role needs — with mentorship and live practical sessions.</p>
      </div>

      <div className="board-grid" style={{ alignItems: "stretch" }}>
        <TierCard
          name="Foundational"
          price={formatMoney(foundationalPrice, pricing.currency)}
          blurb="Build the base. Core concepts, guided projects and group support to get you to job-ready fundamentals."
          points={["Structured curriculum for your role", "Mentor support", "Group practical sessions"]}
          busy={busyTier === "foundational"}
          onBuy={() => buy("foundational")}
        />
        <TierCard
          name="Intensive"
          price={formatMoney(intensivePrice, pricing.currency)}
          highlight
          blurb="The full placement-focused programme: deep role-specific training, 1:1 mentorship and attended live practical sessions."
          points={["Everything in Foundational", "1:1 mentorship", "Live practical sessions (attendance required)", "Placement support"]}
          busy={busyTier === "intensive"}
          onBuy={() => buy("intensive")}
        />
      </div>

      <div className="feedback-card" style={{ marginTop: 16 }}>
        <h5 style={{ marginTop: 0 }}>Our commitment</h5>
        <p style={{ margin: 0, fontSize: 14 }}>
          The intensive includes placement support. If you complete the programme, attend the live practicals, and
          aren&apos;t placed within the stated window, talk to us about our placement guarantee — we only win when you do.
        </p>
      </div>

      <CourseRequest />

      <Testimonials />

      <p style={{ marginTop: 16, fontSize: 13 }}>
        Looking for free material first? Browse{" "}
        <Link href="/dashboard/training/suggested" className="link">Suggested Training</Link> and your personalised plan.
      </p>
    </>
  );
}

function TierCard({ name, price, blurb, points, highlight, busy, onBuy }) {
  return (
    <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 10, borderColor: highlight ? "var(--primary, #007bff)" : undefined, borderWidth: highlight ? 2 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 className="card-title" style={{ margin: 0 }}>{name}</h3>
        <b style={{ fontSize: 20 }}>{price}</b>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "var(--gray-600)" }}>{blurb}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {points.map((p, i) => <span key={i} className="d" style={{ fontSize: 13 }}><IconCheck width={13} height={13} style={{ marginRight: 6 }} /> {p}</span>)}
      </div>
      <button className={highlight ? "btn-solid" : "btn-outline"} style={{ marginTop: "auto", justifyContent: "center" }} disabled={busy} onClick={onBuy}>
        {busy ? "Starting…" : `Enrol — ${price}`}
      </button>
    </div>
  );
}
