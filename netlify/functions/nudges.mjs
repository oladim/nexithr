// Netlify Scheduled Function — once a day, asks the app to remind candidates
// of their next step (Admin → Settings → Reminders controls the timing).
// Needs CRON_SECRET in Netlify env (same value the app reads).
export default async () => {
  const base = process.env.URL || process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) return new Response("CRON_SECRET or URL missing", { status: 500 });
  const res = await fetch(`${base.replace(/\/$/, "")}/api/cron/nudges`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  return new Response(await res.text(), { status: res.status });
};

// 09:00 West Africa Time (08:00 UTC) every day.
export const config = { schedule: "0 8 * * *" };
