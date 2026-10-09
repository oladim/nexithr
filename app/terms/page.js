import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import TermsOfService from "@/components/TermsOfService";

export const metadata = { title: "Terms of Service — NexIT-Africa" };

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="legal-wrap">
        <Link href="/" aria-label="NexIT-Africa home"><BrandLogo height={34} /></Link>
        <h1>Terms of Service</h1>
        <TermsOfService />
        <p className="legal-back"><Link href="/privacy" className="link">Privacy Policy</Link> · <Link href="/" className="link">Back to home</Link></p>
      </div>
    </main>
  );
}
