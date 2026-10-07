"use client";

import { useState } from "react";
import Image from "next/image";
import Reveal from "./Reveal";
import { IconToggle } from "./Icons";

const FAQS = [
  {
    q: "What exactly is NexIT-Africa?",
    a: "NexIT-Africa is a tech recruitment and training platform. It takes you through an AI interview that diagnoses your real level, role-specific training that closes your gaps, and professional + HR interviews — then places you on a verified candidate board where employers hire you directly.",
  },
  {
    q: "How does the AI interview work?",
    a: "It's a real, voice-based conversation with an AI interviewer that adapts to your answers. It scores five competencies, gives you an honest readiness band, and generates a personalised plan of technical and professional skills to work on.",
  },
  {
    q: "What is N|VP and how do I earn it?",
    a: "N|VP stands for NexIT Verified Professional. You earn it by passing all three stages — the AI interview, the Professional interview and the HR interview. You can then print your certificate from your dashboard and add N|VP after your name on your CV, LinkedIn and email signature. Each certificate has a unique number and QR code that anyone can check at nexitafrica.com/verify.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. You get 3 free AI interview attempts. After that you can keep going with an annual subscription (which unlocks unlimited retakes and suggested training), or wait out the one-month retake window between free attempts.",
  },
  {
    q: "What does it cost?",
    a: "Signing up and your first attempts are free. The annual subscription unlocks unlimited AI retakes and suggested training. Role-specific intensive training is a separate one-time purchase and includes mentorship and live practical sessions. Exact prices are shown in-app and set per role.",
  },
  {
    q: "Do I have to pay for training to get hired?",
    a: "No. Training is there to help you close real gaps when the diagnostic shows them. If you're already job-ready, you can move straight through the interview stages and onto the candidate board.",
  },
  {
    q: "How are the Professional and HR interviews run?",
    a: "Once you pass the AI stage you book them on Google Meet — together or separately. The meeting link appears on your dashboard and is added to everyone's calendar automatically.",
  },
  {
    q: "I'm an employer — how do I use NexIT?",
    a: "You browse a board of candidates who've already passed the AI screen, a professional interview and an HR round. You can post jobs, review applicants, and send hire requests directly — no sifting through hundreds of CVs.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your CV and interview data are stored privately and used only to assess your readiness and match you with employers. Every account is protected with mandatory two-factor authentication, and you can request deletion at any time.",
  },
  {
    q: "Can I update my CV or change my target role later?",
    a: "You can re-upload your CV anytime from your dashboard. Your target role locks once your interview pipeline has started, to keep your assessments consistent — contact support if you need it changed.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq" id="faq">
      <div className="wrap">
        <Reveal className="section-head" style={{ marginBottom: 56 }}>
          <span className="eyebrow">FAQs</span>
          <h2>Frequently asked questions</h2>
          <p>Everything you need to know about how NexIT-Africa works.</p>
        </Reveal>

        <Reveal className="faq-inner" delay={60}>
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className={`faq-item ${isOpen ? "open" : ""}`} key={item.q}>
                <button className="faq-q" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                  {item.q}
                  <span className={`faq-icn ${isOpen ? "open" : ""}`}><IconToggle color="var(--blue)" /></span>
                </button>
                <div className="faq-a" style={{ maxHeight: isOpen ? 320 : 0 }}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </Reveal>

        <Reveal className="faq-cta" delay={60}>
          <div className="avatar-group">
            <Image src="/images/avatar.png" alt="" width={48} height={48} />
            <Image src="/images/user.png" alt="" width={48} height={48} />
            <Image src="/images/avatar.png" alt="" width={56} height={56} />
          </div>
          <h4>Still have questions?</h4>
          <p>Can&apos;t find the answer you&apos;re looking for? Our friendly team is happy to help.</p>
          <a href="#footer" className="btn btn-fill">Get in touch</a>
        </Reveal>
      </div>
    </section>
  );
}
