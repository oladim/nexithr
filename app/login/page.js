"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { TextField } from "@/components/auth/Field";
import OAuthButtons from "@/components/auth/OAuthButtons";
import { useAuth } from "@/components/context/AuthContext";

// Login — exact match to Figma frame 113:551 ("Welcome back!").
export default function LoginPage() {
  const router = useRouter();
  const { login, supabaseEnabled } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [twoFA, setTwoFA] = useState({ pending: false, role: null });
  const [code, setCode] = useState("");

  const routeFor = (role) =>
    role === "interviewer" ? "/interviewer" : role === "recruiter" ? "/recruiter" : role === "admin" ? "/admin" : "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError("");
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (res?.error) {
      // Friendlier message for the most common first-login blocker.
      setError(
        /confirm/i.test(res.error)
          ? "Please confirm your email first — check your inbox for the verification link or code."
          : res.error
      );
      return;
    }
    // If the account has TOTP 2FA enabled, require a code before proceeding.
    if (supabaseEnabled) {
      try {
        const s = await (await fetch("/api/2fa")).json();
        if (s?.enabled) { setTwoFA({ pending: true, role: res?.role }); return; }
      } catch { /* if the check fails, fall through to normal routing */ }
    }
    router.refresh(); // sync server components with the new session cookie
    router.push(routeFor(res?.role));
  };

  const verify2FA = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const r = await fetch("/api/2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", code }) });
      const d = await r.json();
      setBusy(false);
      if (!r.ok) { setError(d.error || "Invalid code"); return; }
      router.refresh();
      router.push(routeFor(twoFA.role));
    } catch { setBusy(false); setError("Couldn't verify the code"); }
  };

  // ---- Two-factor step (shown after a correct password when 2FA is on) ----
  if (twoFA.pending) {
    return (
      <AuthLayout>
        <h1 className="auth-title">Two-factor authentication</h1>
        <p className="auth-subtitle">Enter the 6-digit code from your Google Authenticator app to finish signing in.</p>
        <form onSubmit={verify2FA}>
          <input
            className="rr-exp-input"
            style={{ width: 200, letterSpacing: 6, fontSize: 24, textAlign: "center", padding: "12px" }}
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
          />
          {error && <p className="auth-error" style={{ marginTop: 12 }}>{error}</p>}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button type="button" className="auth-btn ghost" onClick={() => { setTwoFA({ pending: false, role: null }); setCode(""); setError(""); }}>Back</button>
            <button type="submit" className="auth-btn" disabled={busy || code.length !== 6}>{busy ? "Verifying…" : "Verify"}</button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="auth-title">Welcome back!</h1>
      <p className="auth-subtitle">
        NexIT-Africa empower your hiring process with intelligent assessments,
        certified training, and verified talent matching.
      </p>

      <form onSubmit={onSubmit}>
        <TextField
          variant="simple"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          variant="simple"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "4px 0 28px",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <label className="check-row">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="link" style={{ fontSize: 14 }}>
            Forgot password?
          </Link>
        </div>

        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-btn" disabled={busy}>
          {busy ? "Signing in…" : "Log In"}
        </button>
        <p className="auth-alt">
          Don&apos;t have an account?{" "}
          <Link href="/signup">Create free account</Link>
        </p>
      </form>

      <OAuthButtons />
    </AuthLayout>
  );
}
