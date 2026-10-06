"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadNotificationPrefs, saveNotificationPrefs } from "@/lib/db";
import SettingsToggles from "@/components/SettingsToggles";
import TwoFactorSettings from "@/components/TwoFactorSettings";

const GROUPS = [
  {
    group: "Notifications",
    items: [
      { label: "New candidate on the board", on: true },
      { label: "Hire request status changes", on: true },
      { label: "Weekly board digest", on: false },
    ],
  },
  {
    group: "System & services",
    items: [
      { label: "Email notifications", on: true },
      { label: "SMS notifications", on: false },
      { label: "Product updates", on: true },
    ],
  },
];

const TABS = ["Notifications", "Security", "Privacy"];

export default function RecruiterSettings() {
  const [tab, setTab] = useState("Notifications");
  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
        <p>Manage your notifications, security and privacy.</p>
      </div>
      <div className="card pad" style={{ maxWidth: 720 }}>
        <div className="set-tabs">
          {TABS.map((t) => (
            <button key={t} className={`set-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === "Notifications" && <NotificationPrefs />}

        {tab === "Security" && (
          <div style={{ marginTop: 4 }}>
            <TwoFactorSettings />
          </div>
        )}

        {tab === "Privacy" && (
          <div style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.7 }}>
            <h4 style={{ color: "var(--navy)", margin: "0 0 8px" }}>Your privacy</h4>
            <p style={{ margin: "0 0 12px" }}>We only use your data to connect you with vetted candidates and to operate the NexIT platform. You control what candidates can see about your company.</p>
            <p style={{ margin: 0 }}>You can request deletion of your recruiter account at any time from your profile.</p>
          </div>
        )}
      </div>
    </>
  );
}

// Recruiter notification preferences — persisted to notification_prefs in real
// mode (same mechanism as the candidate portal). Demo mode stays local.
function NotificationPrefs() {
  const { supabaseEnabled } = useAuth();
  const [initial, setInitial] = useState(null);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef(null);

  useEffect(() => {
    if (!supabaseEnabled) { setInitial({}); return; }
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) { setInitial({}); return; }
      try {
        const { data: { user } } = await sb.auth.getUser();
        setInitial(user ? await loadNotificationPrefs(sb, user.id) : {});
      } catch { setInitial({}); }
    })();
  }, [supabaseEnabled]);

  const onChange = async (state) => {
    if (!supabaseEnabled) return;
    const sb = getBrowserSupabase();
    if (!sb) return;
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        await saveNotificationPrefs(sb, user.id, state);
        setSaved(true);
        clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaved(false), 1800);
      }
    } catch { /* ignore */ }
  };

  if (initial === null) return <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>;
  return (
    <>
      {supabaseEnabled && saved && <div className="role-note ok" style={{ marginBottom: 12 }}>Saved</div>}
      <SettingsToggles groups={GROUPS} initial={initial} onChange={onChange} />
    </>
  );
}
