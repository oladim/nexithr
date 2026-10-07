"use client";

import { useEffect, useRef, useState } from "react";
import "./certificate.css";

// Design size of the certificate (A4 landscape at 96dpi).
const W = 1122.52;
const H = 793.7;

/**
 * The NexIT Verified Professional (N|VP) certificate.
 * props: { name, role, date, year, id, qr (data URL), verifyHost }
 * Renders at its true A4 size and scales down to fit its container on screen;
 * when printed it fills an A4 landscape page exactly.
 */
export default function Certificate({ name, role, date, year, id, qr, verifyHost = "nexitafrica.com/verify" }) {
  const fitRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, el.clientWidth / W));
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro?.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  const len = (name || "").length;
  const nameCls = len > 34 ? "x-name x-sm" : len > 24 ? "x-name x-md" : "x-name";

  return (
    <div className="nxc-fit" ref={fitRef} style={{ height: H * scale, maxWidth: W }}>
      <div className="nxc" style={{ transform: `scale(${scale})` }}>
        <div className="x-dots" /><div className="x-ghost">N</div>
        <svg className="x-framesvg" viewBox="0 0 1122.5 793.7" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nxc-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5fa8ff" /><stop offset=".5" stopColor="#a78bfa" stopOpacity=".55" /><stop offset="1" stopColor="#34d3c0" />
            </linearGradient>
          </defs>
          <rect x="26" y="26" width="1070.5" height="741.7" rx="10" fill="none" stroke="url(#nxc-g)" strokeWidth="1.3" />
          <rect x="33" y="33" width="1056.5" height="727.7" rx="6" fill="none" stroke="#ffffff" strokeOpacity=".06" strokeWidth="1" />
          <g stroke="#5fa8ff" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M20 44V20H44" /><path d="M1078.5 20H1102.5V44" /><path d="M20 749.7V773.7H44" /><path d="M1078.5 773.7H1102.5V749.7" />
          </g>
        </svg>

        <div className="x-pad">
          <div className="x-topbar">
            <div className="x-brand">
              <span className="x-mk">
                <svg viewBox="0 0 39 49" fill="none"><path d="M4 45V9c0-2 2.4-3 3.9-1.6L31 30V4h4v36c0 2-2.4 3-3.9 1.6L8 18v27H4z" fill="#fff" /></svg>
              </span>
              <span className="x-nm">NexIT&#8209;Africa</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="x-vpill"><span className="x-dot" />VERIFIED CREDENTIAL</span>
              <div className="x-idline">CERTIFICATE NO.&nbsp;&nbsp;<b>{id}</b></div>
            </div>
          </div>

          <div className="x-hero">
            <div className="x-kicker">This is to certify that</div>
            <div className={nameCls}>{name}</div>
            <div className="x-rule" />
            <p className="x-statement">
              has passed every stage of the NexIT-Africa assessment pipeline and is admitted to the verified candidate board as a job&#8209;ready professional in <b>{role}</b>.
            </p>
          </div>

          <div className="x-ledger">
            {["AI Interview", "Professional Interview", "HR Interview"].map((l) => (
              <div className="x-cell" key={l}><div className="x-lab">{l}</div><div className="x-val"><span className="x-ck">✓</span>Passed</div></div>
            ))}
          </div>

          <div className="x-seal">
            <div className="x-ringo" /><div className="x-ringi" /><div className="x-dash" />
            <div className="x-core">
              <div className="x-cn"><span>N</span><i /><span>VP</span></div>
              <div className="x-cv">VERIFIED</div>
              <div className="x-cs">NEXIT-AFRICA</div>
              <div className="x-cy">JOB-READY · {year}</div>
            </div>
          </div>

          <div className="x-verify">
            <div className="x-box">{qr ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={qr} alt="Verification QR code" /> : null}</div>
            <div><div className="x-t1">Scan to verify</div><div className="x-t2">{verifyHost}</div><div className="x-t3">Authenticity checked live</div></div>
          </div>

          <div className="x-foot">
            <div className="x-sig">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/director-signature.png" alt="Signature of the Director, NexIT-Africa" />
              <div className="x-nm">Director, NexIT-Africa</div>
            </div>
            <div className="x-fact"><div className="x-l">Date of issue</div><div className="x-v">{date}</div></div>
            <div className="x-fact x-r"><div className="x-l">Issued by</div><div className="x-v">NexIT-Africa</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
