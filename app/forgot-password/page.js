"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { TextField } from "@/components/auth/Field";
import CodeInput, { useResendTimer, fmtSecs, retryAfterSeconds } from "@/components/auth/CodeInput";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { IconEnvelope } from "@/components/Icons";

const RESEND_SECONDS = 60;

// Forgot password:
//   1. Enter email → Supabase Auth emails a 6-digit recovery code (and a link).
//   2. Enter the code → verifyOtp(type "recovery") signs the user in for this
//      one purpose → /reset-password to choose a new password.
// "Resend" unlocks after a 60-second countdown (Supabase also enforces it).
export default function ForgotPasswordPage() {
  const router = useRouter();
  const { supabaseEnabled } = useAuth();
  const [step, setStep] = useState("email"); // email | code
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const timer = useResendTimer(0);

  const sendCode = async () => {
    if (!supabaseEnabled) return { ok: true };
    const sb = getBrowserSupabase();
    const { error: e } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (!e) return { ok: true };
    const wait = retryAfterSeconds(e.message);
    if (wait) return { ok: true, wait }; // a code was sent recently — still valid
    if (/rate limit/i.test(e.message)) return { error: "Too many emails were requested. Please wait a few minutes and try again." };
    return { error: e.message };
  };

  const onEmail = async (e) => {
    e.preventDefault();
    setError(""); setNote("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    setBusy(true);
    const r = await sendCode();
    setBusy(false);
    if (r.error) { setError(r.error); return; }
    setStep("code");
    setCode("");
    timer.start(r.wait || RESEND_SECONDS);
  };

  const onResend = async () => {
    if (!timer.ready || busy) return;
    setError(""); setNote(""); setCode("");
    setBusy(true);
    const r = await sendCode();
    setBusy(false);
    if (r.error) { setError(r.error); timer.start(RESEND_SECONDS); return; }
    timer.start(r.wait || RESEND_SECONDS);
    setNote(r.wait ? "We sent a code a moment ago — check your inbox (and spam)." : "A new code is on its way. Only the newest code works.");
  };

  const onVerify = async (e) => {
    e?.preventDefault();
    if (code.length !== 6) return;
    setError(""); setNote("");
    if (!supabaseEnabled) { router.push("/reset-password"); return; }
    setBusy(true);
    const sb = getBrowserSupabase();
    const { error: vErr } = await sb.auth.verifyOtp({ email: email.trim(), token: code, type: "recovery" });
    setBusy(false);
    if (vErr) {
      setError(/expired|invalid/i.test(vErr.message)
        ? "That code is wrong or has expired. Check the newest email, or resend a new code."
        : vErr.message);
      setCode("");
      return;
    }
    router.push("/reset-password");
  };

  return (
    <AuthLayout>
      {step === "email" && (
        <>
          <span className="fp-badge" aria-hidden="true"><IconEnvelope width={32} height={32} /></span>
          <h1 className="auth-title">Forgot password?</h1>
          <p className="auth-subtitle">
            No worries — enter the email you signed up with and we&apos;ll email you a 6-digit code to reset your password.
          </p>
          <form onSubmit={onEmail} noValidate>
            <TextField variant="simple" label="Email address" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-btn" style={{ marginTop: 12 }} disabled={busy}>
              {busy ? "Sending…" : "Send reset code"}
            </button>
          </form>
          <p className="auth-alt">Remembered it? <Link href="/login">Back to login</Link></p>
        </>
      )}

      {step === "code" && (
        <>
          <span className="fp-badge" aria-hidden="true"><IconEnvelope width={32} height={32} /></span>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            If an account exists for <b>{email}</b>, we&apos;ve sent it a 6-digit code from NexIT-Africa. Enter it below.
            The code expires in 1 hour.
          </p>
          <form onSubmit={onVerify}>
            <CodeInput value={code} onChange={(v) => { setCode(v); setError(""); }} disabled={busy} invalid={!!error} />
            {error && <p className="auth-error" role="alert">{error}</p>}
            {note && <p className="fp-note" role="status">{note}</p>}
            <button type="submit" className="auth-btn" disabled={code.length !== 6 || busy}>
              {busy ? "Checking…" : "Verify code"}
            </button>
          </form>
          <p className="fp-resend" aria-live="polite">
            Didn&apos;t get it? Check spam, or{" "}
            {timer.ready
              ? <button type="button" className="link-btn" onClick={onResend} disabled={busy}>resend the code</button>
              : <span className="fp-wait">resend in <b>{fmtSecs(timer.left)}</b></span>}
          </p>
          <p className="fp-resend">
            Wrong email? <button type="button" className="link-btn" onClick={() => { setStep("email"); setCode(""); setError(""); setNote(""); }}>Use a different one</button>
          </p>
          {!supabaseEnabled && <p className="fp-note">Demo mode — any 6 digits will work.</p>}
        </>
      )}
    </AuthLayout>
  );
}
