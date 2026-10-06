// Server-only notification helper: one call delivers BOTH an in-app
// notification (the `notifications` table) and a branded email (via Resend,
// when configured). Use this from API routes so no action silently skips a
// channel. Pass a Supabase SERVICE-ROLE client as `admin`.
import { sendEmail } from "@/lib/email";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.APP_URL ||
  "";

const abs = (path) => {
  if (!path) return APP_URL || undefined;
  if (/^https?:\/\//.test(path)) return path;
  return APP_URL ? `${APP_URL.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}` : undefined;
};

/**
 * notifyUser(admin, {
 *   userId,            // profiles.id — for the in-app notification (optional)
 *   email, name,       // recipient; resolved from the profile when omitted
 *   title, body,       // used for both the in-app row and the email
 *   emailSubject,      // overrides the email subject (defaults to `title`)
 *   cta: { label, url|path },  // optional button in the email
 *   inApp = true, email: sendMail = true,
 * })
 * Best-effort: never throws. Returns { inApp, emailSent, reason? }.
 */
export async function notifyUser(admin, opts = {}) {
  const { userId, title, body, emailSubject, cta } = opts;
  let { email, name } = opts;
  const wantInApp = opts.inApp !== false;
  const wantEmail = opts.sendEmail !== false;

  const result = { inApp: false, emailSent: false };
  if (!admin) return result;

  // Resolve recipient contact from the profile if needed.
  if ((!email || !name) && userId) {
    try {
      const { data } = await admin.from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
      email = email || data?.email || null;
      name = name || data?.full_name || null;
    } catch { /* ignore */ }
  }

  // 1) In-app notification.
  if (wantInApp && userId && title) {
    try {
      await admin.from("notifications").insert({ user_id: userId, title, body: body || null, read: false });
      result.inApp = true;
    } catch (e) { result.reason = e.message; }
  }

  // 2) Email.
  if (wantEmail && email && title) {
    const ctaUrl = cta ? abs(cta.url || cta.path) : undefined;
    const r = await sendEmail({
      to: email,
      subject: emailSubject || `NexIT-Africa — ${title}`,
      heading: title,
      paragraphs: [name ? `Hi ${name.split(" ")[0]},` : "Hi there,", body].filter(Boolean),
      cta: ctaUrl ? { label: cta.label || "Open NexIT-Africa", url: ctaUrl } : undefined,
    });
    result.emailSent = !!r.sent;
    if (!r.sent && r.reason && r.reason !== "email-not-configured") result.reason = r.reason;
  }

  return result;
}

export { APP_URL, abs };
