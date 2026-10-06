-- =====================================================================
-- 0020 — Admin-managed landing-page "spotlights": the scrolling testimonial /
-- highlight cards shown in the hero ("NexIT is a life changing discovery").
-- Admins create/edit/reorder them and choose how many appear. Writes run
-- server-side with the service role; the public landing API reads them.
-- Idempotent.
-- =====================================================================

create table if not exists public.landing_spotlights (
  id         uuid primary key default gen_random_uuid(),
  quote      text not null,
  name       text,
  role       text,
  image_url  text,                       -- /images/... bundled path or an external URL
  sort       int  not null default 0,
  enabled    boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists landing_spotlights_sort_idx on public.landing_spotlights(sort);

alter table public.landing_spotlights enable row level security;
-- Anyone (even signed-out visitors) may read enabled spotlights; writes go
-- through the service-role admin API.
drop policy if exists landing_spotlights_public_select on public.landing_spotlights;
create policy landing_spotlights_public_select on public.landing_spotlights
  for select using (enabled);

-- How many spotlights to show in the hero (0 = all enabled).
alter table public.app_settings add column if not exists landing_spotlight_count int not null default 6;

-- Seed a few defaults (only when the table is empty) using the bundled photos.
insert into public.landing_spotlights (quote, name, role, image_url, sort, enabled)
select * from (values
  ('NexIT is a life-changing discovery — the AI interview showed me exactly what to fix, and the training got me job-ready.', 'Amara O.', 'Full-Stack Developer', '/images/team-2.jpg', 0, true),
  ('I went from endless rejections to two offers in six weeks. The role-specific training made all the difference.', 'Tunde A.', 'Data Analyst', '/images/team-3.jpg', 1, true),
  ('As an employer, the candidate board saves us weeks — everyone is already vetted across AI, professional and HR rounds.', 'Chioma E.', 'Hiring Manager', '/images/team-1.jpg', 2, true),
  ('The diagnostic was brutally honest in the best way. I finally knew what to learn next.', 'Kwame B.', 'Cloud Engineer', '/images/team-4.jpg', 3, true)
) as v
where not exists (select 1 from public.landing_spotlights);
