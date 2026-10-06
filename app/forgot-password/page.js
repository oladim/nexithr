"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { TextField } from "@/components/auth/Field";
import { IconEnvelope, IconArrowLeft, IconCheck } from "@/components/Icons";

// Forgot Password — 3 steps: request email → enter code → verified.
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  const setDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const nextCode = [...code];
    nextCode[i] = v;
    setCode(nextCode);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const codeComplete = code.every((d) => d !== "");

  return (
    <AuthLayout>
      <Link
        href="/login"
        className="link"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 24 }}
      >
        <IconArrowLeft width={18} height={18} /> Back to login
      </Link>

      {step === 0 && (
        <>
          <span className="badge blue" style={{ display: "flex", width: 64, height: 64, borderRadius: 16, background: "rgba(0,123,255,.12)", color: "var(--blue)", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <IconEnvelope width={32} height={32} />
          </span>
          <h1 className="auth-title">Forgot password?</h1>
          <p className="auth-subtitle">
            No worries — enter the email tied to your account and we&apos;ll send
            you a reset code.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setStep(1);
            }}
          >
            <TextField
              variant="simple"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="auth-btn" style={{ marginTop: 12 }}>
              Send reset code
            </button>
          </form>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            We sent a 6-digit code to <b>{email || "your inbox"}</b>. Enter it
            below to continue.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (codeComplete) setStep(2);
            }}
          >
            <div className="code-row">
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !d && i > 0)
                      inputs.current[i - 1]?.focus();
                  }}
                />
              ))}
            </div>
            <button type="submit" className="auth-btn" disabled={!codeComplete}>
              Verify code
            </button>
            <p className="auth-alt" style={{ textAlign: "center" }}>
              Didn&apos;t get it?{" "}
              <span className="link" onClick={() => setCode(["", "", "", "", "", ""])}>
                Resend
              </span>
            </p>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <span className="badge green" style={{ display: "flex", width: 64, height: 64, borderRadius: 16, background: "rgba(46,204,113,.15)", color: "var(--green)", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <IconCheck width={32} height={32} />
          </span>
          <h1 className="auth-title">Code verified</h1>
          <p className="auth-subtitle">
            You&apos;re all set — let&apos;s create a new password for your
            account.
          </p>
          <button
            type="button"
            className="auth-btn"
            onClick={() => router.push("/reset-password")}
          >
            Set new password
          </button>
        </>
      )}
    </AuthLayout>
  );
}
