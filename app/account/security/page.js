"use client";

import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import TwoFactorSettings from "@/components/TwoFactorSettings";

// Standalone security page reachable by any signed-in user (any portal).
export default function SecurityPage() {
  const { user, hydrated, role } = useAuth();
  const home = role === "interviewer" ? "/interviewer" : role === "recruiter" ? "/recruiter" : role === "admin" ? "/admin" : "/dashboard";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
      <div className="page-head">
        <h1>Account security</h1>
        <p>Manage two-factor authentication for your NexIT-Africa account.</p>
      </div>

      {hydrated && !user ? (
        <div className="feedback-card"><p style={{ margin: 0 }}>Please <Link href="/login" className="link">sign in</Link> to manage your security settings.</p></div>
      ) : (
        <TwoFactorSettings />
      )}

      <div style={{ marginTop: 20 }}>
        <Link href={home} className="btn-outline">Back to my portal</Link>
      </div>
    </div>
  );
}
