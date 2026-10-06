import Link from "next/link";
import Reveal from "./Reveal";
import { IconArrowUpRight } from "./Icons";

export default function CtaBanner() {
  return (
    <section className="cta-banner">
      <div className="bg" />
      <Reveal className="cta-banner-inner">
        <h2>Your next role starts with knowing where you stand</h2>
        <p>Take the free AI interview today and get a personalised, honest plan in minutes.</p>
        <Link href="/signup" className="btn btn-fill btn-lg">
          Get started free <IconArrowUpRight width={18} height={18} />
        </Link>
      </Reveal>
    </section>
  );
}
