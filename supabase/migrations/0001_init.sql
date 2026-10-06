-- =====================================================================
-- NexIT-Africa — initial schema
-- Postgres / Supabase. Run in the Supabase SQL editor or via `supabase db push`.
-- Covers: profiles & roles, candidates, interviewers, CVs, interviews,
-- AI results, human-stage attempts, interviewer notes, jobs, applications,
-- token & payment ledgers, notifications — with Row-Level Security.
-- =====================================================================

-- ---- Extensions -----------------------------------------------------
create extension if not exists "pgcrypto";

-- ---- Enums ----------------------------------------------------------
do $$ begin
  create type user_role        as enum ('candidate','interviewer','recruiter','admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type interviewer_kind as enum ('Professional','HR');
exception when duplicate_object then null; end $$;
do $$ begin
  create type interview_type   as enum ('AI','Professional','HR');
exception when duplicate_object then null; end $$;
do $$ begin
  create type interview_mode   as enum ('Virtual','In-person','HR In-House');
exception when duplicate_object then null; end $$;
do $$ begin
  create type interview_status as enum ('Confirmed','Completed','Cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type stage_kind       as enum ('Professional','HR');
exception when duplicate_object then null; end $$;
do $$ begin
  create type cv_status        as enum ('Pending review','Approved','Rejected');
exception when duplicate_object then null; end $$;
do $$ begin
  create type kyc_status       as enum ('Unverified','Pending','Verified');
exception when duplicate_object then null; end $$;
do $$ begin
  create type txn_type         as enum ('grant','purchase','spend');
exception when duplicate_object then null; end $$;
do $$ begin
  create type pay_status       as enum ('Pending','Paid');
exception when duplicate_object then null; end $$;

-- ---- Core tables ----------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'candidate',
  full_name   text,
  email       text,
  phone       text,
  country     text default 'Nigeria',
  avatar_url  text,
  about       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.candidates (
  id          uuid primary key references public.profiles(id) on delete cascade,
  target_role text,
  experience  text,
  skills      text[] default '{}',
  job_type    text default 'Full-time',
  tokens      int  not null default 3,
  kyc         kyc_status not null default 'Unverified',
  on_board    boolean not null default false,
  avg_score   numeric,
  top_skill   text,
  created_at  timestamptz not null default now()
);

create table if not exists public.interviewers (
  id           uuid primary key references public.profiles(id) on delete cascade,
  kind         interviewer_kind not null default 'Professional',
  expertise    text[] default '{}',
  rating       numeric default 0,
  total_earned numeric default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.cvs (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  file_path    text,
  file_name    text not null,
  industry     text,
  job_type     text default 'Full-time',
  status       cv_status not null default 'Pending review',
  uploaded_at  timestamptz not null default now()
);
create index if not exists cvs_candidate_idx on public.cvs(candidate_id);

create table if not exists public.interviews (
  id             uuid primary key default gen_random_uuid(),
  candidate_id   uuid not null references public.candidates(id) on delete cascade,
  type           interview_type not null,
  mode           interview_mode not null default 'Virtual',
  role           text,
  scheduled_date text,
  scheduled_time text,
  interviewer_id uuid references public.profiles(id) on delete set null,
  status         interview_status not null default 'Confirmed',
  created_at     timestamptz not null default now()
);
create index if not exists interviews_candidate_idx on public.interviews(candidate_id);
create index if not exists interviews_interviewer_idx on public.interviews(interviewer_id);

-- One AI-interview record per candidate (latest state).
create table if not exists public.ai_interviews (
  candidate_id uuid primary key references public.candidates(id) on delete cascade,
  attempts     int not null default 0,
  last_score   numeric,
  passed       boolean not null default false,
  breakdown    jsonb,
  feedback     text,
  updated_at   timestamptz not null default now()
);

-- Each human-stage attempt (Professional / HR).
create table if not exists public.stage_attempts (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  stage        stage_kind not null,
  attempt_no   int not null,
  passed       boolean not null default false,
  verdict      text,
  avg          numeric,
  strengths    text[] default '{}',
  improvements text[] default '{}',
  summary      text,
  created_at   timestamptz not null default now()
);
create index if not exists stage_attempts_candidate_idx on public.stage_attempts(candidate_id, stage);

-- A human interviewer's notes on a candidate for a stage.
create table if not exists public.interviewer_notes (
  id             uuid primary key default gen_random_uuid(),
  interviewer_id uuid not null references public.profiles(id) on delete cascade,
  candidate_id   uuid not null references public.candidates(id) on delete cascade,
  stage          stage_kind not null,
  rating         int check (rating between 1 and 5),
  strengths      text,
  improvements   text,
  note           text,
  created_at     timestamptz not null default now(),
  unique (interviewer_id, candidate_id, stage)
);
create index if not exists notes_candidate_idx on public.interviewer_notes(candidate_id, stage);

create table if not exists public.jobs (
  id        uuid primary key default gen_random_uuid(),
  title     text not null,
  company   text,
  type      text default 'Full-time',
  location  text,
  posted_at timestamptz not null default now()
);

create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id       uuid not null references public.jobs(id) on delete cascade,
  status       text default 'Applied',
  created_at   timestamptz not null default now(),
  unique (candidate_id, job_id)
);

-- Assessment-token ledger (grants, purchases, retry spends).
create table if not exists public.token_transactions (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  type         txn_type not null,
  amount       int not null,
  reason       text,
  created_at   timestamptz not null default now()
);

-- Interviewer payouts.
create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  interviewer_id uuid references public.profiles(id) on delete set null,
  candidate_name text,
  position       text,
  amount         numeric not null default 0,
  status         pay_status not null default 'Pending',
  created_at     timestamptz not null default now()
);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id);

