"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard/training", label: "Overview" },
  { href: "/dashboard/training/specific", label: "Specific Training" },
  { href: "/dashboard/training/suggested", label: "Suggested Training" },
];

export default function TrainingTabs() {
  const pathname = usePathname();
  return (
    <div className="train-tabs">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={`train-tab ${pathname === t.href ? "active" : ""}`}>
          {t.label}
        </Link>
      ))}
    </div>
  );
}
