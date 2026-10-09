import { COMPANY } from "@/lib/company";
import { IconChat, IconFileText } from "@/components/Icons";

// All NexIT-Africa contact details, with one-tap actions.
export default function ContactUs() {
  return (
    <div className="contact-us">
      <p className="contact-lead">Questions about your account, interviews, payments or anything else? Reach us any of these ways.</p>
      <div className="contact-grid">
        <a className="contact-card" href={`mailto:${COMPANY.email}`}>
          <span className="cc-ic" aria-hidden="true"><IconChat width={18} height={18} /></span>
          <span className="cc-k">Email</span>
          <b>{COMPANY.email}</b>
          <span className="cc-a">Send an email</span>
        </a>
        <a className="contact-card" href={COMPANY.website} target="_blank" rel="noopener noreferrer">
          <span className="cc-ic" aria-hidden="true"><IconFileText width={18} height={18} /></span>
          <span className="cc-k">Website</span>
          <b>{COMPANY.websiteLabel}</b>
          <span className="cc-a">Visit website</span>
        </a>
      </div>
    </div>
  );
}
