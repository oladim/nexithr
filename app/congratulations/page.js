"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { IconCheck } from "@/components/Icons";

// Success screen shown after email verification — creates the session and
// leads the candidate into their dashboard (start of the AI-interview stage).
export default function CongratulationsPage() {
  const router = useRouter();
  const { completeSignup, signup } = useAuth();

  useEffect(() => {
    completeSignup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstName = signup.firstName || "there";

  return (
    <div className="auth-center">
      <div className="card">
        <span className="badge green">
          <IconCheck />
        </span>
        <h1>Congratulations, {firstName}! 🎉</h1>
        <p>
          Your NexIT-Africa account is ready. Next up is your{" "}
          <b>AI interview</b> — you&apos;ll be assessed against your chosen
          role&apos;s requirements. Score <b>85%+</b> to advance to the
          professional interview stage.
        </p>
        <button className="auth-btn" onClick={() => router.push("/dashboard")}>
          Go to dashboard
        </button>
        <p style={{ marginTop: 14, fontSize: 14 }}>
          Want extra security?{" "}
          <span className="link" style={{ cursor: "pointer" }} onClick={() => router.push("/account/security")}>
            Set up two-factor authentication
          </span>{" "}
          with Google Authenticator.
        </p>
      </div>
    </div>
  );
}
