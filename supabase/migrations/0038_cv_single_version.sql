-- =====================================================================
-- 0038 — One CV per candidate per role.
--
-- Uploading a new CV REPLACES the one on record for that role (the old file
-- is deleted), so the admin queue only ever shows the current version.
--   * cvs.revision / previous_status / previous_note / resubmitted_at — so a
--     reviewer can see "Resubmitted (v2) after: Changes requested — <note>".
--   * Existing duplicates are cleaned up: the newest CV per candidate + role is
--     kept, older rows are deleted and their files queued in storage_trash
--     (the app deletes queued files from Storage — SQL can't).
--   * A unique index makes a second CV for the same role impossible.
-- Idempotent.
-- =====================================================================

alter table public.cvs add column if not exists revision        int not null default 1;
alter table public.cvs add column if not exists previous_status text;
alter table public.cvs add column if not exists previous_note   text;
alter table public.cvs add column if not exists resubmitted_at  timestamptz;

-- Files waiting to be removed from Storage (service role only).
create table if not exists public.storage_trash (
  id        bigserial primary key,
  bucket    text not null,
  path      text not null,
  queued_at timestamptz not null default now(),
  unique (bucket, path)
);
alter table public.storage_trash enable row level security;
-- No policies: only the server (service role) reads or writes it.

-- ---- clean up duplicates (keep the newest per candidate + role) ----
with ranked as (
  select id, candidate_id, coalesce(role_key, '') as rk, file_path,
         row_number() over (partition by candidate_id, coalesce(role_key, '') order by uploaded_at desc, id desc) as rn,
         count(*)     over (partition by candidate_id, coalesce(role_key, '')) as n
  from public.cvs
),
q as (
  insert into public.storage_trash (bucket, path)
  select 'cvs', file_path from ranked where rn > 1 and file_path is not null
  on conflict do nothing
  returning 1
),
keep as (
  update public.cvs c set revision = greatest(c.revision, r.n::int)
  from ranked r where r.id = c.id and r.rn = 1 and r.n > 1
  returning 1
)
delete from public.cvs c using ranked r where r.id = c.id and r.rn > 1;

create unique index if not exists cvs_one_per_role on public.cvs (candidate_id, coalesce(role_key, ''));

-- Upload attempts, for the daily rate limit (service role only).
create table if not exists public.cv_upload_log (
  id           bigserial primary key,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  at           timestamptz not null default now()
);
create index if not exists cv_upload_log_idx on public.cv_upload_log(candidate_id, at desc);
alter table public.cv_upload_log enable row level security;
