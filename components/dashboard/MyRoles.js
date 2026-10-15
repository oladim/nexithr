"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import RolePicker from "@/components/RolePicker";
import { startPayment } from "@/lib/billing";
import { CATALOG_LABELS, LEVELS } from "@/lib/roleCatalog";
import { ROLE_LABELS } from "@/lib/db";
import { IconPlus, IconSwap, IconCheck, IconX, IconBriefcase, IconLock } from "@/components/Icons";

const levelLabel = (k) => LEVELS.find((l) => l.key === k)?.label || "";

/**
 * My roles — every role the candidate is pursuing, each with its own CV,
 * interviews and certificate. Switch the active role, or (subscribers) add
 * another one up to the admin-set limit.
 */
export default function MyRoles() {
  const { supabaseEnabled, app, signup, updateSignup } = useAuth();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);
  const [pick, setPick] = useState("");

  const load = async () => {
    if (!supabaseEnabled) {
      const k = app.candidate?.target_role || signup?.targetRole || "";
      setData({ tracks: k ? [{ roleKey: k, title: CATALOG_LABELS[k] || ROLE_LABELS[k] || k, active: true, step: null }] : [], max: 3, subscribed: false, canAdd: !app.cv, reason: app.cv ? "subscribe" : null, firstRoleFree: !app.cv, demo: true });
      return;
    }
    try {
      const r = await fetch("/api/me/roles", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Couldn't load your roles");
      setData(j);
    } catch (e) { setErr(e.message); setData({ tracks: [], unavailable: true }); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [supabaseEnabled]);
  // Back from paying: pre-select the role they chose before subscribing.
  useEffect(() => {
    if (!data?.subscribed) return;
    try {
      const k = sessionStorage.getItem("nexit.pendingRole");
      if (k) { sessionStorage.removeItem("nexit.pendingRole"); setPick(k); setAdding(true); }
    } catch { /* ignore */ }
  }, [data?.subscribed]);

  const post = async (payload, label) => {
    setErr(""); setBusy(label);
    try {
      const r = await fetch("/api/me/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Something went wrong");
      return j;
    } catch (e) { setErr(e.message); return null; } finally { setBusy(""); }
  };

  const switchTo = async (t) => {
    if (!window.confirm(`Switch your active role to ${t.title}? Your progress on your current role is kept — you can switch back any time.`)) return;
    if (await post({ action: "switch", roleKey: t.roleKey }, `switch:${t.roleKey}`)) window.location.reload();
  };
  const remove = async (t) => {
    if (!window.confirm(`Remove ${t.title} from My roles? Any CV you uploaded for it is deleted.`)) return;
    if (await post({ action: "remove", roleKey: t.roleKey }, `remove:${t.roleKey}`)) load();
  };
  const add = async () => {
    if (!pick) return;
    if (!supabaseEnabled) { updateSignup?.({ targetRole: pick }); window.location.assign("/dashboard/cv-upload"); return; }
    const j = await post({ action: "add", roleKey: pick }, "add");
    if (j) { setAdding(false); window.location.assign("/dashboard/cv-upload"); }
  };
  const subscribe = async () => {
    try { if (pick) sessionStorage.setItem("nexit.pendingRole", pick); } catch { /* ignore */ }
    setBusy("sub");
    const r = await startPayment({ purpose: "subscription" });
    if (!r?.ok) { if (r?.error) setErr(r.error); setBusy(""); }
  };

  if (!data || data.unavailable && !err) return null;
  const tracks = data.tracks || [];
  const others = tracks.filter((t) => !t.active);
  const taken = new Set(tracks.map((t) => t.roleKey));
  // Nothing applied for yet → choosing a role is free (it replaces the current one).
  const free = !!data.firstRoleFree;
  const canGo = free || data.subscribed;
  const current = tracks.find((t) => t.active);

  return (
    <section className="my-roles card pad" id="my-roles" aria-label="My roles">
      <div className="mr-head">
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>My roles</h3>
          <p className="mr-sub">
            {tracks.length > 1
              ? "Each role has its own CV, interviews and certificate. Switch roles to work on another one."
              : "Subscribers can apply for more than one role — each with its own CV, interviews and certificate."}
          </p>
        </div>
        {data.max && <span className="mr-count">{tracks.length} of {data.max}</span>}
      </div>

      <ul className="mr-list">
        {tracks.map((t) => (
          <li key={t.roleKey} className={`mr-item ${t.active ? "active" : ""}`}>
            <span className="mr-ic"><IconBriefcase width={16} height={16} /></span>
            <div className="mr-main">
              <b>{t.title}</b>
              <small>
                {t.active ? <span className="mr-badge">Active</span> : null}
                {t.step ? `Stage ${t.step.stage} of ${t.step.of} · ${t.step.title}` : t.level ? levelLabel(t.level) : ""}
                {t.certificateId ? " · Certified" : ""}
                {!t.open && !t.active ? " · Closed for new applications" : ""}
              </small>
            </div>
            {!t.active && (
              <div className="mr-actions">
                <button className="mini-btn" disabled={!!busy} onClick={() => switchTo(t)}>
                  <IconSwap width={13} height={13} /> {busy === `switch:${t.roleKey}` ? "Switching…" : "Switch to"}
                </button>
                {!t.started && (
                  <button className="mini-btn ghost" disabled={!!busy} onClick={() => remove(t)} aria-label={`Remove ${t.title}`} title="Remove this role">
                    <IconX width={13} height={13} />
                  </button>
                )}
              </div>
            )}
            {t.active && <span className="mr-tick" aria-hidden="true"><IconCheck width={14} height={14} /></span>}
          </li>
        ))}
      </ul>

      {err && <p className="auth-error" role="alert" style={{ margin: "8px 0 0" }}>{err}</p>}

      {!adding && (
        <div className="mr-foot">
          {free ? (
            <>
              <button className="btn-outline" onClick={() => setAdding(true)} disabled={!!busy}>
                <IconSwap width={14} height={14} /> {current ? "Choose a different role" : "Choose your role"}
              </button>
              <span className="mr-note">
                {current
                  ? <>You haven&apos;t applied for {current.title} yet, so you can change it for free. A subscription is only needed to pursue a second role alongside one you&apos;ve applied for.</>
                  : "Pick the role you want to apply for — it's free."}
              </span>
            </>
          ) : data.reason === "limit" ? (
            <span className="mr-note">You&apos;re pursuing the maximum of {data.max} roles.{others.some((t) => !t.started) ? " Remove one you haven't started to add another." : ""}</span>
          ) : (
            <>
              <button className="btn-outline" onClick={() => setAdding(true)} disabled={!!busy}>
                {data.subscribed ? <IconPlus width={14} height={14} /> : <IconLock width={14} height={14} />} Add another role
              </button>
              {!data.subscribed && (
                <span className="mr-note">You can apply for another role too — each gets its own CV review, interviews and certificate. Starting a second role is included in the annual subscription.</span>
              )}
            </>
          )}
        </div>
      )}

      {adding && (
        <div className="mr-add">
          <p className="mr-add-h">{free
            ? (current ? `Choose the role you'd rather apply for. It replaces ${current.title}, and you'll upload your CV for it next.` : "Choose the role you want to apply for. You'll upload your CV for it next.")
            : "Choose the role to add. It becomes your active role, and you'll upload a CV tailored to it next."}</p>
          <RolePicker variant="compact" value={pick} onChange={(k) => setPick(taken.has(k) ? "" : k)} />
          {pick && taken.has(pick) && <p className="auth-error">That role is already in My roles.</p>}
          <div className="mr-add-actions">
            <button className="btn-outline" onClick={() => { setAdding(false); setPick(""); }} disabled={busy === "add"}>Cancel</button>
            {canGo ? (
              <button className="btn-solid" onClick={add} disabled={!pick || busy === "add"}>{busy === "add" ? "Saving…" : free ? "Use this role & upload CV" : "Add role & upload CV"}</button>
            ) : (
              <button className="btn-solid" onClick={subscribe} disabled={!pick || !!busy}>
                <IconLock width={14} height={14} /> {busy === "sub" ? "Starting…" : "Subscribe to start this role"}
              </button>
            )}
          </div>
          {!canGo && pick && (
            <p className="mr-lock-note">
              <b>{CATALOG_LABELS[pick] || pick}</b> will be ready to start as soon as you subscribe. The subscription also gives unlimited AI interview retakes, suggested training, and the option to upload a new CV after your AI interview has started.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