create table if not exists public.notification_prefs (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  prefs   jsonb not null default '{}'
);

-- ---- Helper functions (SECURITY DEFINER, avoid RLS recursion) --------
create or replace function public.role_of(uid uuid)
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = uid;
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.role_of(auth.uid()) = 'admin', false);
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.role_of(auth.uid()) in ('admin','recruiter','interviewer'), false);
$$;

-- ---- New-user trigger: create profile (+ role sub-row) --------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r user_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'candidate');
begin
  insert into public.profiles (id, email, full_name, role, phone, country)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    r,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'country','Nigeria')
  );

  if r = 'candidate' then
    insert into public.candidates (id, target_role, experience, skills, job_type)
    values (
      new.id,
      new.raw_user_meta_data->>'target_role',
      new.raw_user_meta_data->>'experience',
      coalesce(string_to_array(nullif(new.raw_user_meta_data->>'skills',''), ','), '{}'),
      coalesce(new.raw_user_meta_data->>'job_type','Full-time')
    );
    insert into public.ai_interviews (candidate_id) values (new.id);
    insert into public.token_transactions (candidate_id, type, amount, reason)
      values (new.id, 'grant', 3, 'Welcome tokens');
  elsif r = 'interviewer' then
    insert into public.interviewers (id, kind)
    values (new.id, coalesce((new.raw_user_meta_data->>'interviewer_kind')::interviewer_kind,'Professional'));
  end if;

  insert into public.notification_prefs (user_id) values (new.id);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row-Level Security
-- =====================================================================
alter table public.profiles           enable row level security;
alter table public.candidates         enable row level security;
alter table public.interviewers       enable row level security;
alter table public.cvs                enable row level security;
alter table public.interviews         enable row level security;
alter table public.ai_interviews      enable row level security;
alter table public.stage_attempts     enable row level security;
alter table public.interviewer_notes  enable row level security;
alter table public.jobs               enable row level security;
alter table public.applications       enable row level security;
alter table public.token_transactions enable row level security;
alter table public.payments           enable row level security;
alter table public.notifications      enable row level security;
alter table public.notification_prefs enable row level security;

