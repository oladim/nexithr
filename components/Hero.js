"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconMessage, IconCheck, IconArrowUpRight } from "./Icons";

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg-grid" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span className="dot" /> AI-powered tech hiring &amp; training
          </span>
          <h1>
            Get <span className="grad-text">tech-ready</span>, get verified,
            <br className="hide-sm" /> get hired.
          </h1>
          <p className="lead">
            NexIT-Africa takes you from CV to job offer in one place: an
            <b> AI interview</b> that pinpoints your gaps, <b>role-specific training</b> that
            closes them, and a <b>verified candidate board</b> where employers hire
            you directly — no more guessing what you&apos;re missing.
          </p>

          <div className="hero-actions">
            <Link href="/signup" className="btn btn-fill btn-lg">
              Start free <IconArrowUpRight width={18} height={18} />
            </Link>
            <Link href="/login" className="btn btn-stroke btn-lg">I have an account</Link>
          </div>

          <ul className="hero-trust">
            <li><IconCheck width={16} height={16} /> 3 free AI interview attempts</li>
            <li><IconCheck width={16} height={16} /> No credit card to start</li>
          </ul>

          <HeroSpotlights />
        </div>

        <div className="hero-visual">
          <div className="hero-blob" />

          {/* Cohesive product preview */}
          <div className="preview-card">
            <div className="preview-head">
              <div className="pc-user">
                <Image src="/images/avatar.png" alt="" width={40} height={40} />
                <div>
                  <b>Akin&apos;s readiness report</b>
                  <span>Full-Stack Developer · AI diagnostic</span>
                </div>
              </div>
              <span className="pc-band">Ready</span>
            </div>

            <div className="preview-score">
              <div className="pc-ring"><b>82</b><small>/100</small></div>
              <div className="pc-bars">
                {[["Technical", 84], ["Communication", 78], ["Problem solving", 73], ["Teamwork", 80], ["Motivation", 88]].map(([k, v]) => (
                  <div className="pcb" key={k}>
                    <span>{k}</span>
                    <div className="pcb-track"><i style={{ width: `${v}%` }} /></div>
                    <em>{v}</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="preview-steps">
              <span className="done"><IconCheck width={13} height={13} /> CV reviewed</span>
              <span className="done"><IconCheck width={13} height={13} /> AI interview</span>
              <span className="active">Professional interview</span>
            </div>
          </div>

          <div className="float-chip chip-a">
            <span className="fc-ic green"><IconCheck width={14} height={14} /></span>
            <div><b>CV approved</b><small>You can start your AI interview</small></div>
          </div>
          <div className="float-chip chip-b">
            <span className="fc-ic blue"><IconMessage width={14} height={14} /></span>
            <div><b>Recruiter viewed you</b><small>You&apos;re on the candidate board 🎉</small></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Admin-managed, auto-rotating spotlight ("NexIT is a life-changing discovery").
function HeroSpotlights() {
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await (await fetch("/api/landing/spotlights")).json();
        if (Array.isArray(d.spotlights) && d.spotlights.length) setItems(d.spotlights);
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    timer.current = setInterval(() => setIdx((i) => (i + 1) % items.length), 4200);
    return () => clearInterval(timer.current);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="hero-spotlight" aria-live="polite">
      <div className="spot-viewport">
        {items.map((it, i) => (
          <figure key={it.id || i} className={`spot-card ${i === idx ? "active" : ""}`} aria-hidden={i !== idx}>
            {it.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="spot-av" src={it.image_url} alt="" />
            ) : <span className="spot-av spot-av-fallback">{(it.name || "N")[0]}</span>}
            <figcaption>
              <p className="spot-quote">&ldquo;{it.quote}&rdquo;</p>
              <span className="spot-who">{[it.name, it.role].filter(Boolean).join(" · ")}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {items.length > 1 && (
        <div className="spot-dots">
          {items.map((_, i) => (
            <button key={i} className={i === idx ? "on" : ""} aria-label={`Spotlight ${i + 1}`} onClick={() => setIdx(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
