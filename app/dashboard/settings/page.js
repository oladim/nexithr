"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadNotificationPrefs, saveNotificationPrefs } from "@/lib/db";
import SettingsToggles from "@/components/SettingsToggles";
import TwoFactorSettings from "@/components/TwoFactorSettings";
import {
  IconUser,
  IconBell,
  IconGrid,
  IconLock,
  IconMonitor,
  IconChat,
  IconFileText,
  IconChevronRight,
} from "@/components/Icons";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import PrivacyConsent from "@/components/PrivacyConsent";

const TABS = ["Settings", "Notification", "Privacy"];

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
  const { user, signup } = useAuth();
  const [tab, setTab] = useState("Settings");
  useEffect(() => {
    try { const t = new URLSearchParams(window.location.search).get("tab"); if (t && TABS.includes(t)) setTab(t); } catch { /* ignore */ }
  }, []);

  const name = user?.name || [signup.firstName, signup.lastName].filter(Boolean).join(" ") || "Your name";
  const email = user?.email || signup.email || "—";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  // Each row is either a link (href) or an in-page action (onClick).
  const menu = [
    {
      rows: [
        { icon: <IconUser width={17} height={17} />, label: "Edit profile information", href: "/dashboard/profile" },
        { icon: <IconBell width={17} height={17} />, label: "Notifications", onClick: () => setTab("Notification") },
        { icon: <IconLock width={17} height={17} />, label: "Security & 2FA", href: "/account/security" },
      ],
    },
    {
      rows: [
        { icon: <IconFileText width={17} height={17} />, label: "Data & recording notice", href: "/dashboard/data-privacy" },
        { icon: <IconFileText width={17} height={17} />, label: "Privacy policy", onClick: () => setTab("Privacy") },
      ],
    },
    {
      rows: [
        { icon: <IconChat width={17} height={17} />, label: "Help & support", href: "mailto:support@nexitafrica.com" },
        { icon: <IconChat width={17} height={17} />, label: "Contact us", href: "mailto:support@nexitafrica.com" },
      ],
    },
  ];

  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
        <p>Account, notification and privacy preferences.</p>
      </div>

      <div className="card pad" style={{ maxWidth: 760 }}>
        <div className="set-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`set-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Settings" && (
          <div>
            <div className="set-profile">
              <div className="sp-av">
                <span className="init">{initials}</span>
              </div>
              <h4>{name}</h4>
              <p>{email}</p>
            </div>

            {menu.map((group, gi) => (
              <div className="set-menu-group" key={gi}>
                {group.rows.map((r) => {
                  const inner = (
                    <>
                      <span className="smr-ic">{r.icon}</span>
                      <span className="smr-label">{r.label}</span>
                      {r.val && <span className="smr-val">{r.val}</span>}
                      <span className="smr-arrow"><IconChevronRight width={16} height={16} /></span>
                    </>
                  );
                  if (r.href) {
                    const external = r.href.startsWith("mailto:");
                    return external ? (
                      <a className="set-menu-row" key={r.label} href={r.href}>{inner}</a>
                    ) : (
                      <Link className="set-menu-row" key={r.label} href={r.href}>{inner}</Link>
                    );
                  }
                  return (
                    <button className="set-menu-row" key={r.label} onClick={r.onClick}>{inner}</button>
                  );
                })}
              </div>
            ))}

            <div style={{ marginTop: 20 }}>
              <TwoFactorSettings />
            </div>
          </div>
        )}

        {tab === "Notification" && <NotificationPrefs />}

        {tab === "Privacy" && (
          <div>
            <PrivacyPolicy />
            <PrivacyConsent />
          </div>
        )}
      </div>
    </>
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
