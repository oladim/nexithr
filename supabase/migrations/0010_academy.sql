-- =====================================================================
-- 0010 — Academy model: diagnostic bands + admin approval, AI-generated
-- suggested training, NexIT-curated specific courses, testimonials/outcomes,
-- and the employer (recruiter) hire-request flow. Idempotent.
-- =====================================================================

-- ---- AI interview: store the plan, band and (optional) admin confirmation ---
alter table public.ai_interviews add column if not exists suggested_training jsonb;
alter table public.ai_interviews add column if not exists band        text;        -- 'ready' | 'close' | 'foundational'
alter table public.ai_interviews add column if not exists status      text not null default 'released'; -- 'released' | 'pending_review'
alter table public.ai_interviews add column if not exists confirmed_by uuid references public.profiles(id) on delete set null;
alter table public.ai_interviews add column if not exists confirmed_at timestamptz;

-- ---- Settings: bands, approval, training tiers, placement fee, free retakes --
alter table public.app_settings add column if not exists ai_foundational_mark       int     not null default 60;
alter table public.app_settings add column if not exists ai_result_requires_approval boolean not null default false;
alter table public.app_settings add column if not exists training_foundational_amount numeric not null default 150000; -- ₦ default
alter table public.app_settings add column if not exists placement_fee_amount        numeric not null default 0;
alter table public.app_settings add column if not exists free_ai_retakes             int     not null default 1;

-- ---- Role: optional per-role foundational-tier price -----------------
alter table public.role_requirements add column if not exists foundational_amount numeric; -- null → training_foundational_amount

-- ---- NexIT-curated specific courses (per role + tier) ----------------
create table if not exists public.specific_courses (
  id         uuid primary key default gen_random_uuid(),
  role_key   text not null,
  title      text not null,
  summary    text,
  level      text not null default 'intensive',   -- 'foundational' | 'intensive'
  duration   text,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists specific_courses_role_idx on public.specific_courses(role_key);
alter table public.specific_courses enable row level security;
drop policy if exists speccourse_select on public.specific_courses;
create policy speccourse_select on public.specific_courses
  for select to authenticated using (true);
drop policy if exists speccourse_write on public.specific_courses;
create policy speccourse_write on public.specific_courses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- Testimonials / outcomes (admin-curated) -------------------------
create table if not exists public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text,
  company    text,
  quote      text not null,
  outcome    text,
  published  boolean not null default true,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
drop policy if exists testi_select on public.testimonials;
create policy testi_select on public.testimonials
  for select to authenticated using (true);
drop policy if exists testi_write on public.testimonials;
create policy testi_write on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- Employer hire requests (recruiter → candidate) ------------------
create table if not exists public.hire_requests (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  recruiter_id uuid references public.profiles(id) on delete set null,
  position     text,
  message      text,
  status       text not null default 'requested', -- requested | accepted | declined | placed
  created_at   timestamptz not null default now()
);
create index if not exists hire_requests_cand_idx on public.hire_requests(candidate_id);
create index if not exists hire_requests_rec_idx  on public.hire_requests(recruiter_id);
alter table public.hire_requests enable row level security;
-- Recruiter sees their own requests; the candidate sees requests about them;
-- admins/staff see all. Recruiters create their own.
drop policy if exists hire_select on public.hire_requests;
create policy hire_select on public.hire_requests
  for select to authenticated
  using (recruiter_id = auth.uid() or candidate_id = auth.uid() or public.is_staff());
drop policy if exists hire_insert on public.hire_requests;
create policy hire_insert on public.hire_requests
  for insert to authenticated with check (recruiter_id = auth.uid());
drop policy if exists hire_update on public.hire_requests;
create policy hire_update on public.hire_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
