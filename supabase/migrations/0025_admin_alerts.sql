-- =====================================================================
-- 0025 — Admin email alerts.
-- Emails a shared inbox (default support@nexitafrica.com) when candidates,
-- interviewers and recruiters do something the team should know about.
--   * app_settings: where to send, on/off, and which categories.
--   * admin_alerts: a log of every alert (also de-duplicates, so the same
--     event never emails twice). Written by the server only.
-- Idempotent.
-- =====================================================================

alter table public.app_settings add column if not exists admin_alert_email     text    not null default 'support@nexitafrica.com';
alter table public.app_settings add column if not exists admin_alerts_enabled  boolean not null default true;
alter table public.app_settings add column if not exists admin_alert_categories text[] not null
  default array['registrations','cvs','interviews','results','payments','training','jobs'];

create table if not exists public.admin_alerts (
  event_key  text primary key,          -- e.g. 'cv:<uuid>' — one email per event
  category   text not null,
  subject    text not null,
  sent       boolean not null default false,
  error      text,
  created_at timestamptz not null default now()
);
create index if not exists admin_alerts_created_idx on public.admin_alerts(created_at desc);
alter table public.admin_alerts enable row level security;

drop policy if exists admin_alerts_select on public.admin_alerts;
create policy admin_alerts_select on public.admin_alerts
  for select to authenticated using (public.is_admin());
-- No write policies: only the service role writes alerts.
