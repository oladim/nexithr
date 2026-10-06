"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconLock, IconCheck } from "@/components/Icons";

// Mandatory two-factor gate. Every signed-in user (all roles, including
// admins) must have Google Authenticator TOTP enabled before they can use any
// portal. If 2FA isn't set up yet, this blocks the portal and walks the user
// through enrollment. Demo mode (no Supabase) is exempt.
export default function TwoFactorGate({ children }) {
  const { supabaseEnabled } = useAuth();
  const [enabled, setEnabled] = useState(null); // null = loading
  const [setup, setSetup] = useState(null);      // { qr, secret, otpauthUrl }
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try { const r = await fetch("/api/2fa"); const d = await r.json(); setEnabled(!!d.enabled); }
    catch { setEnabled(false); }
  };
  useEffect(() => { if (supabaseEnabled) load(); else setEnabled(true); }, [supabaseEnabled]);

  if (!supabaseEnabled) return children;
  if (enabled === null) return null;        // brief loading flash
  if (enabled) return children;             // already protected

  const startSetup = async () => {
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "setup" }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Couldn't start setup"); setBusy(false); return; }
      setSetup(d);
    } catch { setErr("Couldn't start setup"); }
    setBusy(false);
  };

  const enable = async () => {
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "enable", code }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "That code didn't match"); setBusy(false); return; }
      setEnabled(true); setSetup(null); setCode("");
    } catch { setErr("Couldn't enable 2FA"); }
    setBusy(false);
  };

  return (
    <div className="assess" style={{ maxWidth: 560, margin: "40px auto" }}>
      <div className="page-head">
        <h1>Set up two-factor authentication</h1>
        <p>For everyone&apos;s security, NexIT-Africa requires two-factor authentication on every account. Set it up now to continue.</p>
      </div>

      <div className="card pad">
        <h3 className="card-title" style={{ marginTop: 0 }}>
          <IconLock width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} />
          Google Authenticator (required)
        </h3>

        {err && <div className="auth-error" style={{ marginBottom: 10 }}>{err}</div>}

        {!setup ? (
          <>
            <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 0 }}>
              You&apos;ll scan a QR code with Google Authenticator (or any TOTP app) and enter the 6-digit code it generates. After this, you&apos;ll enter a fresh code each time you sign in.
            </p>
            <button className="btn-solid" disabled={busy} onClick={startSetup}>{busy ? "Starting…" : "Begin setup"}</button>
          </>
        ) : (
          <>
            <ol style={{ paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
              <li>Open Google Authenticator and tap <b>+</b> → <b>Scan a QR code</b>.</li>
              <li>Scan the code below (or enter the key manually).</li>
              <li>Enter the 6-digit code it shows to finish.</li>
            </ol>
            {setup.qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={setup.qr} alt="2FA QR code" width={200} height={200} style={{ border: "1px solid #eef1f6", borderRadius: 12 }} />
            ) : (
              <p style={{ fontSize: 13 }}>Scan unavailable — enter this key manually.</p>
            )}
            <p style={{ fontSize: 12, color: "var(--muted)", wordBreak: "break-all", marginTop: 8 }}>
              Manual key: <code>{setup.secret}</code>
            </p>
            <label className="cv-step-label" style={{ marginTop: 10 }}>Enter the 6-digit code</label>
            <input className="rr-exp-input" style={{ width: 160, letterSpacing: 4, fontSize: 18, textAlign: "center" }} inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" />
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button className="btn-outline" disabled={busy} onClick={() => { setSetup(null); setCode(""); }}>Back</button>
              <button className="btn-solid" disabled={busy || code.length !== 6} onClick={enable}><IconCheck width={14} height={14} /> Verify &amp; finish</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
