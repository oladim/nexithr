"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconCheck } from "@/components/Icons";

// Accept control for the current Privacy Policy version, with the user's
// recorded status. Active only when the user hasn't accepted this version.
export default function PrivacyConsent() {
  const { supabaseEnabled, user } = useAuth();
  const [st, setSt] = useState(supabaseEnabled ? null : { accepted: false });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!supabaseEnabled || !user) return;
    fetch("/api/me/consent", { cache: "no-store" }).then((r) => r.json()).then(setSt).catch(() => setSt({ accepted: false }));
  }, [supabaseEnabled, user]);

  if (!user) return null;
  if (st === null) return <p className="privacy-status">Checking your consent…</p>;

  const accept = async () => {
    setErr(""); setBusy(true);
    if (!supabaseEnabled) { setSt({ accepted: true, acceptedAt: new Date().toISOString() }); setBusy(false); return; }
    try {
      const r = await fetch("/api/me/consent", { method: "POST" });
      const d = await r.json();
      if (!r.ok) setErr(d.error || "Couldn't record your consent"); else { setSt((s) => ({ ...s, ...d })); window.dispatchEvent(new Event("nexit:consent")); }
    } catch { setErr("Couldn't record your consent"); }
    setBusy(false);
  };

  const when = st.acceptedAt ? new Date(st.acceptedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <div className="privacy-consent">
      {st.accepted ? (
        <>
          <button type="button" className="privacy-accept is-done" disabled><IconCheck width={16} height={16} /> Accepted</button>
          <p className="privacy-status">You accepted this version{when ? ` on ${when}` : ""}. You can withdraw consent at any time by emailing support@nexitafrica.com.</p>
        </>
      ) : (
        <>
          <button type="button" className="privacy-accept" disabled={busy} onClick={accept}>{busy ? "Saving…" : "Accept"}</button>
          <p className="privacy-status">
            {st.acceptedVersion ? "We've updated this policy since you last accepted it. Please review and accept the new version." : "Please review and accept our Privacy Policy."}
          </p>
        </>
      )}
      {err && <div className="auth-error" style={{ marginTop: 10 }}>{err}</div>}
    </div>
  );
}
