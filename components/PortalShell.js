"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { IconSearch, IconBell, IconMenu, IconChevronRight, IconLogout, IconArrowLeft } from "@/components/Icons";

// Reusable authenticated shell (sidebar + topbar) for the recruiter and admin
// portals. `nav` = [{href,label,Icon}], `badge` = role label.
export default function PortalShell({ nav, badge, badgeClass = "", roleLabel, children }) {
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
          <svg className="mk" viewBox="0 0 39 49" fill="none" aria-hidden="true">
            <path d="M4 45V9c0-2 2.4-3 3.9-1.6L31 30V4h4v36c0 2-2.4 3-3.9 1.6L8 18v27H4z" fill="#007bff" />
          </svg>
          <span className="nm">NexIT-Africa</span>
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
          <div className="acts">
            <span className="icon-btn"><IconSearch /></span>
            <span className="icon-btn"><IconBell /></span>
            <span className="avatar">
              <span className="pic">{initials}</span>
              <span className="nm2">{user.name}</span>
              <IconChevronRight width={16} height={16} style={{ color: "#9aa2ae" }} />
            </span>
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
