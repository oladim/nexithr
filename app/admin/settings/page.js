"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { SETTINGS_GROUPS } from "@/components/admin/data";
import SettingsToggles from "@/components/SettingsToggles";
import { DEFAULT_SETTINGS } from "@/lib/db";
import { IconCheck } from "@/components/Icons";

export default function AdminSettings() {
  const { supabaseEnabled } = useAuth();
  const [s, setS] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(!supabaseEnabled);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (res.ok && data.settings) setS({ ...DEFAULT_SETTINGS, ...data.settings });
      } catch { /* keep defaults */ }
      setLoaded(true);
    })();
  }, [supabaseEnabled]);

  const set = (k) => (e) => setS((p) => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setErr(""); setMsg("");
    if (!supabaseEnabled) { setMsg("Saved (demo mode — connect Supabase to persist)."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setS({ ...DEFAULT_SETTINGS, ...data.settings });
      setMsg("Settings saved.");
      setTimeout(() => setMsg(""), 4000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const cur = s.currency || "NGN";

  return (
    <>
      <div className="page-head">
        <h1>System Settings</h1>
        <p>Pass marks, pricing, and platform-wide configuration.</p>
      </div>

      <div className="card pad" style={{ maxWidth: 760, marginBottom: 20 }}>
        <h3 className="card-title">Interview thresholds</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>
          The AI diagnostic uses two thresholds: at or above <b>Ready</b> the candidate advances;
          between <b>Foundational</b> and Ready they&apos;re &quot;almost there&quot;; below Foundational they need
          foundational training. Professional and HR use a single pass mark.
        </p>
        <div className="field-row">
          <NumField label="AI · Ready % (advance)" value={s.pass_mark_ai} onChange={set("pass_mark_ai")} disabled={!loaded} />
          <NumField label="AI · Foundational %" value={s.ai_foundational_mark} onChange={set("ai_foundational_mark")} disabled={!loaded} />
        </div>
        <div className="field-row">
          <NumField label="Professional %" value={s.pass_mark_professional} onChange={set("pass_mark_professional")} disabled={!loaded} />
          <NumField label="HR %" value={s.pass_mark_hr} onChange={set("pass_mark_hr")} disabled={!loaded} />
          <NumField label="Free AI retakes" value={s.free_ai_retakes} onChange={set("free_ai_retakes")} disabled={!loaded} />
        </div>
        <label className="consent-check" style={{ marginTop: 10 }}>
          <input type="checkbox" checked={!!s.ai_result_requires_approval} disabled={!loaded}
            onChange={(e) => setS((p) => ({ ...p, ai_result_requires_approval: e.target.checked }))} />
          <span>Hold AI results for reviewer approval before the candidate sees them (manual confirm/override in Admin → AI Results).</span>
        </label>

        <h3 className="card-title" style={{ marginTop: 24 }}>Pricing ({cur})</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>
          The annual subscription unlocks unlimited AI retakes and suggested training. The
          specific-training default applies to any role that doesn&apos;t set its own price
          (set per-role prices on the Role Requirements page).
        </p>
        <div className="field-row">
          <NumField label={`Annual subscription (${cur}/yr)`} value={s.subscription_annual_amount} onChange={set("subscription_annual_amount")} disabled={!loaded} step="1" />
          <NumField label={`Intensive training default (${cur})`} value={s.training_default_amount} onChange={set("training_default_amount")} disabled={!loaded} step="1" />
        </div>
        <div className="field-row">
          <NumField label={`Foundational training default (${cur})`} value={s.training_foundational_amount} onChange={set("training_foundational_amount")} disabled={!loaded} step="1" />
          <NumField label={`Employer placement fee (${cur})`} value={s.placement_fee_amount} onChange={set("placement_fee_amount")} disabled={!loaded} step="1" />
        </div>

        <h3 className="card-title" style={{ marginTop: 24 }}>Sign-in options</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>
          Show social sign-in buttons on the login and sign-up pages. Enable a provider only once
          it&apos;s configured in Supabase Auth, otherwise the button won&apos;t be able to complete sign-in.
        </p>
        <label className="consent-check" style={{ marginTop: 6 }}>
          <input type="checkbox" checked={!!s.oauth_google_enabled} disabled={!loaded}
            onChange={(e) => setS((p) => ({ ...p, oauth_google_enabled: e.target.checked }))} />
          <span>Show <b>Continue with Google</b></span>
        </label>
        <label className="consent-check" style={{ marginTop: 8 }}>
          <input type="checkbox" checked={!!s.oauth_apple_enabled} disabled={!loaded}
            onChange={(e) => setS((p) => ({ ...p, oauth_apple_enabled: e.target.checked }))} />
          <span>Show <b>Continue with Apple</b></span>
        </label>

        {err && <div className="auth-error" style={{ marginTop: 10 }}>{err}</div>}
        {msg && <div className="role-note ok" style={{ marginTop: 10 }}>{msg}</div>}

        <button className="btn-solid" style={{ marginTop: 16 }} disabled={busy || !loaded} onClick={save}>
          <IconCheck width={16} height={16} /> {busy ? "Saving…" : "Save settings"}
        </button>
      </div>

      <div className="card pad" style={{ maxWidth: 760 }}>
        <h3 className="card-title">Other configuration</h3>
        <SettingsToggles groups={SETTINGS_GROUPS} />
      </div>
    </>
  );
}

function NumField({ label, value, onChange, disabled, step = "1" }) {
  return (
    <div className="field field-simple">
      <label>{label}</label>
      <input type="number" min="0" step={step} value={value ?? ""} onChange={onChange} disabled={disabled} />
    </div>
  );
}
