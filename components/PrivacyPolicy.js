import { PRIVACY_UPDATED } from "@/lib/policy";

// The NexIT-Africa Privacy Policy text (shared by /privacy and Settings).
export default function PrivacyPolicy() {
  return (
    <div className="privacy-body">
      <p className="privacy-updated">Last updated {PRIVACY_UPDATED}</p>
      <h4>1. Types of data we collect</h4>
      <p>
        We collect information you provide when you create an account, upload your CV, and complete
        assessments — including your name, contact details, professional background, and interview
        recordings. For employers we collect organisation details and verification documents. This data
        powers your profile, assessments and matching.
      </p>
      <h4>2. Use of your personal data</h4>
      <p>
        Your data is used to run your assessments, generate feedback and training plans, issue and verify
        certificates, match candidates with partner companies on the candidate board, and improve the
        accuracy of our AI evaluations. We do not sell your personal data to third parties.
      </p>
      <h4>3. Disclosure of your personal data</h4>
      <p>
        Once a candidate passes all interview stages and joins the candidate board, verified recruiters from
        partner companies can view their profile and reach them directly. Certificate verification shows only
        what is printed on the certificate. We share data with service providers who host and operate the
        platform (for example hosting, email and payments) under appropriate safeguards.
      </p>
      <h4>4. Retention</h4>
      <p>
        Interview recordings and assessment data are kept only as long as needed to assess you, support your
        progress toward placement and meet legal obligations, and are then deleted or anonymised.
      </p>
      <h4>5. Your rights</h4>
      <p>
        Under the Nigeria Data Protection Act you may request access to, correction of, or deletion of your
        personal data, object to certain processing, and withdraw consent at any time (this does not affect
        processing that already took place).
      </p>
      <h4>6. Contact</h4>
      <p>
        NexIT-Africa, No 1B Simeon Adeogun Close, Independence Estate, New Bodija, Ibadan, Nigeria ·
        support@nexitafrica.com · +234 806 693 2357.
      </p>
    </div>
  );
}
