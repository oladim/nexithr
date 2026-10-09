import Link from "next/link";
import { IconInstagram, IconX, IconFacebook, IconLinkedin } from "./Icons";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#home" className="footer-logo" aria-label="NexIT-Africa">
              <BrandLogo tone="dark" height={38} />
            </a>
            <p className="footer-tagline">
              Skills-first tech hiring — diagnose, train, and get verified talent placed, all in one platform.
            </p>
            <div className="footer-contact">
              <p><span>Address</span>No 1B Simeon Adeogun Close, Independence Estate, New Bodija, Ibadan, Nigeria</p>
              <p><span>Phone</span><a href="tel:+2348066932357">+234 806 693 2357</a></p>
              <p><span>Email</span><a href="mailto:support@nexitafrica.com">support@nexitafrica.com</a></p>
            </div>
            <div className="socials">
              <a href="#" aria-label="Instagram"><IconInstagram width={18} height={18} /></a>
              <a href="#" aria-label="X / Twitter"><IconX width={18} height={18} /></a>
              <a href="#" aria-label="Facebook"><IconFacebook width={18} height={18} /></a>
              <a href="#" aria-label="LinkedIn"><IconLinkedin width={18} height={18} /></a>
            </div>
          </div>

          <div className="footer-cols">
            <div className="footer-col">
              <h5>Company</h5>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About us</a></li>
                <li><a href="#process">How it works</a></li>
                <li><a href="#faq">FAQs</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Get started</h5>
              <ul>
                <li><Link href="/signup">Create account</Link></li>
                <li><Link href="/login">Sign in</Link></li>
                <li><a href="#footer">Contact</a></li>
                <li><a href="#faq">Help &amp; FAQs</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-newsletter">
            <h5>Stay in the loop</h5>
            <p>Get the latest from NexIT-Africa — new roles, training and product updates.</p>
            <form action="#" method="post">
              <input type="email" name="email" placeholder="you@email.com" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer-divider" />
        <div className="footer-bottom">
          <div className="credit">© {year} NexIT-Africa. All rights reserved.</div>
          <div className="credit soft">Powered by NexIT</div>
          <div className="legal">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/verify">Verify a certificate</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
