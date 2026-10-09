// Netlify Scheduled Function — runs every hour and asks the app to send
// interview reminders. Needs CRON_SECRET set in Netlify env (same value the
// app reads). URL is provided by Netlify automatically.
export default async () => {
  const base = process.env.URL || process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) return new Response("CRON_SECRET or URL missing", { status: 500 });
  const res = await fetch(`${base.replace(/\/$/, "")}/api/cron/interview-reminders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  return new Response(await res.text(), { status: res.status });
};

export const config = { schedule: "@hourly" };
