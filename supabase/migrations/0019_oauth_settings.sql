-- =====================================================================
-- 0019 — Admin toggles for the social sign-in buttons on the login/signup
-- pages ("Continue with Google" / "Continue with Apple"). Off by default so
-- the buttons only appear once an admin has enabled the matching provider.
-- Idempotent.
-- =====================================================================

alter table public.app_settings add column if not exists oauth_google_enabled boolean not null default false;
alter table public.app_settings add column if not exists oauth_apple_enabled  boolean not null default false;
