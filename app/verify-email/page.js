"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { IconEnvelope } from "@/components/Icons";

// Email confirmation — sits between signup and the congratulations screen.
export default function VerifyEmailPage() {
  const router = useRouter();
  const { signup, verifyEmailOtp, resendConfirmation, supabaseEnabled } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const inputs = useRef([]);

  const setDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code];
    next[i] = v;
    setCode(next);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };
  const complete = code.every((d) => d !== "");

  const onVerify = async () => {
    setError("");
    if (!supabaseEnabled) {
      router.push("/congratulations");
      return;
    }
    setBusy(true);
    const res = await verifyEmailOtp(signup.email, code.join(""));
    setBusy(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.push("/congratulations");
  };

  const onResend = async () => {
    setError("");
    setNote("");
    setCode(["", "", "", "", "", ""]);
    if (!supabaseEnabled) return;
    const res = await resendConfirmation(signup.email);
    if (res?.error) setError(res.error);
    else setNote("A new code is on its way — check your inbox.");
  };

  return (
    <div className="auth-center">
      <div className="card">
        <span className="badge blue">
          <IconEnvelope />
        </span>
        <h1>Verify your email</h1>
        <p>
          We sent a 6-digit verification code to{" "}
          <b>{signup.email || "your email address"}</b>. Enter it below to
          confirm your account.
        </p>
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
        {error && <p className="auth-error" style={{ textAlign: "left" }}>{error}</p>}
        {note && <p className="resend" style={{ color: "var(--green)" }}>{note}</p>}
        <button
          className="auth-btn"
          disabled={!complete || busy}
          onClick={onVerify}
        >
          {busy ? "Verifying…" : "Verify email"}
        </button>
        <p className="resend">
          Didn&apos;t receive the code?{" "}
          <span className="link" onClick={onResend}>
            Resend
          </span>
        </p>
      </div>
    </div>
  );
}
