"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadNotificationPrefs, saveNotificationPrefs } from "@/lib/db";
import SettingsToggles from "@/components/SettingsToggles";
import SettingsHub from "@/components/SettingsHub";

// Candidate notification preferences (matches Figma groups).
const NOTIF_GROUPS = [
  {
    group: "Common",
    items: [
      { label: "General Notification", on: true },
      { label: "Sound", on: false },
      { label: "Vibrate", on: true },
    ],
  },
  {
    group: "System & services update",
    items: [
      { label: "App Updates", on: false },
      { label: "Bill Reminder", on: true },
      { label: "Promotion", on: true },
      { label: "Discount Available", on: false },
      { label: "Payment Request", on: false },
    ],
  },
  {
    group: "Others",
    items: [
      { label: "New Service Available", on: false },
      { label: "New Tips Available", on: true },
    ],
  },
];

export default function SettingsPage() {
  return (
    <SettingsHub
      audience="candidate"
      profileHref="/dashboard/profile"
      dataNoticeHref="/dashboard/data-privacy"
      renderNotifications={() => <NotificationPrefs />}
    />
  );
}

// Candidate notification preferences — persisted to notification_prefs (real
// mode). Toggles save immediately; in demo mode they stay local.
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
      <SettingsToggles groups={NOTIF_GROUPS} initial={initial} onChange={onChange} />
    </>
  );
}
