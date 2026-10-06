-- =====================================================================
-- 0013 — Open signup to staff roles with an approval gate.
-- Candidates are auto-approved. Professional/HR interviewers and recruiters
-- (employers) sign up into a PENDING state, upload a document (CV or org docs),
-- and an admin reviews + approves. Idempotent.
-- =====================================================================

-- ---- Profile: approval state + organisation name ---------------------
alter table public.profiles add column if not exists approval_status text not null default 'approved'; -- 'approved' | 'pending' | 'rejected'
alter table public.profiles add column if not exists org_name text;

-- ---- Staff onboarding applications -----------------------------------
create table if not exists public.staff_applications (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  role        text not null,                 -- 'interviewer' | 'recruiter'
  kind        text,                          -- 'Professional' | 'HR' (interviewers)
  org_name    text,                          -- employers
  doc_path    text,
  doc_name    text,
  status      text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  note        text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.staff_applications enable row level security;
drop policy if exists staffapp_select on public.staff_applications;
create policy staffapp_select on public.staff_applications
  for select to authenticated using (user_id = auth.uid() or public.is_staff());
drop policy if exists staffapp_owner_upd on public.staff_applications;
create policy staffapp_owner_upd on public.staff_applications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- (Admin approval updates run server-side with the service role.)

-- ---- Storage bucket for staff documents (private) --------------------
insert into storage.buckets (id, name, public) values ('staff-docs', 'staff-docs', false)
  on conflict (id) do nothing;
drop policy if exists "staffdoc_owner_rw"   on storage.objects;
drop policy if exists "staffdoc_staff_read" on storage.objects;
create policy "staffdoc_owner_rw" on storage.objects
  for all to authenticated
  using (bucket_id = 'staff-docs' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'staff-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "staffdoc_staff_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'staff-docs' and public.is_staff());

-- ---- Signup trigger: allow staff roles, clamp admin, set approval ----
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r_in   text := coalesce(new.raw_user_meta_data->>'role', 'candidate');
  r      user_role;
  v_stat text;
begin
  -- SECURITY: public signup may create candidate / interviewer / recruiter only.
  -- Anything else (notably 'admin') falls back to candidate.
  if r_in in ('candidate','interviewer','recruiter') then
    r := r_in::user_role;
  else
    r := 'candidate';
  end if;
  v_stat := case when r = 'candidate' then 'approved' else 'pending' end;

  insert into public.profiles (id, email, full_name, role, phone, country, approval_status, org_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    r,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'country','Nigeria'),
    v_stat,
    new.raw_user_meta_data->>'org_name'
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
    insert into public.staff_applications (user_id, role, kind)
      values (new.id, 'interviewer', coalesce(new.raw_user_meta_data->>'interviewer_kind','Professional'));
  elsif r = 'recruiter' then
    insert into public.staff_applications (user_id, role, org_name)
      values (new.id, 'recruiter', new.raw_user_meta_data->>'org_name');
  end if;

  insert into public.notification_prefs (user_id) values (new.id);
  return new;
end $$;
