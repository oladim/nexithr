"use client";

import { useState } from "react";
import Link from "next/link";
import { FAQS } from "@/components/Faq";
import { COMPANY } from "@/lib/company";
import { IconChevronDown } from "@/components/Icons";

const INTERVIEWER_FAQS = [
  { q: "How do I get interviews?", a: "When a candidate books a Professional or HR interview, a NexIT admin assigns it to an interviewer of that type. You get a notification and an email with the date, time and Google Meet link, and it appears under Interview." },
  { q: "How do I submit my verdict?", a: "After the interview, open the candidate from Interview, rate them, add strengths and areas to improve, and choose whether they advance. The candidate is notified straight away, so please submit only once you're sure." },
  { q: "When and how do I get paid?", a: "You earn the interview fee as soon as you submit your verdict for an interview you were assigned. Add your bank account in Earnings and request a withdrawal once you reach the minimum payout." },
  { q: "I can't make an interview I was assigned — what do I do?", a: `Tell us as early as possible at ${COMPANY.email} so we can reassign it and let the candidate know.` },
  { q: "Why do I need two-factor authentication?", a: "Interviewers see candidates' personal details and results, so every account is protected with an authenticator app. Manage it in Settings › Security & 2FA." },
];

/**
 * Help & support dropdown: common questions as an accordion, a link to the
 * full FAQ page, and a way to reach us. `audience`: "candidate" | "interviewer".
 */
export default function HelpSupport({ audience = "candidate", onContact }) {
  const list = audience === "interviewer"
    ? INTERVIEWER_FAQS
    : FAQS.filter((f) => !/employer/i.test(f.q));
  const [open, setOpen] = useState(-1);

  return (
    <div className="help-sup">
      <div className="help-list">
        {list.map((f, i) => {
          const isOpen = open === i;
          return (
            <div className={`help-item ${isOpen ? "open" : ""}`} key={f.q}>
              <button type="button" aria-expanded={isOpen} aria-controls={`help-a-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                <span>{f.q}</span>
                <IconChevronDown width={16} height={16} aria-hidden="true" />
              </button>
              {isOpen && <p id={`help-a-${i}`}>{f.a}</p>}
            </div>
          );
        })}
      </div>
      <div className="help-foot">
        <Link href="/#faq" className="btn-outline">See all FAQs</Link>
        {onContact
          ? <button type="button" className="btn-solid" onClick={onContact}>Still need help? Contact us</button>
          : <a className="btn-solid" href={`mailto:${COMPANY.email}`}>Still need help? Email us</a>}
      </div>
    </div>
  );
}
