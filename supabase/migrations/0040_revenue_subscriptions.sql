-- =====================================================================
-- 0040 — Revenue & subscription management.
--   * Who paid, for what, how (Paystack / manual / complimentary)
--   * Admin subscribe (with or without payment), extend, unsubscribe
--   * Subscription history (audit) + automatic expiry reminders
--
-- Safe to re-run (idempotent).
-- =====================================================================

-- ---- Payments: richer record --------------------------------------------
alter table public.candidate_payments add column if not exists tier         text;  -- training tier
alter table public.candidate_payments add column if not exists note         text;  -- admin note (manual)
alter table public.candidate_payments add column if not exists recorded_by  uuid references public.profiles(id) on delete set null;
alter table public.candidate_payments add column if not exists period_start timestamptz; -- subscription window
alter table public.candidate_payments add column if not exists period_end   timestamptz;
-- provider: 'paystack' | 'manual' (bank transfer / cash, recorded by admin) | 'complimentary' (no payment)
create index if not exists candidate_payments_status_idx on public.candidate_payments(status, paid_at);

-- ---- Candidates: subscription metadata ------------------------------------
alter table public.candidates add column if not exists subscription_started_at   timestamptz;
alter table public.candidates add column if not exists subscription_source       text;  -- paystack | manual | complimentary
alter table public.candidates add column if not exists subscription_cancelled_at timestamptz;
alter table public.candidates add column if not exists subscription_reminder     text;  -- last expiry reminder sent, e.g. '7d:2027-10-15'
create index if not exists candidates_subscription_idx on public.candidates(subscription_until);

-- Back-fill the source for subscriptions that already exist.
update public.candidates c
   set subscription_source = 'paystack',
       subscription_started_at = coalesce(c.subscription_started_at,
         (select max(p.paid_at) from public.candidate_payments p
           where p.candidate_id = c.id and p.purpose = 'subscription' and p.status = 'success'))
 where c.subscription_until is not null and c.subscription_source is null;

-- ---- Subscription history ------------------------------------------------
create table if not exists public.subscription_events (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  action       text not null,   -- subscribed | extended | cancelled | expired | reminded
  source       text,            -- paystack | manual | complimentary | system
  until_before timestamptz,
  until_after  timestamptz,
  amount       numeric,
  payment_id   uuid references public.candidate_payments(id) on delete set null,
  actor_id     uuid references public.profiles(id) on delete set null,
  note         text,
  created_at   timestamptz not null default now()
);
create index if not exists subscription_events_cand_idx on public.subscription_events(candidate_id, created_at desc);

alter table public.subscription_events enable row level security;
drop policy if exists subev_select on public.subscription_events;
create policy subev_select on public.subscription_events
  for select to authenticated using (candidate_id = auth.uid() or public.is_admin());
-- Written server-side only (service role).

-- ---- Column guard: candidates can't grant themselves a subscription -------
create or replace function public.lock_privileged_candidate_cols()
returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    new.subscription_until        := old.subscription_until;        -- payment-verify / admin API only
    new.subscription_started_at   := old.subscription_started_at;
    new.subscription_source       := old.subscription_source;
    new.subscription_cancelled_at := old.subscription_cancelled_at;
    new.subscription_reminder     := old.subscription_reminder;
    new.on_board                  := old.on_board;
    new.tokens                    := old.tokens;
    new.last_ai_attempt_at        := old.last_ai_attempt_at;
  end if;
  return new;
end $$;

-- Candidates may only insert their own *pending Paystack* payment rows
-- (the init API uses the service role anyway); never a manual/complimentary one.
drop policy if exists candpay_insert on public.candidate_payments;
create policy candpay_insert on public.candidate_payments
  for insert to authenticated
  with check (candidate_id = auth.uid() and status = 'pending' and provider = 'paystack' and recorded_by is null);

-- ---- Admin permission key (for admin groups) -------------------------------
-- "revenue" is a new permission in lib/permissions.js; super-admins have it
-- automatically. Grant it to a group in Admin → Users & Groups.
