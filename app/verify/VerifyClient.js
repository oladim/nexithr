"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BG = "radial-gradient(58% 55% at 8% 0%, rgba(59,130,246,.30), transparent 62%), radial-gradient(48% 55% at 100% 30%, rgba(139,92,246,.24), transparent 62%), #070a14";

export default function VerifyClient({ id }) {
  const router = useRouter();
  const [value, setValue] = useState(id || "");
  const [res, setRes] = useState(id ? null : undefined); // undefined = nothing looked up yet

  useEffect(() => {
    if (!id) return;
    let live = true;
    setRes(null);
    fetch(`/api/certificate/verify?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (live) setRes(j); })
      .catch(() => { if (live) setRes({ error: true }); });
    return () => { live = false; };
  }, [id]);

  const submit = (e) => {
    e.preventDefault();
    const v = value.trim().toUpperCase();
    if (v) router.push(`/verify/${encodeURIComponent(v)}`);
  };

  const card = { background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 18, padding: 28 };
  const row = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "4px 16px", padding: "12px 0", borderTop: "1px solid rgba(255,255,255,.1)", fontSize: 15 };

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#f4f7ff", padding: "48px 20px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#fff", fontWeight: 700, fontSize: 20, textDecoration: "none" }}>NexIT-Africa</Link>
        <h1 style={{ fontSize: "clamp(24px, 7vw, 30px)", fontWeight: 800, margin: "28px 0 8px", letterSpacing: "-.02em" }}>Verify a certificate</h1>
        <p style={{ color: "#c5cee2", margin: "0 0 24px", lineHeight: 1.6 }}>
          Confirm that a NexIT Verified Professional (N|VP) certificate is genuine. Enter the certificate number printed at the top right of the certificate.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          <input
            value={value} onChange={(e) => setValue(e.target.value)} placeholder="NXA-2026-XXXXXXXX" aria-label="Certificate number"
            style={{ flex: "1 1 200px", minWidth: 0, padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.25)", background: "rgba(10,14,26,.7)", color: "#fff", fontSize: 15, letterSpacing: ".04em" }}
          />
          <button type="submit" style={{ padding: "13px 22px", borderRadius: 12, border: 0, background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Verify</button>
        </form>

        {res === null && <div style={card}>Checking…</div>}

        {res && res.found && res.valid && (
          <div style={{ ...card, borderColor: "rgba(61,220,151,.55)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={{ width: 38, height: 38, borderRadius: "50%", background: "#3ddc97", color: "#04140c", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>✓</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 19 }}>Valid certificate</div>
                <div style={{ color: "#c5cee2", fontSize: 13.5 }}>Issued by NexIT-Africa and currently in good standing.</div>
              </div>
            </div>
            <div style={row}><span style={{ color: "#c5cee2" }}>Holder</span><b>{res.name}, N|VP</b></div>
            <div style={row}><span style={{ color: "#c5cee2" }}>Credential</span><b>NexIT Verified Professional</b></div>
            <div style={row}><span style={{ color: "#c5cee2" }}>Field</span><b>{res.role}</b></div>
            <div style={row}><span style={{ color: "#c5cee2" }}>Stages passed</span><b>AI · Professional · HR</b></div>
            <div style={row}><span style={{ color: "#c5cee2" }}>Date of issue</span><b>{res.date}</b></div>
            <div style={row}><span style={{ color: "#c5cee2" }}>Certificate no.</span><b>{res.id}</b></div>
          </div>
        )}

        {res && res.found && !res.valid && (
          <div style={{ ...card, borderColor: "rgba(255,120,120,.6)" }}>
            <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 6 }}>No longer valid</div>
            <div style={{ color: "#c5cee2", lineHeight: 1.6 }}>Certificate <b style={{ color: "#fff" }}>{res.id}</b> was issued by NexIT-Africa but is not currently valid. Contact support@nexitafrica.com for details.</div>
          </div>
        )}

        {res && !res.found && !res.error && (
          <div style={{ ...card, borderColor: "rgba(255,120,120,.6)" }}>
            <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 6 }}>Certificate not found</div>
            <div style={{ color: "#c5cee2", lineHeight: 1.6 }}>We couldn&apos;t find a certificate with that number. Check it against the certificate and try again.</div>
          </div>
        )}

        {res && res.error && <div style={card}>We couldn&apos;t check that certificate right now. Please try again shortly.</div>}

        <p style={{ color: "#8f9ab5", fontSize: 12.5, marginTop: 28 }}>NexIT-Africa · support@nexitafrica.com · nexitafrica.com</p>
      </div>
    </main>
  );
}
