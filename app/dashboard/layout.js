"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import TwoFactorGate from "@/components/TwoFactorGate";
import {
  IconGrid,
  IconFileText,
  IconCalendar,
  IconCap,
  IconUser,
  IconGear,
  IconLogout,
  IconSearch,
  IconBell,
  IconMenu,
  IconChevronRight,
  IconBriefcase,
  IconStar,
} from "@/components/Icons";
import BrandLogo from "@/components/BrandLogo";
import TopbarActions from "@/components/TopbarActions";
import ConsentBanner from "@/components/ConsentBanner";
import MaintenanceGate from "@/components/MaintenanceGate";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: IconGrid },
  { href: "/dashboard/cv-upload", label: "CV Upload", Icon: IconFileText },
  { href: "/dashboard/interview", label: "Interview", Icon: IconCalendar },
  { href: "/dashboard/training", label: "Training", Icon: IconCap },
  { href: "/dashboard/jobs", label: "Job Board", Icon: IconBriefcase },
  { href: "/dashboard/certificate", label: "Certificate", Icon: IconStar },
  { href: "/dashboard/profile", label: "Profile", Icon: IconUser },
  { href: "/dashboard/settings", label: "Settings", Icon: IconGear },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrated, logout } = useAuth();
  const [open, setOpen] = useState(false); // mobile drawer

  // Route guard — bounce to login if there's no session.
  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  // Close the drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  if (!hydrated || !user) return null;

  const initials = (user.name || "C")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Link href="/" aria-label="NexIT-Africa home" className="brand-link"><BrandLogo height={32} /></Link>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ href, label, Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`}>
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <button
            className="nav-item"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
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
              <span>Candidate</span>
            </div>
          </div>
          <TopbarActions nav={NAV} profileHref="/dashboard/profile" settingsHref="/dashboard/settings" securityHref="/dashboard/settings?view=security" />
        </header>

        <div className="content"><ConsentBanner href="/dashboard/settings?view=privacy" /><MaintenanceGate><TwoFactorGate>{children}</TwoFactorGate></MaintenanceGate></div>
      </div>
    </div>
  );
}