-- profiles: readable by any authenticated user (names/avatars shown across
-- portals); each user edits only their own; admins manage all.
create policy profiles_select on public.profiles
  for select to authenticated using (true);
create policy profiles_update on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_insert on public.profiles
  for insert to authenticated with check (id = auth.uid() or public.is_admin());

-- candidates: own row; on-board candidates visible to staff; admins all.
create policy candidates_select on public.candidates
  for select to authenticated
  using (id = auth.uid() or on_board or public.is_staff());
create policy candidates_update on public.candidates
  for update to authenticated using (id = auth.uid() or public.is_admin());
create policy candidates_insert on public.candidates
  for insert to authenticated with check (id = auth.uid() or public.is_admin());

-- interviewers: self-manage; anyone authenticated may read (shown on cards).
create policy interviewers_select on public.interviewers
  for select to authenticated using (true);
create policy interviewers_cud on public.interviewers
  for all to authenticated using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- cvs: candidate owns; staff may read.
create policy cvs_select on public.cvs
  for select to authenticated
  using (candidate_id = auth.uid() or public.is_staff());
create policy cvs_write on public.cvs
  for all to authenticated
  using (candidate_id = auth.uid() or public.is_admin())
  with check (candidate_id = auth.uid() or public.is_admin());

-- interviews: candidate owns; assigned interviewer sees theirs; admins all.
create policy interviews_select on public.interviews
  for select to authenticated
  using (candidate_id = auth.uid() or interviewer_id = auth.uid() or public.is_admin());
create policy interviews_write on public.interviews
  for all to authenticated
  using (candidate_id = auth.uid() or public.is_admin())
  with check (candidate_id = auth.uid() or public.is_admin());

-- ai_interviews: candidate owns; staff may read.
create policy ai_select on public.ai_interviews
  for select to authenticated
  using (candidate_id = auth.uid() or public.is_staff());
create policy ai_write on public.ai_interviews
  for all to authenticated
  using (candidate_id = auth.uid() or public.is_admin())
  with check (candidate_id = auth.uid() or public.is_admin());

-- stage_attempts: candidate owns; staff may read.
create policy stages_select on public.stage_attempts
  for select to authenticated
  using (candidate_id = auth.uid() or public.is_staff());
create policy stages_write on public.stage_attempts
  for all to authenticated
  using (candidate_id = auth.uid() or public.is_admin())
  with check (candidate_id = auth.uid() or public.is_admin());

-- interviewer_notes: interviewer owns their notes; candidate reads notes about
-- them; admins all.
create policy notes_select on public.interviewer_notes
  for select to authenticated
  using (interviewer_id = auth.uid() or candidate_id = auth.uid() or public.is_admin());
create policy notes_write on public.interviewer_notes
  for all to authenticated
  using (interviewer_id = auth.uid() or public.is_admin())
  with check (interviewer_id = auth.uid() or public.is_admin());

-- jobs: readable by all authenticated; admins manage.
create policy jobs_select on public.jobs
  for select to authenticated using (true);
create policy jobs_write on public.jobs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- applications: candidate owns; staff read.
create policy apps_select on public.applications
  for select to authenticated
  using (candidate_id = auth.uid() or public.is_staff());
create policy apps_write on public.applications
  for all to authenticated
  using (candidate_id = auth.uid() or public.is_admin())
  with check (candidate_id = auth.uid() or public.is_admin());

-- token ledger: candidate owns; admins all.
create policy tokens_select on public.token_transactions
  for select to authenticated
  using (candidate_id = auth.uid() or public.is_admin());
create policy tokens_write on public.token_transactions
  for all to authenticated
  using (candidate_id = auth.uid() or public.is_admin())
  with check (candidate_id = auth.uid() or public.is_admin());

-- payments: interviewer sees own; admins all.
create policy payments_select on public.payments
  for select to authenticated
  using (interviewer_id = auth.uid() or public.is_admin());
create policy payments_write on public.payments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- notifications & prefs: user owns.
create policy notif_all on public.notifications
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy prefs_all on public.notification_prefs
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
