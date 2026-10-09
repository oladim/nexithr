"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { SETTINGS_GROUPS } from "@/components/admin/data";
import SettingsToggles from "@/components/SettingsToggles";
import { DEFAULT_SETTINGS } from "@/lib/db";
import { IconCheck } from "@/components/Icons";
import { ALERT_CATEGORIES } from "@/lib/alertCategories";
import { maintenanceStatus, maintenanceFromSettings, fmtWindow, fmtWhen, toLocalInput, fromLocalInput, readDemoMaintenance, writeDemoMaintenance } from "@/lib/maintenance";

export default function AdminSettings() {
  const { supabaseEnabled } = useAuth();
  const [s, setS] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(!supabaseEnabled);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!supabaseEnabled) {
      const dm = readDemoMaintenance();
      if (dm) setS((p) => ({ ...p, maintenance_enabled: !!dm.enabled, maintenance_start: dm.start, maintenance_end: dm.end, maintenance_message: dm.message || "" }));
      return;
    }
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

  // Saves everything (plus an optional patch). `where` decides which card
  // shows the result, so feedback appears next to the button that was used.
  const [where, setWhere] = useState("main");
  const save = async (patch = {}, at = "main") => {
    setErr(""); setMsg(""); setWhere(at);
    const next = { ...s, ...patch };
    if (!supabaseEnabled) {
      setS(next);
      writeDemoMaintenance(maintenanceFromSettings(next));
      setMsg("Saved (demo mode — stored in this browser only).");
      return true;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setS({ ...DEFAULT_SETTINGS, ...data.settings });
      if (data.warning) setErr(data.warning);
      setMsg(data.notified ? `Saved. ${data.notified} user${data.notified === 1 ? "" : "s"} notified.` : "Settings saved.");
      window.dispatchEvent(new Event("nexit:maintenance"));
      setTimeout(() => setMsg(""), 6000);
      return true;
    } catch (e) {
      setErr(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const Feedback = ({ at }) => where !== at ? null : (
    <>
      {err && <div className="auth-error" style={{ marginTop: 10 }}>{err}</div>}
      {msg && <div className="role-note ok" style={{ marginTop: 10 }}>{msg}</div>}
    </>
  );

  const cur = s.currency || "NGN";

  return (
    <>
      <div className="page-head">
        <h1>System Settings</h1>
        <p>Pass marks, pricing, maintenance and platform-wide configuration.</p>
      </div>

      <nav className="set-jump" aria-label="Jump to section">
        <a href="#thresholds">Thresholds &amp; pricing</a>
        <a href="#maintenance">Maintenance mode</a>
        <a href="#alerts">Email alerts &amp; test email</a>
        <a href="#other">Other</a>
      </nav>

      <div className="card pad set-card" id="thresholds">
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

        <Feedback at="main" />
        <button className="btn-solid" style={{ marginTop: 16 }} disabled={busy || !loaded} onClick={() => save({}, "main")}>
          <IconCheck width={16} height={16} /> {busy && where === "main" ? "Saving…" : "Save settings"}
        </button>
      </div>

      <MaintenancePanel s={s} loaded={loaded} busy={busy} save={save} where={where} Feedback={Feedback} />

      <div className="card pad set-card" id="alerts">
        <div className="set-card-head">
          <h3 className="card-title" style={{ margin: 0 }}>Admin email alerts</h3>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
          Besides in-app notifications, the team inbox gets an email when candidates, interviewers and employers do something
          that needs attention. Each event is emailed once.
        </p>
        <label className="consent-check" style={{ marginTop: 6 }}>
          <input type="checkbox" checked={s.admin_alerts_enabled !== false} disabled={!loaded}
            onChange={(e) => setS((p) => ({ ...p, admin_alerts_enabled: e.target.checked }))} />
          <span>Send admin alert emails</span>
        </label>
        <div className="field field-simple" style={{ marginTop: 12, maxWidth: 420 }}>
          <label htmlFor="alert-email">Send alerts to</label>
          <input id="alert-email" type="email" value={s.admin_alert_email || ""} disabled={!loaded || s.admin_alerts_enabled === false}
            onChange={(e) => setS((p) => ({ ...p, admin_alert_email: e.target.value }))} placeholder="support@nexitafrica.com" />
        </div>
        <div className="alert-cats" aria-label="Alert categories">
          {ALERT_CATEGORIES.map((c) => {
            const list = Array.isArray(s.admin_alert_categories) ? s.admin_alert_categories : ALERT_CATEGORIES.map((x) => x.key);
            const on = list.includes(c.key);
            return (
              <label key={c.key} className="consent-check">
                <input type="checkbox" checked={on} disabled={!loaded || s.admin_alerts_enabled === false}
                  onChange={(e) => setS((p) => {
                    const cur = Array.isArray(p.admin_alert_categories) ? p.admin_alert_categories : ALERT_CATEGORIES.map((x) => x.key);
                    return { ...p, admin_alert_categories: e.target.checked ? [...new Set([...cur, c.key])] : cur.filter((k) => k !== c.key) };
                  })} />
                <span>{c.label}</span>
              </label>
            );
          })}
        </div>
        <Feedback at="alerts" />
        <button className="btn-solid" style={{ marginTop: 16 }} disabled={busy || !loaded} onClick={() => save({}, "alerts")}>
          <IconCheck width={16} height={16} /> {busy && where === "alerts" ? "Saving…" : "Save alert settings"}
        </button>
        <AlertTools supabaseEnabled={supabaseEnabled} />
      </div>

      <div className="card pad set-card" id="other">
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

// Test email + recent alert log.
function AlertTools({ supabaseEnabled }) {
  const [log, setLog] = useState(null);
  const [configured, setConfigured] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const load = async () => {
    if (!supabaseEnabled) { setLog([]); return; }
    try {
      const r = await fetch("/api/admin/alerts", { cache: "no-store" });
      const d = await r.json();
      if (r.ok) { setLog(d.alerts || []); setConfigured(!!d.emailConfigured); } else setLog([]);
    } catch { setLog([]); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [supabaseEnabled]);

  const test = async () => {
    setNote(""); setBusy(true);
    if (!supabaseEnabled) { setNote("Demo mode — connect Supabase and email to send a test."); setBusy(false); return; }
    try {
      const r = await fetch("/api/admin/alerts", { method: "POST" });
      const d = await r.json();
      setNote(r.ok ? `Test email sent to ${d.to}. Save your settings first if you just changed the address.` : d.error || "Couldn't send");
    } catch { setNote("Couldn't send"); }
    setBusy(false);
  };

  return (
    <div className="alert-tools">
      {!configured && (
        <div className="consent-warn" style={{ margin: "4px 0 10px" }}>
          <span>Email isn&apos;t configured on the server yet — set <b>RESEND_API_KEY</b> and <b>EMAIL_FROM</b>, then redeploy. Alerts are still logged below.</span>
        </div>
      )}
      <button type="button" className="btn-outline" disabled={busy} onClick={test}>{busy ? "Sending…" : "Send a test email"}</button>
      {note && <p className="alert-note">{note}</p>}
      {log && log.length > 0 && (
        <div className="alert-log">
          <div className="creq-list-title">Recent alerts</div>
          {log.map((a, i) => (
            <div className="alert-row" key={i}>
              <span className={`creq-status ${a.sent ? "done" : "muted"}`}>{a.sent ? "Sent" : "Not sent"}</span>
              <div style={{ minWidth: 0 }}>
                <b>{a.subject}</b>
                <span>{new Date(a.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {a.category}{!a.sent && a.error ? ` · ${a.error}` : ""}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Maintenance mode: switch on now or schedule a window, tell users, and
// lock every non-admin portal while it's active.
function MaintenancePanel({ s, loaded, busy, save, where, Feedback }) {
  const live = maintenanceFromSettings(s);
  const status = maintenanceStatus(live);
  const [mode, setMode] = useState(live.start ? "schedule" : "now");
  const [start, setStart] = useState(toLocalInput(live.start));
  const [end, setEnd] = useState(toLocalInput(live.end));
  const [message, setMessage] = useState(live.message || "");
  const [localErr, setLocalErr] = useState("");

  // Re-sync when saved settings change (after load / save).
  useEffect(() => {
    setMode(live.start ? "schedule" : "now");
    setStart(toLocalInput(live.start)); setEnd(toLocalInput(live.end)); setMessage(live.message || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.maintenance_enabled, s.maintenance_start, s.maintenance_end, s.maintenance_message]);

  const draft = () => {
    const st = mode === "schedule" ? fromLocalInput(start) : null;
    const en = fromLocalInput(end);
    if (mode === "schedule" && !st) return { error: "Pick the date and time maintenance should start." };
    if (st && new Date(st) <= new Date() && status === "off") return { error: "The start time is in the past — choose \"Start now\" or a later time." };
    if (en && new Date(en) <= new Date(st || Date.now())) return { error: "The expected end must be after the start." };
    return { patch: { maintenance_enabled: true, maintenance_start: st, maintenance_end: en, maintenance_message: message.trim() } };
  };

  const turnOn = async () => {
    setLocalErr("");
    const d = draft();
    if (d.error) { setLocalErr(d.error); return; }
    const now = !d.patch.maintenance_start;
    if (now && !window.confirm("Start maintenance now? Candidates, interviewers and employers will be locked out of their portals until you switch it off.")) return;
    await save(d.patch, "maint");
  };
  const update = async () => {
    setLocalErr("");
    const d = draft();
    if (d.error) { setLocalErr(d.error); return; }
    if (status === "scheduled" && !d.patch.maintenance_start && !window.confirm("Start maintenance now instead of at the scheduled time? Users will be locked out immediately.")) return;
    await save(d.patch, "maint");
  };
  const turnOff = async () => {
    if (!window.confirm("Turn maintenance off? Everyone gets their portal back and is notified that maintenance is complete.")) return;
    setLocalErr("");
    await save({ maintenance_enabled: false, maintenance_start: null, maintenance_end: null }, "maint");
  };

  const pill = status === "active" ? ["Active — users locked out", "mt-pill on"] : status === "scheduled" ? ["Scheduled", "mt-pill sched"] : ["Off", "mt-pill"];
  const preview = mode === "schedule" && start
    ? `NexIT-Africa will be unavailable ${fmtWindow({ start: fromLocalInput(start), end: fromLocalInput(end) })}.`
    : `NexIT-Africa is under maintenance${end ? ` until about ${fmtWhen(fromLocalInput(end))}` : ""}.`;

  return (
    <div className={`card pad set-card mt-panel ${status !== "off" ? "is-" + status : ""}`} id="maintenance">
      <div className="set-card-head">
        <h3 className="card-title" style={{ margin: 0 }}>Maintenance mode</h3>
        <span className={pill[1]}>{pill[0]}</span>
      </div>
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
        While maintenance is active, candidates, HR and Professional interviewers, and employers see a maintenance page
        instead of their portal and can&apos;t make any changes. The Admin portal keeps working. Everyone is notified on their
        dashboard when you schedule it, when it starts, and when you switch it off. It only ends when you turn it off —
        the end time is the estimate users see.
      </p>

      {status !== "off" && (
        <div className="mt-current">
          <b>{status === "active" ? "Maintenance is running" : "Maintenance is scheduled"}</b>
          <span>{fmtWindow(live) || "Started — no end time given"}</span>
        </div>
      )}

      <fieldset className="mt-when" disabled={!loaded || busy}>
        <legend>When</legend>
        <label className="consent-check">
          <input type="radio" name="mt-mode" checked={mode === "now"} onChange={() => setMode("now")} />
          <span>{status === "active" ? "Already running" : "Start now"}</span>
        </label>
        <label className="consent-check">
          <input type="radio" name="mt-mode" checked={mode === "schedule"} onChange={() => setMode("schedule")} />
          <span>Schedule for a date and time</span>
        </label>
      </fieldset>

      <div className="field-row">
        {mode === "schedule" && (
          <div className="field field-simple">
            <label htmlFor="mt-start">Starts</label>
            <input id="mt-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} disabled={!loaded || busy} />
          </div>
        )}
        <div className="field field-simple">
          <label htmlFor="mt-end">Expected back (optional)</label>
          <input id="mt-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} disabled={!loaded || busy} />
        </div>
      </div>
      <div className="field field-simple">
        <label htmlFor="mt-msg">Message to users (optional)</label>
        <textarea id="mt-msg" rows={3} maxLength={600} value={message} onChange={(e) => setMessage(e.target.value)} disabled={!loaded || busy}
          placeholder="e.g. We're upgrading our interview system. Bookings made before maintenance are not affected." />
      </div>

      <div className="mt-preview" aria-label="Notification preview">
        <span className="mt-preview-k">Users will see</span>
        <p>{preview}{message.trim() ? " " + message.trim() : ""}</p>
      </div>

      {localErr && <div className="auth-error" style={{ marginTop: 10 }}>{localErr}</div>}
      <Feedback at="maint" />

      <div className="mt-btns">
        {status === "off" ? (
          <button type="button" className="btn-solid" disabled={!loaded || busy} onClick={turnOn}>
            {busy && where === "maint" ? "Saving…" : mode === "schedule" ? "Schedule maintenance & notify users" : "Start maintenance now"}
          </button>
        ) : (
          <>
            <button type="button" className="btn-solid mt-off" disabled={!loaded || busy} onClick={turnOff}>
              {busy && where === "maint" ? "Saving…" : "Turn off maintenance"}
            </button>
            <button type="button" className="btn-outline" disabled={!loaded || busy} onClick={update}>Update details &amp; re-notify</button>
          </>
        )}
      </div>
    </div>
  );
}
