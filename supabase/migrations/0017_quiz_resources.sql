-- =====================================================================
-- 0017 — Auto-graded MCQ quizzes + admin-managed suggested resources.
-- Idempotent.
-- =====================================================================

-- Quiz questions for a module (type 'quiz'): [{ q, options:[...], answer:int }].
-- Correct answers live here and are never sent to the client.
alter table public.course_modules add column if not exists questions jsonb;

-- ---- Admin-curated suggested resources ------------------------------
create table if not exists public.suggested_resources (
  id          uuid primary key default gen_random_uuid(),
  role_key    text,                     -- null = shown to everyone
  category    text not null default 'general', -- 'technical' | 'administrative' | 'general'
  title       text not null,
  description text,
  url         text,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists suggested_resources_role_idx on public.suggested_resources(role_key);
alter table public.suggested_resources enable row level security;
drop policy if exists sugres_select on public.suggested_resources;
create policy sugres_select on public.suggested_resources
  for select to authenticated using (true);
drop policy if exists sugres_write on public.suggested_resources;
create policy sugres_write on public.suggested_resources
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
