"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import TwoFactorSettings from "@/components/TwoFactorSettings";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import PrivacyConsent from "@/components/PrivacyConsent";
import TermsOfService from "@/components/TermsOfService";
import SettingsCrumb from "@/components/SettingsCrumb";
import HelpSupport from "@/components/support/HelpSupport";
import ContactUs from "@/components/support/ContactUs";
import { IconUser, IconBell, IconLock, IconChat, IconFileText, IconChevronRight, IconChevronDown } from "@/components/Icons";

const VIEWS = {
  security: "Security & 2FA",
  notifications: "Notifications",
  privacy: "Privacy policy",
  terms: "Terms of service",
  contact: "Contact us",
};
const LEGACY_TABS = { Privacy: "privacy", Notification: "notifications" };

/**
 * Settings home shared by the candidate and interviewer portals.
 * Each item opens as "Settings › <item>" — either inside this page (with
 * ?view=… so the browser Back button works) or as its own page that shows
 * the same trail back to Settings.
 *
 * props:
 *   audience           "candidate" | "interviewer"
 *   profileHref        page for "Edit profile information"
 *   notificationsHref  page for notifications (else renderNotifications is used)
 *   renderNotifications () => JSX shown in the Notifications view
 *   dataNoticeHref     optional "Data & recording notice" page
 */
export default function SettingsHub({ audience = "candidate", profileHref, notificationsHref, renderNotifications, dataNoticeHref }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signup } = useAuth();
  const [view, setView] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const readView = useCallback(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const v = q.get("view") || LEGACY_TABS[q.get("tab")] || null;
      setView(v && VIEWS[v] ? v : null);
      if (q.get("help") === "1") setHelpOpen(true);
    } catch { setView(null); }
  }, []);
  useEffect(() => {
    readView();
    window.addEventListener("popstate", readView);
    return () => window.removeEventListener("popstate", readView);
  }, [readView]);

  const go = (v) => {
    setView(v);
    router.push(v ? `${pathname}?view=${v}` : pathname, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const name = user?.name || [signup.firstName, signup.lastName].filter(Boolean).join(" ") || "Your name";
  const email = user?.email || signup.email || "—";
  const initials = name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "U";
  const withFrom = (href) => `${href}${href.includes("?") ? "&" : "?"}from=${encodeURIComponent(pathname)}`;

  // ---- A single settings item ----
  if (view) {
    return (
      <>
        <SettingsCrumb current={VIEWS[view]} settingsHref={pathname} onBack={() => go(null)} />
        <div className="page-head">
          <h1>{VIEWS[view]}</h1>
        </div>
        <div className="card pad set-sub">
          {view === "security" && <TwoFactorSettings />}
          {view === "notifications" && (renderNotifications ? renderNotifications() : null)}
          {view === "privacy" && <><PrivacyPolicy /><PrivacyConsent /></>}
          {view === "terms" && <TermsOfService />}
          {view === "contact" && <ContactUs />}
        </div>
      </>
    );
  }

  // ---- Settings home ----
  const groups = [
    [
      profileHref && { icon: <IconUser width={17} height={17} />, label: "Edit profile information", href: withFrom(profileHref) },
      notificationsHref
        ? { icon: <IconBell width={17} height={17} />, label: "Notifications", href: withFrom(notificationsHref) }
        : { icon: <IconBell width={17} height={17} />, label: "Notifications", view: "notifications" },
      { icon: <IconLock width={17} height={17} />, label: "Security & 2FA", view: "security" },
    ],
    [
      dataNoticeHref && { icon: <IconFileText width={17} height={17} />, label: "Data & recording notice", href: withFrom(dataNoticeHref) },
      { icon: <IconFileText width={17} height={17} />, label: "Privacy policy", view: "privacy" },
      { icon: <IconFileText width={17} height={17} />, label: "Terms of service", view: "terms" },
    ],
    [
      { icon: <IconChat width={17} height={17} />, label: "Help & support", help: true },
      { icon: <IconChat width={17} height={17} />, label: "Contact us", view: "contact" },
    ],
  ].map((g) => g.filter(Boolean));

  const Row = ({ r }) => {
    const inner = (
      <>
        <span className="smr-ic">{r.icon}</span>
        <span className="smr-label">{r.label}</span>
        <span className={`smr-arrow ${r.help && helpOpen ? "up" : ""}`}>
          {r.help ? <IconChevronDown width={16} height={16} /> : <IconChevronRight width={16} height={16} />}
        </span>
      </>
    );
    if (r.href) return <Link className="set-menu-row" href={r.href}>{inner}</Link>;
    if (r.help) return <button type="button" className="set-menu-row" aria-expanded={helpOpen} aria-controls="help-panel" onClick={() => setHelpOpen((o) => !o)}>{inner}</button>;
    return <button type="button" className="set-menu-row" onClick={() => go(r.view)}>{inner}</button>;
  };

  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
        <p>Your account, security, privacy and support.</p>
      </div>
      <div className="card pad set-home">
        <div className="set-profile">
          <div className="sp-av"><span className="init">{initials}</span></div>
          <h4>{name}</h4>
          <p>{email}</p>
        </div>
        {groups.map((g, gi) => (
          <div className="set-menu-group" key={gi}>
            {g.map((r) => (
              <div key={r.label}>
                <Row r={r} />
                {r.help && helpOpen && (
                  <div id="help-panel" className="set-dropdown">
                    <HelpSupport audience={audience} onContact={() => go("contact")} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
