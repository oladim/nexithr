import Link from "next/link";
import Reveal from "./Reveal";
import { IconArrowUpRight, IconCheck } from "./Icons";

const WHERE = [
  { title: "After your name", text: "Sign off as “Amara Okafor, N|VP” on your CV, cover letters and email signature." },
  { title: "On your LinkedIn", text: "Add N|VP to your headline and list the certificate under Licences & Certifications." },
  { title: "Backed by proof", text: "Every certificate carries a unique number and QR code anyone can check at nexitafrica.com/verify." },
];

// Landing section: the N|VP (NexIT Verified Professional) title candidates earn.
export default function Nvp() {
  return (
    <section className="nvp" id="nvp">
      <div className="nvp-inner">
        <Reveal className="nvp-copy">
          <span className="eyebrow nvp-eyebrow">The N|VP title</span>
          <h2>Pass all three stages. Put <span className="nvp-mark">N<i />VP</span> after your name.</h2>
          <p>
            Candidates who pass the AI interview, the Professional interview and the HR interview become a
            <b> NexIT Verified Professional</b>. You receive a printable certificate and the right to use the
            <b> N|VP</b> title — a simple way to show employers you&apos;ve been independently vetted.
          </p>
          <ul className="nvp-list">
            {WHERE.map((w) => (
              <li key={w.title}>
                <span className="nvp-tick"><IconCheck width={14} height={14} /></span>
                <span><b>{w.title}.</b> {w.text}</span>
              </li>
            ))}
          </ul>
          <div className="nvp-cta">
            <Link href="/signup" className="btn btn-fill">
              Start earning your N|VP <IconArrowUpRight width={18} height={18} />
            </Link>
            <Link href="/verify" className="nvp-link">Verify a certificate</Link>
          </div>
        </Reveal>

        <Reveal className="nvp-visual" delay={120}>
          <div className="nvp-seal" aria-hidden="true">
            <span className="nvp-ring" />
            <span className="nvp-core">
              <span className="nvp-big">N<i />VP</span>
              <span className="nvp-v">VERIFIED</span>
              <span className="nvp-s">NEXIT-AFRICA</span>
            </span>
          </div>
          <div className="nvp-card">
            <span className="nvp-card-label">How it looks</span>
            <strong>Amara Okafor, N|VP</strong>
            <span>Full-Stack Developer · NexIT Verified Professional</span>
            <div className="nvp-stages">
              <em>AI ✓</em><em>Professional ✓</em><em>HR ✓</em>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
