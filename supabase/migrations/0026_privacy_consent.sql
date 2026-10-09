-- =====================================================================
-- 0026 — Privacy policy consent record.
-- Which version of the Privacy Policy each user accepted, and when.
-- Written by the server (/api/me/consent). Idempotent.
-- =====================================================================
alter table public.profiles add column if not exists privacy_accepted_version text;
alter table public.profiles add column if not exists privacy_accepted_at      timestamptz;
