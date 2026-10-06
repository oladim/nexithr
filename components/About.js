import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { IconArrowUpRight } from "./Icons";

const STATS = [
  { value: "3", label: "Interview rounds, one journey" },
  { value: "6", label: "Tech career tracks" },
  { value: "100%", label: "Vetted before employers see you" },
  { value: "24/7", label: "AI interview, on your schedule" },
];

const IMAGES = [
  { src: "/images/team-1.jpg", alt: "A team reviewing growth charts together" },
  { src: "/images/team-2.jpg", alt: "Colleagues reviewing work on a laptop" },
  { src: "/images/team-3.jpg", alt: "Two developers celebrating a win" },
  { src: "/images/team-4.jpg", alt: "Teammates collaborating around a laptop" },
];

export default function About() {
  return (
    <section className="about" id="about">
      <div className="about-inner">
        <Reveal className="section-head">
          <span className="eyebrow">Why NexIT</span>
          <h2>One platform, from first CV to first offer</h2>
          <p>
            Most people never find out <i>why</i> they aren&apos;t getting hired. NexIT-Africa
            fixes that — we diagnose your real level, train you on exactly what&apos;s missing,
            and put you in front of employers only when you&apos;re genuinely ready.
          </p>
        </Reveal>

        <div className="about-grid">
          <Reveal className="about-copy">
            <h3>Built for talent and employers alike</h3>
            <p>
              <b>If you&apos;re a candidate</b>, you get an honest AI diagnostic, a personalised
              plan, and role-specific training that takes you to job-ready — then a spot on a
              board recruiters actually trust.
            </p>
            <p>
              <b>If you&apos;re hiring</b>, every candidate you see has already passed an AI
              screen, a professional interview and an HR round. No more sifting hundreds of CVs
              to find the few who can do the job.
            </p>
            <p>
              The result: tech hiring that&apos;s faster for companies, fairer for candidates,
              and genuinely skills-first.
            </p>
            <Link href="/signup" className="btn btn-fill">
              Create your account <IconArrowUpRight width={18} height={18} />
            </Link>
          </Reveal>

          <Reveal className="about-images" delay={120}>
            {IMAGES.map((im) => (
              <Image key={im.src} src={im.src} alt={im.alt} width={272} height={230} />
            ))}
          </Reveal>
        </div>

        <Reveal className="stats-row" delay={80}>
          {STATS.map((s) => (
            <div key={s.label}>
              <p>{s.value}</p>
              <p>{s.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
