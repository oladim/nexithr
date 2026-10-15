/**
 * Email sender for NexIT-Africa. Uses Resend if configured, otherwise no-ops
 * gracefully so the rest of the flow (status + in-app notification) still works.
 *
 * To enable real email: set RESEND_API_KEY and a verified sender in
 * EMAIL_FROM (or the legacy CV_REVIEW_FROM_EMAIL) in .env.local. Any provider
 * with an HTTP API can be swapped in here.
 *
 * Every send gets a branded HTML wrapper; when only `text` is given we build
 * the HTML from it automatically, so callers can pass plain text and still get
 * a consistent, good-looking email.
 */

export function emailEnabled() {
  return !!(process.env.RESEND_API_KEY && (process.env.EMAIL_FROM || process.env.CV_REVIEW_FROM_EMAIL));
}

import { EMAIL_SIGNATURE } from "@/lib/company";

const BRAND = "NexIT-Africa";
// Older callers end plain-text mails with their own sign-off; the signature replaces it.
const OLD_SIGNOFF = /\n*\s*(—|--)\s*The NexIT-Africa (team|interview panel)\s*$/i;
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Wrap body text/paragraphs in a simple, email-client-safe template.
// Absolute site URL for the logo image (emails can't use relative paths).
function logoBase() {
  const u = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "";
  return /^https?:\/\//.test(u) ? u.replace(/\/$/, "") : "";
}

function signatureHtml() {
  const [first, ...rest] = EMAIL_SIGNATURE;
  const lines = rest.map((l) => /@/.test(l)
    ? `<a href="mailto:${esc(l)}" style="color:#007bff;text-decoration:none">${esc(l)}</a>`
    : esc(l));
  return `<p style="margin:26px 0 0;color:#1c1f2a;font-size:14px;line-height:1.55">Kind regards,<br><br><b>${esc(first)}</b><br>${lines.join("<br>")}</p>`;
}
export const signatureText = () => `Kind regards,\n\n${EMAIL_SIGNATURE.join("\n")}`;

export function emailShell({ heading, paragraphs = [], cta, signature = true }) {
  const paras = paragraphs
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 14px;color:#1c1f2a;font-size:15px;line-height:1.6">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const button = cta?.url
    ? `<p style="margin:22px 0 0"><a href="${esc(cta.url)}" style="background:#007bff;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-size:15px;font-weight:600;display:inline-block">${esc(cta.label || "Open NexIT-Africa")}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f4f6fb;padding:24px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e9edf5">
      <tr><td style="background:#0b1020;padding:18px 28px">${logoBase()
        ? `<img src="${esc(logoBase())}/images/logo-dark.png" width="146" height="36" alt="NexIT-Africa" style="display:block;border:0;height:36px;width:146px;color:#fff;font-size:18px;font-weight:700">`
        : `<span style="color:#fff;font-size:18px;font-weight:700">NexIT&#8209;Africa</span>`}</td></tr>
      <tr><td style="padding:28px">
        ${heading ? `<h1 style="margin:0 0 16px;font-size:20px;color:#0b1020">${esc(heading)}</h1>` : ""}
        ${paras}
        ${button}
        ${signature ? signatureHtml() : ""}
      </td></tr>
      <tr><td style="padding:18px 28px;border-top:1px solid #eef1f6;color:#8a93a6;font-size:12px;line-height:1.5">
        You're receiving this because you have a ${esc(BRAND)} account. Manage notifications in your account settings.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

// `signature` (default true) adds the Review Committee sign-off; internal admin
// alerts pass signature: false.
export async function sendEmail({ to, subject, text, html, heading, paragraphs, cta, signature = true }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.CV_REVIEW_FROM_EMAIL;
  if (!key || !from || !to) {
    return { sent: false, reason: "email-not-configured" };
  }

  // Build HTML if not supplied: prefer structured fields, else wrap `text`.
  let htmlBody = html;
  if (!htmlBody) {
    const src = signature ? String(text || "").replace(OLD_SIGNOFF, "") : String(text || "");
    const paras = paragraphs && paragraphs.length ? paragraphs : src.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    htmlBody = emailShell({ heading: heading || subject, paragraphs: paras, cta, signature });
  }
  let textBody = text || (paragraphs ? paragraphs.join("\n\n") : subject);
  if (signature) textBody = `${String(textBody).replace(OLD_SIGNOFF, "")}${cta?.url ? `\n\n${cta.label || "Open NexIT-Africa"}: ${cta.url}` : ""}\n\n${signatureText()}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text: textBody, html: htmlBody }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { sent: false, reason: `provider-error: ${res.status} ${body.slice(0, 160)}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}
