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

const BRAND = "NexIT-Africa";
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Wrap body text/paragraphs in a simple, email-client-safe template.
export function emailShell({ heading, paragraphs = [], cta }) {
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
      <tr><td style="background:#0b1020;padding:20px 28px"><span style="color:#fff;font-size:18px;font-weight:700">NexIT&#8209;Africa</span></td></tr>
      <tr><td style="padding:28px">
        ${heading ? `<h1 style="margin:0 0 16px;font-size:20px;color:#0b1020">${esc(heading)}</h1>` : ""}
        ${paras}
        ${button}
      </td></tr>
      <tr><td style="padding:18px 28px;border-top:1px solid #eef1f6;color:#8a93a6;font-size:12px;line-height:1.5">
        You're receiving this because you have a ${esc(BRAND)} account. Manage notifications in your account settings.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export async function sendEmail({ to, subject, text, html, heading, paragraphs, cta }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.CV_REVIEW_FROM_EMAIL;
  if (!key || !from || !to) {
    return { sent: false, reason: "email-not-configured" };
  }

  // Build HTML if not supplied: prefer structured fields, else wrap `text`.
  let htmlBody = html;
  if (!htmlBody) {
    const paras = paragraphs && paragraphs.length ? paragraphs : String(text || "").split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    htmlBody = emailShell({ heading: heading || subject, paragraphs: paras, cta });
  }
  const textBody = text || (paragraphs ? paragraphs.join("\n\n") : subject);

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
