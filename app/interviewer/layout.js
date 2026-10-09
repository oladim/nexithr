"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import {
  IconGrid,
  IconCalendar,
  IconCard,
  IconBell,
  IconLogout,
  IconSearch,
  IconMenu,
  IconChevronRight,
  IconUser,
  IconGear,
} from "@/components/Icons";
import StaffGate from "@/components/StaffGate";
import TwoFactorGate from "@/components/TwoFactorGate";
import BrandLogo from "@/components/BrandLogo";
import TopbarActions from "@/components/TopbarActions";
import ConsentBanner from "@/components/ConsentBanner";
import MaintenanceGate from "@/components/MaintenanceGate";

const NAV = [
  { href: "/interviewer", label: "Dashboard", Icon: IconGrid },
  { href: "/interviewer/interview", label: "Interview", Icon: IconCalendar },
  { href: "/interviewer/earnings", label: "Earnings", Icon: IconCard },
  { href: "/interviewer/notifications", label: "Notifications", Icon: IconBell },
  { href: "/interviewer/profile", label: "Profile", Icon: IconUser },
  { href: "/interviewer/settings", label: "Settings", Icon: IconGear },
];

export default function InterviewerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrated, interviewerKind, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);
  useEffect(() => setOpen(false), [pathname]);

  if (!hydrated || !user) return null;

  const initials = (user.name || "I").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const isHR = interviewerKind === "HR";

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Link href="/" aria-label="NexIT-Africa home" className="brand-link"><BrandLogo height={32} /></Link>
        </div>
        <div style={{ padding: "0 8px 12px" }}>
          <span className={`role-badge ${isHR ? "hr" : ""}`}>{interviewerKind} Interviewer</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ href, label, Icon }) => {
            const active = href === "/interviewer" ? pathname === "/interviewer" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`}>
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-foot">
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
              <span>{interviewerKind} Interviewer</span>
            </div>
          </div>
          <TopbarActions nav={NAV} notificationsHref="/interviewer/notifications" profileHref="/interviewer/profile" settingsHref="/interviewer/settings" securityHref="/interviewer/settings?view=security" />
        </header>
        <div className="content"><ConsentBanner href="/interviewer/settings?view=privacy" /><MaintenanceGate><TwoFactorGate><StaffGate>{children}</StaffGate></TwoFactorGate></MaintenanceGate></div>
      </div>
    </div>
  );
}
