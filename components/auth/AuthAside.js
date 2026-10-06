import Link from "next/link";
import { IconStar } from "@/components/Icons";

// The dark left panel shared by Login / Sign Up / password-recovery screens.
// Recreates the Figma aside: NexIT-Africa wordmark, 5 stars, testimonial,
// and reviewer. The "N" mark and diagonal pattern are drawn inline (the
// original Figma vector assets were behind rate-limited/expiring URLs).
export default function AuthAside() {
  return (
    <aside className="auth-aside">
      <Link href="/" className="auth-brand" aria-label="Back to NexIT-Africa home">
        <svg className="mark" viewBox="0 0 39 49" fill="none" aria-hidden="true">
          <path
            d="M4 45V9c0-2 2.4-3 3.9-1.6L31 30V4h4v36c0 2-2.4 3-3.9 1.6L8 18v27H4z"
            fill="#fff"
          />
        </svg>
        <span className="name">NexIT-Africa</span>
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
