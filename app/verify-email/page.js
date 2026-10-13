"use client";

import { useState } from "react";
import CodeInput, { useResendTimer, fmtSecs, retryAfterSeconds } from "@/components/auth/CodeInput";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { IconEnvelope } from "@/components/Icons";

// Email confirmation — sits between signup and the congratulations screen.
export default function VerifyEmailPage() {
  const router = useRouter();
  const { signup, verifyEmailOtp, resendConfirmation, supabaseEnabled } = useAuth();
  const [code, setCode] = useState("");
  const timer = useResendTimer(60); // a code was just sent at sign-up
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const complete = code.length === 6;

  const onVerify = async () => {
    setError("");
    if (!supabaseEnabled) {
      router.push("/congratulations");
      return;
    }
    setBusy(true);
    const res = await verifyEmailOtp(signup.email, code);
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
    if (!timer.ready) return;
    setCode("");
    if (!supabaseEnabled) { timer.start(60); return; }
    const res = await resendConfirmation(signup.email);
    const wait = retryAfterSeconds(res?.error);
    if (res?.error && !wait) { setError(res.error); timer.start(60); return; }
    timer.start(wait || 60);
    setNote(wait ? "We sent a code a moment ago — check your inbox (and spam)." : "A new code is on its way. Only the newest code works.");
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
        <CodeInput value={code} onChange={(v) => { setCode(v); setError(""); }} disabled={busy} invalid={!!error} />
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
          {timer.ready
            ? <button type="button" className="link-btn" onClick={onResend}>Resend</button>
            : <span className="fp-wait">Resend in <b>{fmtSecs(timer.left)}</b></span>}
        </p>
      </div>
    </div>
  );
}
