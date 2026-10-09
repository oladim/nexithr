"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { IconSearch, IconBell, IconMenu, IconChevronRight, IconLogout, IconArrowLeft } from "@/components/Icons";
import BrandLogo from "@/components/BrandLogo";
import TopbarActions from "@/components/TopbarActions";
import ConsentBanner from "@/components/ConsentBanner";
import MaintenanceGate from "@/components/MaintenanceGate";

// Reusable authenticated shell (sidebar + topbar) for the recruiter and admin
// portals. `nav` = [{href,label,Icon}], `badge` = role label.
export default function PortalShell({ nav, badge, badgeClass = "", roleLabel, profileHref, settingsHref, notificationsHref, maintenanceAdmin = false, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrated, logout, exitPortal } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);
  useEffect(() => setOpen(false), [pathname]);

  if (!hydrated || !user) return null;

  const initials = (user.name || "U").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const home = nav[0].href;

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Link href="/" aria-label="NexIT-Africa home" className="brand-link"><BrandLogo height={32} /></Link>
        </div>
        {badge && (
          <div style={{ padding: "0 8px 12px" }}>
            <span className={`role-badge ${badgeClass}`}>{badge}</span>
          </div>
        )}
        <nav className="sidebar-nav">
          {nav.map(({ href, label, Icon }) => {
            const active = href === home ? pathname === home : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`}>
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <button className="nav-item" onClick={() => { exitPortal(); router.push("/login"); }}>
            <IconArrowLeft />
            Switch role
          </button>
          <button className="nav-item" onClick={() => { logout(); router.replace("/login"); }}>
            <IconLogout />
            Logout
          </button>
        </div>
      </aside>

      {open && <div className="scrim show" onClick={() => setOpen(false)} />}

      <div className="main-area">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <button className="icon-btn burger" onClick={() => setOpen(true)} aria-label="Open menu">
              <IconMenu />
            </button>
            <div className="who">
              <strong>{user.name}</strong>
              <span>{roleLabel}</span>
            </div>
          </div>
          <TopbarActions nav={nav} profileHref={profileHref} settingsHref={settingsHref} notificationsHref={notificationsHref} />
        </header>
        <div className="content"><ConsentBanner href={profileHref?.startsWith("/recruiter") ? "/recruiter/settings?tab=Privacy" : "/privacy"} /><MaintenanceGate admin={maintenanceAdmin}>{children}</MaintenanceGate></div>
      </div>
    </div>
  );
}
