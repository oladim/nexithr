"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconChevronRight, IconArrowLeft } from "@/components/Icons";

// Only these may be used as a "back to settings" target (no open redirects).
const SETTINGS_PATHS = ["/dashboard/settings", "/interviewer/settings", "/recruiter/settings", "/admin/settings"];

/**
 * "Settings › My profile" trail for pages opened from Settings.
 *  - settingsHref: fixed parent (e.g. a page that always lives under Settings)
 *  - or reads ?from=<settings path> so shared pages (Security & 2FA) know
 *    which portal's Settings to go back to.
 *  - onlyWhenFrom: show nothing unless the page was opened from Settings
 *    (for pages also reachable from the sidebar, like My profile).
 */
export default function SettingsCrumb({ current, settingsHref, onlyWhenFrom = false, onBack }) {
  const [from, setFrom] = useState(null);
  useEffect(() => {
    try {
      const f = new URLSearchParams(window.location.search).get("from");
      if (f && SETTINGS_PATHS.includes(f)) setFrom(f);
    } catch { /* ignore */ }
  }, []);
  const href = from || settingsHref;
  if (!href || (onlyWhenFrom && !from)) return null;

  return (
    <nav className="set-crumb" aria-label="Breadcrumb">
      {onBack ? (
        <button type="button" className="set-crumb-back" onClick={onBack} aria-label="Back to Settings"><IconArrowLeft width={16} height={16} /></button>
      ) : (
        <Link href={href} className="set-crumb-back" aria-label="Back to Settings"><IconArrowLeft width={16} height={16} /></Link>
      )}
      <ol>
        <li>{onBack ? <button type="button" onClick={onBack}>Settings</button> : <Link href={href}>Settings</Link>}</li>
        <li aria-hidden="true" className="sep"><IconChevronRight width={14} height={14} /></li>
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}
