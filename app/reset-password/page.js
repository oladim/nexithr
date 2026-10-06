"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { TextField } from "@/components/auth/Field";
import { IconLock, IconCheck } from "@/components/Icons";

// Reset Password — 2 steps: set new password → success.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setStep(1);
  };

  return (
    <AuthLayout>
      {step === 0 && (
        <>
          <span className="badge blue" style={{ display: "inline-flex", width: 64, height: 64, borderRadius: 16, background: "rgba(0,123,255,.12)", color: "var(--blue)", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <IconLock width={30} height={30} />
          </span>
          <h1 className="auth-title">Set new password</h1>
          <p className="auth-subtitle">
            Your new password must be different from previously used passwords.
          </p>
          <form onSubmit={submit}>
            <TextField
              variant="simple"
              label="New password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <TextField
              variant="simple"
              label="Confirm password"
              type="password"
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={error}
              required
            />
            <button type="submit" className="auth-btn" style={{ marginTop: 12 }}>
              Reset password
            </button>
          </form>
        </>
      )}

      {step === 1 && (
        <>
          <span className="badge green" style={{ display: "inline-flex", width: 64, height: 64, borderRadius: 16, background: "rgba(46,204,113,.15)", color: "var(--green)", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <IconCheck width={32} height={32} />
          </span>
          <h1 className="auth-title">Password reset</h1>
          <p className="auth-subtitle">
            Your password has been successfully reset. You can now log in with
            your new password.
          </p>
          <button type="button" className="auth-btn" onClick={() => router.push("/login")}>
            Back to login
          </button>
        </>
      )}
    </AuthLayout>
  );
}
