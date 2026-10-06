-- =====================================================================
-- 0011 — Google Meet links on scheduled human interviews.
-- A "combined" booking is stored as two rows (Professional + HR) that share
-- the same meet_link + calendar_event_id. Idempotent.
-- =====================================================================

alter table public.interviews add column if not exists meet_link         text;
alter table public.interviews add column if not exists calendar_event_id text;
-- Links the two rows of a combined (Professional + HR) booking together.
alter table public.interviews add column if not exists booking_group     uuid;
