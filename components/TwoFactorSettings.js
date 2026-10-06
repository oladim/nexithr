"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconLock, IconCheck } from "@/components/Icons";

// Enable / disable Google Authenticator (TOTP) two-factor for the signed-in user.
export default function TwoFactorSettings() {
  const { supabaseEnabled } = useAuth();
  const [enabled, setEnabled] = useState(null);
  const [setup, setSetup] = useState(null); // { qr, secret, otpauthUrl }
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    try { const r = await fetch("/api/2fa"); const d = await r.json(); setEnabled(!!d.enabled); } catch { setEnabled(false); }
  };
  useEffect(() => { if (supabaseEnabled) load(); else setEnabled(false); /* eslint-disable-next-line */ }, [supabaseEnabled]);

  if (!supabaseEnabled) {
    return (
      <div className="card pad" style={{ maxWidth: 560 }}>
        <h3 className="card-title" style={{ marginTop: 0 }}>Two-factor authentication</h3>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>Connect Supabase (real mode) to enable Google Authenticator 2FA.</p>
      </div>
    );
  }

  const startSetup = async () => {
    setErr(""); setMsg(""); setBusy(true);
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
      if (!r.ok) { setErr(d.error || "Couldn't enable"); setBusy(false); return; }
      setEnabled(true); setSetup(null); setCode(""); setMsg("Two-factor authentication is now on.");
    } catch { setErr("Couldn't enable"); }
    setBusy(false);
  };

  const disable = async () => {
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "disable", code }) });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Couldn't disable"); setBusy(false); return; }
      setEnabled(false); setCode(""); setMsg("Two-factor authentication turned off.");
    } catch { setErr("Couldn't disable"); }
    setBusy(false);
  };

  return (
    <div className="card pad" style={{ maxWidth: 560 }}>
      <h3 className="card-title" style={{ marginTop: 0 }}>
        <IconLock width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} />
        Two-factor authentication
      </h3>
      <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 0 }}>
        Protect your account with a code from <b>Google Authenticator</b> (or any TOTP app) in addition to your password.
      </p>

      {err && <div className="auth-error" style={{ marginBottom: 10 }}>{err}</div>}
      {msg && <div className="role-note ok" style={{ marginBottom: 10 }}>{msg}</div>}

      {enabled === null ? (
        <p style={{ fontSize: 14, color: "var(--muted)" }}>Loading…</p>
      ) : enabled ? (
        <>
          <p className="pill-status done" style={{ display: "inline-block", marginBottom: 12 }}><IconCheck width={13} height={13} style={{ verticalAlign: "-2px", marginRight: 4 }} /> Enabled</p>
          <label className="cv-step-label">Enter a current code to turn 2FA off</label>
          <input className="rr-exp-input" style={{ width: 160, letterSpacing: 4, fontSize: 18, textAlign: "center" }} inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" />
          <div style={{ marginTop: 12 }}>
            <button className="btn-outline" disabled={busy || code.length !== 6} onClick={disable}>Turn off 2FA</button>
          </div>
        </>
      ) : !setup ? (
        <button className="btn-solid" disabled={busy} onClick={startSetup}>{busy ? "Starting…" : "Enable 2FA"}</button>
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
            <button className="btn-outline" disabled={busy} onClick={() => { setSetup(null); setCode(""); }}>Cancel</button>
            <button className="btn-solid" disabled={busy || code.length !== 6} onClick={enable}>Verify &amp; enable</button>
          </div>
        </>
      )}
    </div>
  );
}
