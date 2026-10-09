import Link from "next/link";
import { IconStar } from "@/components/Icons";
import BrandLogo from "@/components/BrandLogo";

// The dark left panel shared by Login / Sign Up / password-recovery screens.
// Recreates the Figma aside: NexIT-Africa wordmark, 5 stars, testimonial,
// and reviewer. The "N" mark and diagonal pattern are drawn inline (the
// original Figma vector assets were behind rate-limited/expiring URLs).
export default function AuthAside() {
  return (
    <aside className="auth-aside">
      <Link href="/" className="auth-brand" aria-label="Back to NexIT-Africa home">
        <BrandLogo tone="dark" height={40} priority />
      </Link>

      <div className="auth-testimonial">
        <div className="stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <IconStar key={i} />
          ))}
        </div>
        <p className="quote">
          “I am incredibly impressed with the outstanding service and
          user-friendly customer support provided by NexIT-Africa”
        </p>
        <div className="person">
          <span className="pic">DL</span>
          <div>
            <strong>Devon Lane</strong>
            <span>Co-Founder, Design.co</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
