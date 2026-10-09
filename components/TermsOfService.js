import { TERMS_UPDATED } from "@/lib/policy";

// NexIT-Africa Terms of Service (draft — have it reviewed by a Nigerian
// lawyer before launch). Rendered on /terms.
const S = ({ n, title, children }) => (
  <section id={`s${n}`}>
    <h4>{n}. {title}</h4>
    {children}
  </section>
);

export default function TermsOfService() {
  return (
    <div className="privacy-body terms-body">
      <p className="privacy-updated">Last updated {TERMS_UPDATED}</p>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the NexIT-Africa website, platform and
        services at nexitafrica.com (the &ldquo;Platform&rdquo;), operated by NexIT-Africa, No 1B Simeon Adeogun
        Close, Independence Estate, New Bodija, Ibadan, Nigeria (&ldquo;NexIT&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;). By creating an account or using the Platform you agree to these Terms and to our{" "}
        <a href="/privacy" className="link">Privacy Policy</a>. If you do not agree, do not use the Platform.
      </p>

      <nav className="terms-toc" aria-label="Contents">
        {["Who can use NexIT", "Your account", "Candidates", "AI interview and proctoring", "Professional and HR interviews",
          "Certificates and the N|VP title", "Training", "Employers and recruiters", "Interviewers", "Payments and refunds",
          "Acceptable use", "Your content", "Our intellectual property", "No guarantee of employment", "Liability",
          "Suspension and termination", "Changes", "Governing law and disputes", "Contact"].map((t, i) => (
          <a key={t} href={`#s${i + 1}`}>{i + 1}. {t}</a>
        ))}
      </nav>

      <S n={1} title="Who can use NexIT">
        <p>You must be at least 18 years old and able to enter a binding contract. Interviewer and employer accounts are
          reviewed by NexIT and may only be used once approved. You may hold only one account per role.</p>
      </S>

      <S n={2} title="Your account">
        <p>Give accurate, current information and keep it up to date. You are responsible for everything done through
          your account, so keep your password and two-factor authentication secure and tell us immediately at
          support@nexitafrica.com if you suspect unauthorised access. Accounts are personal and may not be shared,
          sold or transferred.</p>
      </S>

      <S n={3} title="Candidates">
        <p>To progress you must: choose a target role that is open on the Platform, upload a truthful CV that NexIT
          approves, pass the AI interview, then pass the Professional and HR interviews. Passing all stages places you on
          the verified candidate board, where approved employers can view your profile and contact you.</p>
        <p>Retakes, waiting periods, assessment tokens and attempt limits are set out in the app and may change from time
          to time. Results are based on your performance on the day and the judgement of our interviewers; we may reset a
          stage or ask you to retake it where an assessment was affected by a technical problem or a breach of these
          Terms.</p>
      </S>

      <S n={4} title="AI interview and proctoring">
        <p>The AI interview is a voice-based assessment that uses your camera and microphone, is recorded, and is
          monitored for integrity (for example, another person present, reading from notes or a second device). You will
          be asked to consent before it starts. Integrity flags are reviewed by a person and are not automatic findings
          of misconduct. AI-generated scores and feedback are an aid to assessment, may be reviewed or adjusted by NexIT,
          and may contain errors.</p>
      </S>

      <S n={5} title="Professional and HR interviews">
        <p>Human interviews are booked through the Platform and held online. NexIT assigns the interviewer. Please join on
          time; repeated no-shows may use up an attempt or delay your progress. Interviewers&rsquo; verdicts are final for
          that attempt, subject to any retake rules shown in the app.</p>
      </S>

      <S n={6} title="Certificates and the N|VP title">
        <p>Candidates who pass every stage receive a NexIT Verified Professional (N|VP) certificate with a unique number
          that anyone can verify at nexitafrica.com/verify. You may use the N|VP title after your name and share your
          certificate while it is valid.</p>
        <p>The certificate confirms that you passed NexIT&rsquo;s assessments on the stated date; it is not an academic
          qualification or a licence. You must not alter, misrepresent or forge a certificate. We may withdraw a
          certificate if it was obtained through fraud, misrepresentation or a breach of these Terms, or if a stage is
          later reset; a withdrawn certificate will show as not valid on the verification page.</p>
      </S>

      <S n={7} title="Training">
        <p>Suggested training and AI-generated plans are guidance only. Specific (Foundational or Intensive) programmes are
          delivered as described in the app at the time you enrol, including any live practical sessions. Course content,
          schedules and tutors may change where reasonably necessary. Assignment and test results are released by your
          tutor. Course materials are for your personal learning only and may not be shared or resold. Any placement
          support or guarantee applies only under the conditions stated for that programme when you enrol.</p>
      </S>

      <S n={8} title="Employers and recruiters">
        <p>Employer accounts may be used only to recruit for genuine roles at the organisation you represent. You must:
          keep candidate information confidential and use it only for recruitment; comply with Nigerian employment and
          data-protection law; not charge candidates any fee; and not post misleading or discriminatory jobs. Jobs you
          post are published only after NexIT approves them.</p>
        <p>Where a placement fee applies, it is shown in the app or agreed in writing, and is payable when a candidate you
          met through the Platform is hired. You agree not to avoid this fee by hiring a candidate outside the Platform
          within 12 months of being introduced to them through NexIT.</p>
      </S>

      <S n={9} title="Interviewers">
        <p>Professional and HR interviewers act as independent contractors, not employees, unless agreed otherwise in
          writing. You must conduct assigned interviews professionally and impartially, declare any conflict of interest,
          keep candidate information and recordings confidential, and submit an honest verdict based only on the
          interview. Fees and payment timing are as shown in your interviewer portal or agreed in writing.</p>
      </S>

      <S n={10} title="Payments and refunds">
        <p>Prices for subscriptions, training and other paid services are shown in the app in Nigerian Naira (NGN) and
          are processed securely by our payment provider (Paystack). The annual subscription runs for 12 months from
          payment and does not renew automatically unless the app says otherwise.</p>
        <p>Because digital access starts immediately, payments are generally non-refundable once access has been
          provided, except where required by law, where you were charged in error or twice, or where we cannot provide a
          paid service. Contact support@nexitafrica.com within 14 days of payment to request a review.</p>
      </S>

      <S n={11} title="Acceptable use">
        <p>You must not: cheat or get help during an assessment, impersonate someone else or let someone take an
          assessment for you; upload false documents; copy, record or share interview questions or course content;
          harass or discriminate against anyone; scrape, reverse-engineer, overload or try to bypass the security of the
          Platform; or use the Platform for anything unlawful. We may investigate suspected breaches and act under
          section 16.</p>
      </S>

      <S n={12} title="Your content">
        <p>You keep ownership of the CV, documents, answers and other content you submit. You grant NexIT a non-exclusive,
          royalty-free licence to store, process and display that content as needed to run the Platform, assess you,
          show your profile to approved employers (for board candidates) and improve our assessments, as described in
          our Privacy Policy. You confirm you have the right to submit it.</p>
      </S>

      <S n={13} title="Our intellectual property">
        <p>The Platform, NexIT and N|VP names and logos, assessments, interview questions, course materials and software
          belong to NexIT or our licensors. You may use them only as allowed by these Terms.</p>
      </S>

      <S n={14} title="No guarantee of employment">
        <p>NexIT helps candidates become job-ready and connects them with employers, but we do not guarantee interviews,
          job offers, salaries or any particular outcome, and employers make their own hiring decisions. Equally, we do
          not guarantee that any candidate will suit an employer&rsquo;s needs; employers should carry out their own
          checks before hiring.</p>
      </S>

      <S n={15} title="Liability">
        <p>The Platform is provided &ldquo;as is&rdquo; and we do not promise it will always be available or error-free.
          To the extent permitted by law, NexIT is not liable for indirect or consequential loss, loss of earnings or
          opportunity, or for the acts of employers, candidates or interviewers. Our total liability to you for any claim
          is limited to the amount you paid us in the 12 months before the claim. Nothing in these Terms limits liability
          that cannot be limited by law.</p>
      </S>

      <S n={16} title="Suspension and termination">
        <p>You may close your account at any time by contacting support@nexitafrica.com. We may suspend or close an account,
          reset assessment results, or withdraw a certificate if you breach these Terms, if required by law, or to protect
          other users or the Platform. Where reasonable, we will tell you why. Sections that by their nature should
          survive (including 6, 8, 12–15 and 18) continue after closure.</p>
      </S>

      <S n={17} title="Changes">
        <p>We may update these Terms. If a change is material we will notify you in the app or by email before it takes
          effect. Continuing to use the Platform after that date means you accept the updated Terms.</p>
      </S>

      <S n={18} title="Governing law and disputes">
        <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Please contact us first so we can try to
          resolve any complaint informally. If it cannot be resolved within 30 days, the courts of Oyo State, Nigeria will
          have jurisdiction, without affecting any rights you have under consumer protection law.</p>
      </S>

      <S n={19} title="Contact">
        <p>NexIT-Africa, No 1B Simeon Adeogun Close, Independence Estate, New Bodija, Ibadan, Nigeria · support@nexitafrica.com
          · +234 806 693 2357.</p>
      </S>
    </div>
  );
}
