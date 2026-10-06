-- =====================================================================
-- 0015 — Candidate profile "About" / bio text. Idempotent.
-- =====================================================================
alter table public.profiles add column if not exists bio text;
