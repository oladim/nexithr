"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { TextField } from "@/components/auth/Field";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { IconLock, IconCheck } from "@/components/Icons";

// Set a new password. Reached after the recovery code (or the link in the
// email) has signed the user in for this purpose. Afterwards they're signed
// out and log in again with the new password (and their 2FA code).
export default function ResetPasswordPage() {
  const router = useRouter();
  const { supabaseEnabled, logout } = useAuth();
  const [state, setState] = useState(supabaseEnabled ? "checking" : "form"); // checking | form | expired | done
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const sb = getBrowserSupabase();
      const { data } = await sb.auth.getSession();
      setState(data?.session ? "form" : "expired");
    })();
  }, [supabaseEnabled]);

  const rules = [
    { ok: password.length >= 8, label: "At least 8 characters" },
    { ok: /[A-Za-z]/.test(password) && /\d/.test(password), label: "Letters and numbers" },
    { ok: !!password && password === confirm, label: "Both passwords match" },
  ];

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!rules.every((r) => r.ok)) { setError("Please meet all the password requirements."); return; }
    if (!supabaseEnabled) { setState("done"); return; }
    setBusy(true);
    const sb = getBrowserSupabase();
    const { error: uErr } = await sb.auth.updateUser({ password });
    if (uErr) {
      setBusy(false);
      setError(/different from the old/i.test(uErr.message) ? "Choose a password you haven't used before." : uErr.message);
      return;
    }
    await logout(); // signs out everywhere in this browser
    setBusy(false);
    setState("done");
  };

  return (
    <AuthLayout>
      {state === "checking" && <p className="auth-subtitle">Checking your reset session…</p>}

      {state === "expired" && (
        <>
          <span className="fp-badge" aria-hidden="true"><IconLock width={30} height={30} /></span>
          <h1 className="auth-title">Reset session expired</h1>
          <p className="auth-subtitle">For your security, please request a new code to reset your password.</p>
          <Link href="/forgot-password" className="auth-btn" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>Get a new code</Link>
        </>
      )}

      {state === "form" && (
        <>
          <span className="fp-badge" aria-hidden="true"><IconLock width={30} height={30} /></span>
          <h1 className="auth-title">Set new password</h1>
          <p className="auth-subtitle">Choose a strong password you haven&apos;t used before on NexIT-Africa.</p>
          <form onSubmit={submit}>
            <TextField variant="simple" label="New password" type="password" placeholder="Enter new password"
              value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
            <TextField variant="simple" label="Confirm password" type="password" placeholder="Re-enter new password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
            <ul className="pw-rules" aria-label="Password requirements">
              {rules.map((r) => (
                <li key={r.label} className={r.ok ? "ok" : ""}>
                  <IconCheck width={14} height={14} aria-hidden="true" /> {r.label}
                </li>
              ))}
            </ul>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" className="auth-btn" style={{ marginTop: 12 }} disabled={busy}>
              {busy ? "Saving…" : "Reset password"}
            </button>
          </form>
        </>
      )}

      {state === "done" && (
        <>
          <span className="fp-badge ok" aria-hidden="true"><IconCheck width={32} height={32} /></span>
          <h1 className="auth-title">Password reset</h1>
          <p className="auth-subtitle">Your password has been changed. Log in with your new password.</p>
          <button type="button" className="auth-btn" onClick={() => router.push("/login")}>Back to login</button>
        </>
      )}
    </AuthLayout>
  );
}
