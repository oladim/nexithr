"use client";

import PortalShell from "@/components/PortalShell";
import StaffGate from "@/components/StaffGate";
import TwoFactorGate from "@/components/TwoFactorGate";
import { IconGrid, IconPeople, IconUser, IconGear, IconBriefcase } from "@/components/Icons";

const NAV = [
  { href: "/recruiter", label: "Dashboard", Icon: IconGrid },
  { href: "/recruiter/candidates", label: "Candidate List", Icon: IconPeople },
  { href: "/recruiter/jobs", label: "Post a Job", Icon: IconBriefcase },
  { href: "/recruiter/profile", label: "Profile", Icon: IconUser },
  { href: "/recruiter/settings", label: "Settings", Icon: IconGear },
];

export default function RecruiterLayout({ children }) {
  return (
    <PortalShell nav={NAV} badge="Recruiter" roleLabel="Recruiter">
      <TwoFactorGate>
        <StaffGate>{children}</StaffGate>
      </TwoFactorGate>
    </PortalShell>
  );
}
