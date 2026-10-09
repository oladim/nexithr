import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import PrivacyConsent from "@/components/PrivacyConsent";

export const metadata = { title: "Privacy Policy — NexIT-Africa" };

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-wrap">
        <Link href="/" aria-label="NexIT-Africa home"><BrandLogo height={34} /></Link>
        <h1>Privacy Policy</h1>
        <PrivacyPolicy />
        <PrivacyConsent />
        <p className="legal-back"><Link href="/" className="link">Back to home</Link></p>
      </div>
    </main>
  );
}
