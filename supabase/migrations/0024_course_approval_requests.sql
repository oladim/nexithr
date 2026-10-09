-- =====================================================================
-- 0024 — Course & module approval, and candidate course requests.
--
-- 1) specific_courses / course_modules get an approval flag. Candidates only
--    ever see APPROVED courses, and only approved modules of approved
--    courses. Admins still see everything (to build and review).
--    Approval is set by the server (service role) via /api/admin/course-approval
--    — the browser can't flip it, even for an admin.
-- 2) course_requests: a candidate asks NexIT for a course they want.
--    Created/updated through the API (service role); candidates read their own.
--
-- Existing courses/modules (created before approval existed) are marked
-- approved ONCE when the column is first added, so live content doesn't
-- disappear. Everything created afterwards starts unapproved.
-- Idempotent.
-- =====================================================================

do $$ begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'specific_courses' and column_name = 'approved') then
    alter table public.specific_courses add column approved boolean not null default false;
    update public.specific_courses set approved = true;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'course_modules' and column_name = 'approved') then
    alter table public.course_modules add column approved boolean not null default false;
    update public.course_modules set approved = true;
  end if;
end $$;

alter table public.specific_courses add column if not exists approved_by uuid references public.profiles(id) on delete set null;
alter table public.specific_courses add column if not exists approved_at timestamptz;
alter table public.course_modules  add column if not exists approved_by uuid references public.profiles(id) on delete set null;
alter table public.course_modules  add column if not exists approved_at timestamptz;

-- ---- Visibility --------------------------------------------------------
drop policy if exists speccourse_select on public.specific_courses;
create policy speccourse_select on public.specific_courses
  for select to authenticated
  using (approved or public.is_admin());

drop policy if exists coursemod_select on public.course_modules;
create policy coursemod_select on public.course_modules
  for select to authenticated
  using (
    public.is_admin()
    or (approved and exists (select 1 from public.specific_courses c where c.id = course_id and c.approved))
  );

-- ---- Approval can only change server-side -------------------------------
create or replace function public.guard_course_approval()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.approved := false; new.approved_by := null; new.approved_at := null;
    else
      new.approved := old.approved; new.approved_by := old.approved_by; new.approved_at := old.approved_at;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists guard_course_approval on public.specific_courses;
create trigger guard_course_approval before insert or update on public.specific_courses
  for each row execute function public.guard_course_approval();
drop trigger if exists guard_module_approval on public.course_modules;
create trigger guard_module_approval before insert or update on public.course_modules
  for each row execute function public.guard_course_approval();

-- ---- Candidate course requests ------------------------------------------
create table if not exists public.course_requests (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  role_key     text,
  topic        text not null,
  level        text not null default 'any',       -- 'foundational' | 'intensive' | 'any'
  message      text,
  status       text not null default 'new',       -- 'new' | 'reviewing' | 'planned' | 'available' | 'declined'
  admin_note   text,
  handled_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists course_requests_candidate_idx on public.course_requests(candidate_id);
alter table public.course_requests enable row level security;

drop policy if exists coursereq_select on public.course_requests;
create policy coursereq_select on public.course_requests
  for select to authenticated
  using (candidate_id = auth.uid() or public.is_admin());
-- No insert/update/delete policies: writes go through the API (service role).
