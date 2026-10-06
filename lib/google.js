/**
 * Google Meet / Calendar helper — SERVER ONLY.
 *
 * Real mode: set GOOGLE_SERVICE_ACCOUNT_KEY (the full service-account JSON) and
 * GOOGLE_IMPERSONATE_EMAIL (a Google Workspace user the service account may act
 * as, via domain-wide delegation). Then createMeetEvent() creates a real
 * Calendar event WITH a Google Meet link and invites the attendees (so it lands
 * on the interviewers' calendars).
 *
 * Mock mode (no credentials): returns a realistic meet.google.com link and
 * reports the attendees it *would* invite, so the whole flow is testable. Swap
 * in credentials later with no code change.
 *
 * Implemented with Node's crypto (no extra npm dependency).
 */
import crypto from "crypto";

export function googleEnabled() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_IMPERSONATE_EMAIL);
}

// A realistic Meet-style code: xxx-xxxx-xxx (lowercase letters).
function mockMeetCode() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const pick = (n) => Array.from({ length: n }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  return `${pick(3)}-${pick(4)}-${pick(3)}`;
}

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Sign a Google OAuth2 service-account JWT and exchange it for an access token.
async function getAccessToken(key, impersonate, scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: key.client_email,
    sub: impersonate, // act as this Workspace user (domain-wide delegation)
    scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = signer.sign(key.private_key).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(data.error_description || data.error || "token error");
  return data.access_token;
}

/**
 * Create a Meet event. Returns { meetLink, eventId, attendees, mock } or { error }.
 * @param {object} opts
 * @param {string} opts.summary
 * @param {string} opts.description
 * @param {string} opts.startISO  RFC3339 start
 * @param {string} opts.endISO    RFC3339 end
 * @param {string[]} opts.attendees  emails to invite (interviewers + candidate)
 * @param {string} opts.timeZone
 */
export async function createMeetEvent({ summary, description, startISO, endISO, attendees = [], timeZone = "Africa/Lagos" }) {
  const cleanAttendees = [...new Set(attendees.filter(Boolean))];

  if (!googleEnabled()) {
    return { meetLink: `https://meet.google.com/${mockMeetCode()}`, eventId: null, attendees: cleanAttendees, mock: true };
  }

  let key;
  try { key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY); }
  catch { return { error: "GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON" }; }

  try {
    const token = await getAccessToken(key, process.env.GOOGLE_IMPERSONATE_EMAIL, "https://www.googleapis.com/auth/calendar");
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    const body = {
      summary,
      description,
      start: { dateTime: startISO, timeZone },
      end: { dateTime: endISO, timeZone },
      attendees: cleanAttendees.map((email) => ({ email })),
      conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
    };
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
      { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    const data = await res.json();
    if (!res.ok) return { error: data.error?.message || `Calendar ${res.status}` };
    const meetLink = data.hangoutLink || data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri || null;
    return { meetLink, eventId: data.id, attendees: cleanAttendees, mock: false };
  } catch (e) {
    return { error: e.message };
  }
}

// A Google Calendar "add event" URL the candidate can click to save it to their
// own calendar (works without any credentials).
export function googleCalendarAddUrl({ summary, details, startISO, endISO }) {
  const fmt = (iso) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary || "Interview",
    details: details || "",
    dates: `${fmt(startISO)}/${fmt(endISO)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
