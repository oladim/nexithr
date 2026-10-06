import { IconBolt } from "./Icons";

const ITEMS = [
  "AI-powered diagnostics",
  "Role-specific training",
  "Verified candidate board",
  "Live Professional & HR rounds",
  "Direct employer hiring",
  "Skills-first, not CV-first",
];

export default function LogosStrip() {
  // A continuously scrolling marquee of what NexIT delivers. The content is
  // duplicated so the loop is seamless.
  return (
    <section className="logos-strip" aria-hidden="true">
      <div className="marquee">
        <div className="marquee-track">
          {[...ITEMS, ...ITEMS].map((name, i) => (
            <span key={i}><IconBolt /> {name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
