-- =====================================================================
-- 0016 — Training LMS: course modules (video/text/pdf/assignment/test),
-- enrollments with an overall score + released flag, and graded submissions.
-- Idempotent.
-- =====================================================================

-- ---- Modules (lessons / assignments / tests within a course) ---------
create table if not exists public.course_modules (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.specific_courses(id) on delete cascade,
  title      text not null,
  type       text not null default 'text',  -- 'video' | 'text' | 'pdf' | 'assignment' | 'test'
  content    text,                           -- text body / instructions
  video_url  text,                           -- for 'video'
  file_path  text,                           -- material PDF in the 'training' bucket
  max_score  int not null default 0,         -- for 'assignment' / 'test'
  sort       int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists course_modules_course_idx on public.course_modules(course_id);
alter table public.course_modules enable row level security;
drop policy if exists coursemod_select on public.course_modules;
create policy coursemod_select on public.course_modules
  for select to authenticated using (true);
drop policy if exists coursemod_write on public.course_modules;
create policy coursemod_write on public.course_modules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- Enrollments (one per candidate per course) ----------------------
create table if not exists public.enrollments (
  id              uuid primary key default gen_random_uuid(),
  candidate_id    uuid not null references public.candidates(id) on delete cascade,
  course_id       uuid not null references public.specific_courses(id) on delete cascade,
  overall_score   numeric,
  result_released boolean not null default false,
  released_at     timestamptz,
  created_at      timestamptz not null default now(),
  unique (candidate_id, course_id)
);
create index if not exists enrollments_course_idx on public.enrollments(course_id);
alter table public.enrollments enable row level security;
drop policy if exists enroll_select on public.enrollments;
create policy enroll_select on public.enrollments
  for select to authenticated using (candidate_id = auth.uid() or public.is_staff());
drop policy if exists enroll_insert on public.enrollments;
create policy enroll_insert on public.enrollments
  for insert to authenticated with check (candidate_id = auth.uid());
-- (Scores + release are written server-side with the service role.)

-- ---- Submissions (assignment / test answers, graded) -----------------
create table if not exists public.submissions (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  course_id    uuid not null references public.specific_courses(id) on delete cascade,
  module_id    uuid not null references public.course_modules(id) on delete cascade,
  text         text,
  file_path    text,               -- candidate upload in the 'training' bucket
  score        numeric,
  feedback     text,
  status       text not null default 'submitted',  -- 'submitted' | 'graded'
  graded_by    uuid references public.profiles(id) on delete set null,
  graded_at    timestamptz,
  submitted_at timestamptz not null default now(),
  unique (candidate_id, module_id)
);
create index if not exists submissions_course_idx on public.submissions(course_id);
create index if not exists submissions_module_idx on public.submissions(module_id);
alter table public.submissions enable row level security;
drop policy if exists sub_select on public.submissions;
create policy sub_select on public.submissions
  for select to authenticated using (candidate_id = auth.uid() or public.is_staff());
drop policy if exists sub_insert on public.submissions;
create policy sub_insert on public.submissions
  for insert to authenticated with check (candidate_id = auth.uid());
drop policy if exists sub_update_own on public.submissions;
create policy sub_update_own on public.submissions
  for update to authenticated using (candidate_id = auth.uid() and status <> 'graded') with check (candidate_id = auth.uid());
-- (Grading updates run server-side with the service role.)

-- ---- Private storage bucket for training material + submissions ------
insert into storage.buckets (id, name, public) values ('training', 'training', false)
  on conflict (id) do nothing;
drop policy if exists "training_owner_rw"   on storage.objects;
drop policy if exists "training_staff_read" on storage.objects;
create policy "training_owner_rw" on storage.objects
  for all to authenticated
  using (bucket_id = 'training' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'training' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "training_staff_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'training' and public.is_staff());
