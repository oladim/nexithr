"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { ROLE_LABELS } from "@/lib/db";
import Certificate from "@/components/certificate/Certificate";
import { IconCheck, IconLock, IconChevronRight } from "@/components/Icons";

// The three stages a candidate must pass before the certificate unlocks.
function useStages(app) {
  return [
    { label: "AI Interview", done: !!app.aiInterview?.passed, href: "/dashboard/interview/ai" },
    { label: "Professional Interview", done: !!app.stages?.Professional?.passed, href: "/dashboard/interview" },
    { label: "HR Interview", done: !!app.stages?.HR?.passed, href: "/dashboard/interview" },
  ];
}

export default function CertificatePage() {
  const { app, user, signup, supabaseEnabled } = useAuth();
  const stages = useStages(app);
  const allPassed = stages.every((s) => s.done);

  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    if (!supabaseEnabled) {
      // Demo mode: build a sample certificate locally once every stage is passed.
      if (!allPassed) { setState({ loading: false, eligible: false }); return; }
      const now = new Date();
      setState({
        loading: false, eligible: true, demo: true,
        certificate: {
          id: `NXA-${now.getFullYear()}-DEMO0001`,
          name: user?.name || [signup.firstName, signup.lastName].filter(Boolean).join(" ") || "Candidate",
          role: ROLE_LABELS[signup.targetRole] || signup.targetRoleLabel || "Technology",
          date: now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
          year: now.getFullYear(), qr: null,
        },
      });
      // Sample QR so the preview is complete (real ones are issued server-side).
      import("qrcode").then((m) => (m.default || m).toDataURL("https://nexitafrica.com/verify", { margin: 0, width: 240 }))
        .then((qr) => setState((st) => (st.certificate ? { ...st, certificate: { ...st.certificate, qr } } : st)))
        .catch(() => {});
      return;
    }
    let live = true;
    (async () => {
      try {
        const res = await fetch("/api/certificate", { cache: "no-store" });
        const data = await res.json();
        if (!live) return;
        if (!res.ok) setState({ loading: false, error: data.error || "Couldn't load your certificate." });
        else setState({ loading: false, ...data });
      } catch { if (live) setState({ loading: false, error: "Couldn't load your certificate." }); }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseEnabled, allPassed]);

  const c = state.certificate;

  return (
    <>
      <div className="page-head">
        <h1>Your certificate</h1>
        <p>
          {state.eligible
            ? "You've passed every stage. Print your NexIT Verified Professional certificate or save it as a PDF."
            : "Your NexIT Verified Professional (N|VP) certificate unlocks as soon as you pass all three interview stages."}
        </p>
      </div>

      {state.loading ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>
      ) : state.error ? (
        <div className="auth-error" style={{ maxWidth: 640 }}>{state.error}</div>
      ) : state.eligible && c ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 18 }}>
            <button className="btn-solid" onClick={() => window.print()}>Print / Save as PDF</button>
            {c.verifyUrl && <a className="btn-outline" href={c.verifyUrl} target="_blank" rel="noreferrer">Open verification page</a>}
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              Certificate no. <b style={{ color: "var(--navy)" }}>{c.id}</b>
            </span>
          </div>
          <Certificate name={c.name} role={c.role} date={c.date} year={c.year} id={c.id} qr={c.qr} />
          <div className="card pad" style={{ marginTop: 20, maxWidth: 1122 }}>
            <h3 className="card-title" style={{ marginBottom: 8 }}>You&apos;ve earned the N|VP title</h3>
            <p style={{ fontSize: 14, color: "var(--gray-500)", margin: 0, lineHeight: 1.65 }}>
              Add <b>N|VP</b> after your name — for example <b>{c.name}, N|VP</b> — on your CV, LinkedIn and email signature.
              Anyone can confirm it by scanning the QR code or entering your certificate number at <b>nexitafrica.com/verify</b>.
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "10px 0 0" }}>
              Printing tip: choose <b>Landscape</b>, <b>A4</b>, margins <b>None</b>, and turn on <b>Background graphics</b> so the dark design prints in full.
              {state.demo ? " (Demo preview — the QR code and number are issued in live mode.)" : ""}
            </p>
          </div>
        </>
      ) : state.revoked ? (
        <div className="auth-error" style={{ maxWidth: 640 }}>This certificate has been withdrawn. Please contact support@nexitafrica.com.</div>
      ) : (
        <div className="card pad" style={{ maxWidth: 640 }}>
          <h3 className="card-title" style={{ marginBottom: 12 }}>Pass all three stages to unlock it</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stages.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--line, #e6e9f0)", borderRadius: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: s.done ? "rgba(46,204,113,.15)" : "rgba(28,31,42,.06)", color: s.done ? "#2e874b" : "var(--muted)" }}>
                  {s.done ? <IconCheck width={15} height={15} /> : <IconLock width={14} height={14} />}
                </span>
                <b style={{ flex: 1, fontSize: 14.5 }}>{s.label}</b>
                <span className={`pill-status ${s.done ? "done" : "pending"}`}>{s.done ? "Passed" : "Not yet passed"}</span>
              </div>
            ))}
          </div>
          <Link href={(stages.find((s) => !s.done) || stages[0]).href} className="btn-solid" style={{ marginTop: 16, display: "inline-flex" }}>
            Continue my interviews <IconChevronRight width={16} height={16} />
          </Link>
        </div>
      )}
    </>
  );
}
