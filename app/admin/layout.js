"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PortalShell from "@/components/PortalShell";
import TwoFactorGate from "@/components/TwoFactorGate";
import { canOpenPath, permForPath } from "@/lib/permissions";
import { useAuth } from "@/components/context/AuthContext";
import { IconGrid, IconPeople, IconFileText, IconBell, IconGear, IconUploadCloud, IconCap, IconChart, IconBriefcase, IconStar, IconLock, IconCard } from "@/components/Icons";

// Each nav item carries the permission key that unlocks it (null = always).
const NAV = [
  { href: "/admin", label: "Dashboard", Icon: IconGrid, perm: null },
  { href: "/admin/cv-reviews", label: "CV Reviews", Icon: IconUploadCloud, perm: "cv_reviews", group: "Candidates" },
  { href: "/admin/interviews", label: "Interviews", Icon: IconChart, perm: "interviews", group: "Candidates" },
  { href: "/admin/ai-results", label: "AI Results", Icon: IconChart, perm: "ai_results", group: "Candidates" },
  { href: "/admin/role-requirements", label: "Role Requirements", Icon: IconCap, perm: "role_requirements", group: "Candidates" },
  { href: "/admin/specific-training", label: "Specific Training", Icon: IconCap, perm: "specific_training", group: "Training" },
  { href: "/admin/course-requests", label: "Course Requests", Icon: IconFileText, perm: "course_requests", group: "Training" },
  { href: "/admin/suggested-resources", label: "Suggested Resources", Icon: IconCap, perm: "suggested_resources", group: "Training" },
  { href: "/admin/jobs", label: "Job Board", Icon: IconBriefcase, perm: "jobs", group: "Jobs & payments" },
  { href: "/admin/hire-requests", label: "Hire Requests", Icon: IconBriefcase, perm: "hire_requests", group: "Jobs & payments" },
  { href: "/admin/payouts", label: "Payouts", Icon: IconCard, perm: "payouts", group: "Jobs & payments" },
  { href: "/admin/testimonials", label: "Testimonials", Icon: IconStar, perm: "testimonials", group: "Website" },
  { href: "/admin/landing", label: "Landing Page", Icon: IconGrid, perm: "landing", group: "Website" },
  { href: "/admin/staff-approvals", label: "Staff Approvals", Icon: IconPeople, perm: "staff_approvals", group: "People & system" },
  { href: "/admin/users", label: "Users & Groups", Icon: IconPeople, perm: "users", group: "People & system" },
  { href: "/admin/requests", label: "Requests", Icon: IconFileText, perm: "requests", group: "People & system" },
  { href: "/admin/notifications", label: "Notifications", Icon: IconBell, perm: "notifications", group: "People & system" },
  { href: "/admin/settings", label: "Settings", Icon: IconGear, perm: "settings", group: "People & system" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { supabaseEnabled } = useAuth();
  const [access, setAccess] = useState(null); // null = loading
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled) { setLoaded(true); return; } // demo: full access
    (async () => {
      try {
        const r = await fetch("/api/me/permissions");
        const d = await r.json();
        if (r.ok) setAccess(d);
      } catch { /* leave null */ }
      setLoaded(true);
    })();
  }, [supabaseEnabled]);

  // Demo mode (or until we know) shows the full nav.
  const nav = (!supabaseEnabled || !access)
    ? NAV
    : NAV.filter((n) => n.perm === null || canOpenPath(access, n.href));

  const blocked = supabaseEnabled && loaded && access && !canOpenPath(access, pathname);

  return (
    <PortalShell maintenanceAdmin nav={nav} badge="NexIT Admin" badgeClass="hr" roleLabel={access?.superAdmin === false ? "Admin (group)" : "Administrator"} settingsHref={nav.some((n) => n.href === "/admin/settings") ? "/admin/settings" : undefined}>
      <TwoFactorGate>
        {blocked ? <AccessDenied permKey={permForPath(pathname)} /> : children}
      </TwoFactorGate>
    </PortalShell>
  );
}

function AccessDenied() {
  return (
    <div className="assess" style={{ maxWidth: 560, margin: "40px auto" }}>
      <div className="feedback-card" style={{ background: "rgba(255,77,77,.08)", borderColor: "rgba(255,77,77,.3)" }}>
        <h5 style={{ marginTop: 0 }}>
          <IconLock width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} /> No access to this section
        </h5>
        <p style={{ margin: 0 }}>
          Your admin group doesn&apos;t include permission for this feature. Ask a super-admin to grant it, or use a section from the menu that you do have access to.
        </p>
      </div>
    </div>
  );
}
