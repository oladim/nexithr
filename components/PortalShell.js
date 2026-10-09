"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { IconSearch, IconBell, IconMenu, IconChevronRight, IconChevronDown, IconLogout, IconArrowLeft } from "@/components/Icons";
import BrandLogo from "@/components/BrandLogo";
import TopbarActions from "@/components/TopbarActions";
import ConsentBanner from "@/components/ConsentBanner";
import MaintenanceGate from "@/components/MaintenanceGate";

const NAV_KEY = "nexit.navgroups.v1";

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

  // Nav items may carry a `group` → collapsible sections, so long menus
  // (admin) fit on screen. The section holding the current page opens
  // automatically; other open/closed choices are remembered per browser.
  const grouped = nav.some((n) => n.group);
  const isActive = (href) => (href === nav[0].href ? pathname === href : pathname.startsWith(href));
  const sections = useMemo(() => {
    const out = [];
    for (const item of nav) {
      const g = item.group || null;
      const last = out[out.length - 1];
      if (last && last.group === g) last.items.push(item);
      else out.push({ group: g, items: [item] });
    }
    return out.map((sec) => ({ ...sec, hasActive: sec.items.some((i) => isActive(i.href)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav, pathname]);
  const [openGroups, setOpenGroups] = useState({});
  useEffect(() => {
    try { setOpenGroups(JSON.parse(localStorage.getItem(NAV_KEY) || "{}")); } catch { /* private mode */ }
  }, []);
  // Navigating into a closed section opens it.
  useEffect(() => {
    const active = sections.find((sec) => sec.group && sec.hasActive);
    if (active && openGroups[active.group] === false) toggleGroup(active.group, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  // Accordion: opening a section closes the others, so the menu stays short.
  const toggleGroup = (g, val) => setOpenGroups((cur) => {
    let next;
    if (val) {
      next = {};
      for (const sec of sections) if (sec.group) next[sec.group] = sec.group === g;
    } else {
      next = { ...cur, [g]: false };
    }
    try { localStorage.setItem(NAV_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    return next;
  });

  if (!hydrated || !user) return null;

  const renderItem = ({ href, label, Icon }) => (
    <Link key={href} href={href} className={`nav-item ${isActive(href) ? "active" : ""}`} aria-current={isActive(href) ? "page" : undefined}>
      <Icon />
      {label}
    </Link>
  );

  const initials = (user.name || "U").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""} ${grouped ? "grouped" : ""}`}>
        <div className="sidebar-brand">
          <Link href="/" aria-label="NexIT-Africa home" className="brand-link"><BrandLogo height={32} /></Link>
        </div>
        {badge && (
          <div style={{ padding: "0 8px 12px" }}>
            <span className={`role-badge ${badgeClass}`}>{badge}</span>
          </div>
        )}
        <nav className="sidebar-nav" aria-label="Main">
          {sections.map((sec) => {
            if (!sec.group) return sec.items.map(renderItem);
            const isOpen = openGroups[sec.group] ?? sec.hasActive;
            const id = `navgrp-${sec.group.replace(/\W+/g, "-").toLowerCase()}`;
            return (
              <div className={`nav-group ${isOpen ? "open" : ""} ${sec.hasActive ? "has-active" : ""}`} key={sec.group}>
                <button type="button" className="nav-group-head" aria-expanded={isOpen} aria-controls={id} onClick={() => toggleGroup(sec.group, !isOpen)}>
                  <span>{sec.group}</span>
                  {!isOpen && sec.hasActive && <span className="nav-group-dot" aria-hidden="true" />}
                  <span className="nav-group-count" aria-hidden="true">{sec.items.length}</span>
                  <IconChevronDown width={16} height={16} className="nav-group-chev" aria-hidden="true" />
                </button>
                {isOpen && <div className="nav-group-items" id={id}>{sec.items.map(renderItem)}</div>}
              </div>
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
