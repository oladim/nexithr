"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconMenu, IconX } from "./Icons";
import { useAuth } from "@/components/context/AuthContext";
import { portalHome } from "@/lib/portal";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#process", label: "How it works" },
  { href: "#nvp", label: "N|VP" },
  { href: "#faq", label: "FAQs" },
  { href: "#footer", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Signed-in visitors see their account instead of "Sign in".
  const { user, hydrated, role } = useAuth();
  const signedIn = hydrated && !!user;
  const home = portalHome(role);
  const first = (user?.name || "").split(" ")[0] || "Account";
  const initials = (user?.name || "U").split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-shell">
        <Link href="#home" className="logo" onClick={() => setOpen(false)}>
          <Image src="/images/logo.png" alt="NexIT-Africa" width={150} height={38} priority />
        </Link>

        <nav className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>

        <div className="nav-cta">
          {signedIn ? (
            <>
              <Link href={home} className="nav-me" title={`Signed in as ${user.name || user.email}`}>
                <span className="nav-me-pic" aria-hidden="true">{initials}</span>
                <span className="nav-me-nm">Hi, {first}</span>
              </Link>
              <Link href={home} className="btn btn-fill">Go to my dashboard</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost-sm">Sign in</Link>
              <Link href="/signup" className="btn btn-fill">Get Started</Link>
            </>
          )}
        </div>

        <button className="nav-burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          {open ? <IconX width={22} height={22} /> : <IconMenu width={22} height={22} />}
        </button>
      </div>

      <div className={`nav-drawer ${open ? "open" : ""}`}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
        <div className="nav-drawer-cta">
          {signedIn ? (
            <Link href={home} className="btn btn-fill" onClick={() => setOpen(false)}>Go to my dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost-sm" onClick={() => setOpen(false)}>Sign in</Link>
              <Link href="/signup" className="btn btn-fill" onClick={() => setOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
