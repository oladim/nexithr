import Link from "next/link";
import { IconCheck } from "@/components/Icons";
import BrandLogo from "@/components/BrandLogo";

// The dark left panel shared by Login / Sign Up / password-recovery screens:
// wordmark plus a short, factual summary of what NexIT-Africa does.
const POINTS = [
  { t: "AI interview", d: "A voice interview that shows exactly where you stand for your target role." },
  { t: "Role-specific training", d: "Courses, assignments and live practicals that close your gaps." },
  { t: "Professional & HR interviews", d: "Pass both and you're on the verified candidate board." },
];

export default function AuthAside() {
  return (
    <aside className="auth-aside">
      <Link href="/" className="auth-brand" aria-label="Back to NexIT-Africa home">
        <BrandLogo tone="dark" height={40} priority />
      </Link>

      <div className="auth-testimonial auth-points">
        <p className="ap-kicker">From CV to job offer — in one place</p>
        <ul>
          {POINTS.map((p) => (
            <li key={p.t}>
              <span className="ap-ic" aria-hidden="true"><IconCheck width={16} height={16} /></span>
              <div><strong>{p.t}</strong><span>{p.d}</span></div>
            </li>
          ))}
        </ul>
        <p className="ap-nvp">Pass every stage to earn <b>N|VP</b> — NexIT Verified Professional.</p>
      </div>
    </aside>
  );
}
