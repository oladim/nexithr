"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";
import { IconClock } from "@/components/Icons";
import { maintenanceStatus, fmtWhen, fmtWindow, readDemoMaintenance } from "@/lib/maintenance";

// Live maintenance state: polls the server (or localStorage in demo mode),
// re-checks when the tab regains focus, and re-evaluates the clock so a
// scheduled window turns active on time without a reload.
export function useMaintenance() {
  const { supabaseEnabled } = useAuth();
  const [m, setM] = useState(null);
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    if (!supabaseEnabled) { setM(readDemoMaintenance() || { enabled: false }); return; }
    try {
      const r = await fetch("/api/maintenance", { cache: "no-store" });
      const d = await r.json();
      if (r.ok) setM(d.maintenance || { enabled: false });
    } catch { /* keep last known state */ }
  }, [supabaseEnabled]);

  useEffect(() => {
    load();
    const poll = setInterval(load, 60000);
    const tick = setInterval(() => setTick((t) => t + 1), 15000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("nexit:maintenance", onFocus);
    window.addEventListener("storage", onFocus);
    return () => { clearInterval(poll); clearInterval(tick); window.removeEventListener("focus", onFocus); window.removeEventListener("nexit:maintenance", onFocus); window.removeEventListener("storage", onFocus); };
  }, [load]);

  return { m, status: maintenanceStatus(m), reload: load };
}

/**
 * Wraps a portal's page content.
 *  - Scheduled → heads-up banner; the portal keeps working.
 *  - Active    → candidates, interviewers and employers get a full-screen
 *                maintenance page instead of the portal until an admin
 *                switches maintenance off. Admins just see a reminder.
 */
export default function MaintenanceGate({ admin = false, children }) {
  const { m, status, reload } = useMaintenance();

  if (admin) {
    return (
      <>
        {status !== "off" && (
          <div className={`mt-banner ${status === "active" ? "is-active" : ""}`} role="status">
            <IconClock width={18} height={18} aria-hidden="true" />
            <span>
              {status === "active"
                ? <><b>Maintenance mode is ON.</b> Candidates, interviewers and employers are locked out until you switch it off.</>
                : <><b>Maintenance scheduled</b> {fmtWindow(m)}. Users have been notified.</>}
            </span>
            <Link href="/admin/settings#maintenance" className="mt-banner-btn">Manage</Link>
          </div>
        )}
        {children}
      </>
    );
  }

  if (status === "active") return <MaintenanceScreen m={m} onCheck={reload} />;

  return (
    <>
      {status === "scheduled" && (
        <div className="mt-banner" role="status">
          <IconClock width={18} height={18} aria-hidden="true" />
          <span>
            <b>Scheduled maintenance</b> {fmtWindow(m)}. You won&apos;t be able to use your portal during this time — please save your work before it starts.
            {m?.message ? <> {m.message}</> : null}
          </span>
        </div>
      )}
      {children}
    </>
  );
}

function MaintenanceScreen({ m, onCheck }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const check = async () => { setChecking(true); await onCheck(); setTimeout(() => setChecking(false), 600); };

  return (
    <div className="mt-screen" role="alertdialog" aria-modal="true" aria-labelledby="mt-title" aria-describedby="mt-desc">
      <div className="mt-card">
        <BrandLogo height={34} />
        <div className="mt-ico" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" width="30" height="30">
            <path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L4 16.7V20h3.3l5.3-5.3a4 4 0 0 0 5.1-5.4l-2.4 2.4-2.6-.6-.6-2.6 2.6-2.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 id="mt-title">We&apos;re doing some maintenance</h1>
        <p id="mt-desc">
          NexIT-Africa is temporarily unavailable while we make improvements. Your account, CV, results and
          training progress are safe — nothing is lost.
        </p>
        {m?.message && <p className="mt-msg">{m.message}</p>}
        <dl className="mt-times">
          {m?.start && <div><dt>Started</dt><dd>{fmtWhen(m.start)}</dd></div>}
          <div><dt>Expected back</dt><dd>{m?.end ? fmtWhen(m.end) : "Shortly"}</dd></div>
        </dl>
        <p className="mt-auto">This page checks automatically and reopens your portal as soon as we&apos;re done.</p>
        <div className="mt-actions">
          <button type="button" className="btn-solid" onClick={check} disabled={checking}>{checking ? "Checking…" : "Check again"}</button>
          <button type="button" className="btn-outline" onClick={() => { logout(); router.replace("/login"); }}>Log out</button>
        </div>
        <p className="mt-help">Need help? <a href="mailto:support@nexitafrica.com">support@nexitafrica.com</a></p>
      </div>
    </div>
  );
}
