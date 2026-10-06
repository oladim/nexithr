-- =====================================================================
-- 0012 — Job board. Jobs gain a description, target role, poster and an
-- approval status. Employers (recruiters) may post jobs that await admin
-- approval; admins post approved jobs directly. Idempotent.
-- =====================================================================

alter table public.jobs add column if not exists description text;
alter table public.jobs add column if not exists role_key    text;      -- optional link to a role
alter table public.jobs add column if not exists salary      text;
alter table public.jobs add column if not exists status      text not null default 'approved'; -- 'pending' | 'approved' | 'closed'
alter table public.jobs add column if not exists posted_by   uuid references public.profiles(id) on delete set null;

-- Candidates/all see APPROVED jobs; staff see everything; a recruiter sees
-- their own (including pending/closed).
drop policy if exists jobs_select on public.jobs;
create policy jobs_select on public.jobs
  for select to authenticated
  using (status = 'approved' or public.is_staff() or posted_by = auth.uid());

-- Admins manage any job; recruiters may insert/update their OWN postings.
drop policy if exists jobs_write on public.jobs;        -- replaced by granular policies
drop policy if exists jobs_insert on public.jobs;
create policy jobs_insert on public.jobs
  for insert to authenticated
  with check (public.is_admin() or (public.role_of(auth.uid()) = 'recruiter' and posted_by = auth.uid()));
drop policy if exists jobs_update on public.jobs;
create policy jobs_update on public.jobs
  for update to authenticated
  using (public.is_admin() or posted_by = auth.uid())
  with check (public.is_admin() or posted_by = auth.uid());
drop policy if exists jobs_delete on public.jobs;
create policy jobs_delete on public.jobs
  for delete to authenticated
  using (public.is_admin() or posted_by = auth.uid());

create index if not exists jobs_status_idx on public.jobs(status);
create index if not exists applications_job_idx on public.applications(job_id);
