-- =====================================================================
-- 0028 — Platform switches + interviewer payouts.
--   * app_settings: sign-ups, email verification, AI interview on/off,
--     retake cooldown, interview reminders, training payments, payouts.
--   * interviews.start_at / reminder_sent_at for reminder emails.
--   * interviewer_earnings  — one row per paid piece of work (a verdict).
--   * payout_accounts       — interviewer's bank account (+ Paystack
--                             transfer recipient code).
--   * payout_requests       — withdrawals; paid via Paystack Transfers.
--   * request_payout()      — atomic balance check + insert (server only).
-- All money tables are written by the server (service role) only;
-- interviewers can read their own rows. Idempotent.
-- =====================================================================

-- ---- Switches -------------------------------------------------------
alter table public.app_settings add column if not exists signups_enabled             boolean not null default true;
alter table public.app_settings add column if not exists signups_closed_message      text;
alter table public.app_settings add column if not exists require_email_verification  boolean not null default true;
alter table public.app_settings add column if not exists ai_interview_enabled        boolean not null default true;
alter table public.app_settings add column if not exists ai_interview_paused_message text;
alter table public.app_settings add column if not exists ai_retake_cooldown_enabled  boolean not null default true;
alter table public.app_settings add column if not exists ai_retake_cooldown_days     int     not null default 30;
alter table public.app_settings add column if not exists interview_reminders_enabled boolean not null default true;
alter table public.app_settings add column if not exists interview_reminder_hours    int     not null default 24;
alter table public.app_settings add column if not exists training_payments_enabled   boolean not null default true;
alter table public.app_settings add column if not exists interviewer_payouts_enabled boolean not null default true;
alter table public.app_settings add column if not exists payout_manual_approval      boolean not null default true;
alter table public.app_settings add column if not exists interviewer_fee_professional numeric not null default 5000;
alter table public.app_settings add column if not exists interviewer_fee_hr          numeric not null default 5000;
alter table public.app_settings add column if not exists payout_min_amount           numeric not null default 5000;

-- ---- Interview reminders --------------------------------------------
alter table public.interviews add column if not exists start_at         timestamptz;
alter table public.interviews add column if not exists reminder_sent_at timestamptz;
create index if not exists interviews_start_at_idx on public.interviews(start_at) where reminder_sent_at is null;

-- ---- Earnings -------------------------------------------------------
create table if not exists public.interviewer_earnings (
  id             uuid primary key default gen_random_uuid(),
  interviewer_id uuid not null references public.profiles(id) on delete cascade,
  source_key     text not null,                 -- e.g. verdict:<cand>:<stage>:<attempt>
  candidate_id   uuid references public.profiles(id) on delete set null,
  stage          text,
  description    text,
  amount         numeric not null check (amount >= 0),
  currency       text not null default 'NGN',
  created_at     timestamptz not null default now(),
  unique (interviewer_id, source_key)
);
create index if not exists earnings_interviewer_idx on public.interviewer_earnings(interviewer_id, created_at desc);

-- ---- Bank account ---------------------------------------------------
create table if not exists public.payout_accounts (
  interviewer_id  uuid primary key references public.profiles(id) on delete cascade,
  bank_code       text not null,
  bank_name       text not null,
  account_number  text not null check (account_number ~ '^[0-9]{10}$'),
  account_name    text not null,
  recipient_code  text,                          -- Paystack transfer recipient
  updated_at      timestamptz not null default now()
);

-- ---- Withdrawals ----------------------------------------------------
do $$ begin
  create type payout_status as enum ('pending','approved','processing','paid','failed','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.payout_requests (
  id              uuid primary key default gen_random_uuid(),
  interviewer_id  uuid not null references public.profiles(id) on delete cascade,
  amount          numeric not null check (amount > 0),
  currency        text not null default 'NGN',
  status          payout_status not null default 'pending',
  bank_name       text,
  account_number  text,
  account_name    text,
  reference       text unique,                   -- our transfer reference
  transfer_code   text,                          -- Paystack TRF_…
  note            text,                          -- rejection / failure reason
  decided_by      uuid references public.profiles(id) on delete set null,
  decided_at      timestamptz,
  paid_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists payout_requests_interviewer_idx on public.payout_requests(interviewer_id, created_at desc);
create index if not exists payout_requests_status_idx on public.payout_requests(status);

-- ---- RLS: read own (admins read all); no client writes ---------------
alter table public.interviewer_earnings enable row level security;
alter table public.payout_accounts      enable row level security;
alter table public.payout_requests      enable row level security;

drop policy if exists earnings_select on public.interviewer_earnings;
create policy earnings_select on public.interviewer_earnings
  for select to authenticated using (interviewer_id = auth.uid() or public.is_admin());
drop policy if exists payout_accounts_select on public.payout_accounts;
create policy payout_accounts_select on public.payout_accounts
  for select to authenticated using (interviewer_id = auth.uid() or public.is_admin());
drop policy if exists payout_requests_select on public.payout_requests;
create policy payout_requests_select on public.payout_requests
  for select to authenticated using (interviewer_id = auth.uid() or public.is_admin());

-- ---- Balance + atomic request ---------------------------------------
-- Available = all earnings − every withdrawal that isn't rejected/failed.
create or replace function public.payout_balance(uid uuid)
returns numeric language sql stable security definer set search_path = public as $$
  select coalesce((select sum(amount) from public.interviewer_earnings where interviewer_id = uid), 0)
       - coalesce((select sum(amount) from public.payout_requests
                    where interviewer_id = uid and status not in ('rejected','failed')), 0);
$$;

-- Locks the interviewer's account row so two simultaneous requests can't
-- both pass the balance check. Returns the new request id.
create or replace function public.request_payout(uid uuid, amt numeric, min_amt numeric, initial payout_status)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  acct public.payout_accounts%rowtype;
  bal numeric;
  rid uuid;
begin
  select * into acct from public.payout_accounts where interviewer_id = uid for update;
  if not found then raise exception 'NO_ACCOUNT'; end if;
  if amt is null or amt <= 0 then raise exception 'BAD_AMOUNT'; end if;
  if amt < min_amt then raise exception 'BELOW_MIN'; end if;
  if exists (select 1 from public.payout_requests where interviewer_id = uid and status in ('pending','approved','processing')) then
    raise exception 'OPEN_REQUEST';
  end if;
  bal := public.payout_balance(uid);
  if amt > bal then raise exception 'INSUFFICIENT'; end if;
  insert into public.payout_requests (interviewer_id, amount, status, bank_name, account_number, account_name, reference)
  values (uid, amt, initial, acct.bank_name, acct.account_number, acct.account_name,
          'payout_' || replace(gen_random_uuid()::text, '-', ''))
  returning id into rid;
  return rid;
end $$;

-- Server (service role) only.
revoke all on function public.request_payout(uuid, numeric, numeric, payout_status) from public, anon, authenticated;
revoke all on function public.payout_balance(uuid) from public, anon, authenticated;

-- ---- Sign-ups switch -------------------------------------------------
-- When an admin closes sign-ups, block new auth accounts at the database
-- (covers email and Google/Apple sign-up). Accounts an admin creates with
-- the service role and app_metadata.admin_created = true still go through.
create or replace function public.guard_signups()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce((select signups_enabled from public.app_settings where id = 1), true) = false
     and coalesce(new.raw_app_meta_data->>'admin_created', '') <> 'true' then
    raise exception 'Sign-ups are currently closed on NexIT-Africa.' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists aa_guard_signups on auth.users;
create trigger aa_guard_signups before insert on auth.users
  for each row execute function public.guard_signups();
