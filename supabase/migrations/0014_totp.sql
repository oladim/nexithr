-- =====================================================================
-- 0014 — App-level TOTP two-factor (Google Authenticator), independent of
-- Supabase MFA. The 6-digit-code secret is kept in a service-role-only table
-- so it is NEVER exposed to the browser; profiles only carries the (safe)
-- enabled flag. Idempotent.
-- =====================================================================

-- Safe-to-expose flag (profiles are world-readable to authenticated users).
alter table public.profiles add column if not exists totp_enabled boolean not null default false;

-- The secret lives here. RLS is ON with NO policies for authenticated → the
-- anon/authenticated clients cannot read or write it; only the service role
-- (used by our API routes) can, because it bypasses RLS.
create table if not exists public.user_totp (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  secret     text not null,
  created_at timestamptz not null default now()
);
alter table public.user_totp enable row level security;
-- (Intentionally no policies — authenticated clients have no access.)
