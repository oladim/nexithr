-- =====================================================================
-- 0023 — Approved target roles at signup (+ waitlist) and certificates.
--
-- 1) candidates.interested_role: what a candidate told us they want when
--    their field isn't open yet. A BEFORE INSERT trigger fills it from the
--    signup metadata and guarantees target_role is only ever an OPEN
--    (admin-approved) role — anything else is moved to interested_role.
-- 2) certificates: one verifiable certificate per boarded candidate.
--    Rows are written by the server (service role) only.
-- Idempotent — safe to run more than once.
-- =====================================================================

alter table public.candidates add column if not exists interested_role text;

create or replace function public.candidates_clamp_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  open_role boolean;
begin
  select raw_user_meta_data into meta from auth.users where id = new.id;
  if new.interested_role is null then
    new.interested_role := nullif(trim(coalesce(meta->>'interested_role', '')), '');
  end if;

  if new.target_role is not null and trim(new.target_role) <> '' then
    select exists (
      select 1 from public.role_requirements r
      where r.role_key = new.target_role and r.enabled is not false
    ) into open_role;
    if not open_role then
      new.interested_role := coalesce(new.interested_role, new.target_role);
      new.target_role := null;
    end if;
  else
    new.target_role := null;
  end if;
  return new;
end $$;

drop trigger if exists candidates_clamp_role on public.candidates;
create trigger candidates_clamp_role
  before insert on public.candidates
  for each row execute function public.candidates_clamp_role();

-- A candidate may later pick a target role from their profile, but only an
-- open one (admins / the service role are not restricted).
-- NOT security definer: current_user must be the caller's role so the check
-- applies to browser sessions only (role_requirements is readable by them).
create or replace function public.candidates_role_must_be_open()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.target_role is distinct from old.target_role
     and new.target_role is not null and trim(new.target_role) <> ''
     and current_user in ('authenticated', 'anon') and not public.is_admin() then
    if not exists (
      select 1 from public.role_requirements r
      where r.role_key = new.target_role and r.enabled is not false
    ) then
      raise exception 'That role is not open for applications yet.';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists candidates_role_must_be_open on public.candidates;
create trigger candidates_role_must_be_open
  before update on public.candidates
  for each row execute function public.candidates_role_must_be_open();

-- ---- Certificates ---------------------------------------------------
create table if not exists public.certificates (
  id           text primary key,                 -- e.g. NXA-2026-7F3A9C21
  candidate_id uuid not null unique references public.candidates(id) on delete cascade,
  full_name    text not null,
  role_key     text,
  role_label   text not null,
  issued_at    timestamptz not null default now(),
  revoked      boolean not null default false,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now()
);

alter table public.certificates enable row level security;

-- The holder can read their own; admins can read all. No client writes:
-- issuing / revoking goes through the service role only. Public
-- verification is served by the API (service role), not by a public policy.
drop policy if exists certificates_select on public.certificates;
create policy certificates_select on public.certificates
  for select to authenticated
  using (candidate_id = auth.uid() or public.is_admin());

drop policy if exists certificates_admin_write on public.certificates;
create policy certificates_admin_write on public.certificates
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- Interviewer assignment is admin-only ---------------------------
-- A candidate owns their booking rows, but must not be able to choose (or
-- change) who interviews them from the browser. Assignment happens through
-- the admin API (service role).
create or replace function public.interviews_guard_assignment()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.interviewer_id := null;
    else
      new.interviewer_id := old.interviewer_id;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists interviews_guard_assignment on public.interviews;
create trigger interviews_guard_assignment
  before insert or update on public.interviews
  for each row execute function public.interviews_guard_assignment();

-- ---- CV approval is admin-only --------------------------------------
-- The AI interview requires an APPROVED CV, so a candidate must not be able
-- to approve their own CV from the browser. New uploads always start as
-- 'Pending review'; only the admin review API (service role) / an admin can
-- change the status or the reviewer note.
create or replace function public.cvs_guard_review()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'Pending review';
      new.review_note := null;
      new.reviewed_by := null;
      new.reviewed_at := null;
    else
      new.status := old.status;
      new.review_note := old.review_note;
      new.reviewed_by := old.reviewed_by;
      new.reviewed_at := old.reviewed_at;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists cvs_guard_review on public.cvs;
create trigger cvs_guard_review
  before insert or update on public.cvs
  for each row execute function public.cvs_guard_review();
