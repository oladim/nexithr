-- =====================================================================
-- 0009 — Admin-configurable settings, role enablement + pricing,
-- candidate subscriptions and specific-training purchases (Paystack).
--
-- Safe to re-run (idempotent).
-- =====================================================================

-- ---- Platform settings (single row, id = 1) --------------------------
create table if not exists public.app_settings (
  id                         int primary key default 1,
  pass_mark_ai               int     not null default 85,
  pass_mark_professional     int     not null default 70,
  pass_mark_hr               int     not null default 70,
  currency                   text    not null default 'NGN',
  subscription_annual_amount numeric not null default 29999,   -- ₦ / year
  training_default_amount    numeric not null default 450000,  -- ₦ per role
  updated_by                 uuid references public.profiles(id) on delete set null,
  updated_at                 timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);
insert into public.app_settings (id) values (1) on conflict (id) do nothing;

alter table public.app_settings enable row level security;
-- Any signed-in user may read (pass marks + prices drive the candidate UI);
-- only admins may change them.
drop policy if exists appsettings_select on public.app_settings;
create policy appsettings_select on public.app_settings
  for select to authenticated using (true);
drop policy if exists appsettings_write on public.app_settings;
create policy appsettings_write on public.app_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- Role enablement + per-role training price -----------------------
alter table public.role_requirements add column if not exists enabled boolean not null default true;
alter table public.role_requirements add column if not exists training_amount numeric;  -- null → use training_default_amount

-- ---- Candidate subscription + AI retake tracking ---------------------
alter table public.candidates add column if not exists subscription_until  timestamptz;
alter table public.candidates add column if not exists last_ai_attempt_at  timestamptz;

-- ---- Candidate payments (subscription + specific training) -----------
create table if not exists public.candidate_payments (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  purpose      text not null,                       -- 'subscription' | 'training'
  role_key     text,                                -- set for 'training'
  amount       numeric not null default 0,
  currency     text not null default 'NGN',
  reference    text unique,                         -- Paystack reference
  status       text not null default 'pending',     -- 'pending' | 'success' | 'failed'
  provider     text not null default 'paystack',
  created_at   timestamptz not null default now(),
  paid_at      timestamptz
);
create index if not exists candidate_payments_cand_idx on public.candidate_payments(candidate_id);

alter table public.candidate_payments enable row level security;
drop policy if exists candpay_select on public.candidate_payments;
create policy candpay_select on public.candidate_payments
  for select to authenticated using (candidate_id = auth.uid() or public.is_admin());
drop policy if exists candpay_insert on public.candidate_payments;
create policy candpay_insert on public.candidate_payments
  for insert to authenticated with check (candidate_id = auth.uid());
-- Verification / status updates are done server-side with the service role.

-- ---- Specific-training access (per candidate, per role) --------------
create table if not exists public.training_access (
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  role_key     text not null,
  granted_at   timestamptz not null default now(),
  primary key (candidate_id, role_key)
);
alter table public.training_access enable row level security;
drop policy if exists trainacc_select on public.training_access;
create policy trainacc_select on public.training_access
  for select to authenticated using (candidate_id = auth.uid() or public.is_staff());
-- Grants are written server-side with the service role after payment verifies.
