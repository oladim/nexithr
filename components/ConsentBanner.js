"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";

// Shown at the top of a portal when the user hasn't accepted the CURRENT
// Privacy Policy (e.g. after it was updated). Doesn't block the app.
export default function ConsentBanner({ href = "/privacy" }) {
  const { supabaseEnabled, user } = useAuth();
  const [need, setNeed] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled || !user) return;
    const check = () => fetch("/api/me/consent", { cache: "no-store" }).then((r) => r.json())
      .then((d) => { setNeed(d && d.accepted === false); setUpdated(!!d?.acceptedVersion); }).catch(() => {});
    check();
    window.addEventListener("nexit:consent", check);
    return () => window.removeEventListener("nexit:consent", check);
  }, [supabaseEnabled, user]);

  if (!need) return null;
  return (
    <div className="consent-banner" role="status">
      <span>{updated ? "We've updated our Privacy Policy." : "Please review and accept our Privacy Policy."}</span>
      <Link href={href} className="consent-banner-btn">Review &amp; accept</Link>
    </div>
  );
}
