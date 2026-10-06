import Link from "next/link";
import AuthAside from "./AuthAside";
import { IconArrowLeft } from "@/components/Icons";

// Split-panel shell: dark testimonial aside + white form panel.
export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <AuthAside />
      <main className="auth-main">
        <div className="auth-form-wrap">
          <Link href="/" className="auth-back">
            <IconArrowLeft width={16} height={16} /> Back to home
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
