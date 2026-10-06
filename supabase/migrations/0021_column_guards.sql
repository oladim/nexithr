-- =====================================================================
-- 0021 — Column-level guards (privilege-escalation hardening).
--
-- RLS is row-level: the profiles_update / candidates_update policies let a
-- signed-in user edit THEIR OWN row, which also means every column of it. That
-- allowed a normal user to set their own `role = 'admin'`, flip
-- `approval_status`, assign a `group_id`, or extend `subscription_until`
-- straight from the browser (anon key + their JWT). These BEFORE UPDATE
-- triggers freeze those privileged columns for ordinary end users, while still
-- letting the service role (our admin API routes) and SECURITY DEFINER
-- functions (e.g. set_user_role) change them.
--
-- Detection: PostgREST runs end users under the DB role `authenticated` (or
-- `anon`); the service key runs as `service_role`; SECURITY DEFINER functions
-- run as their owner. So "ordinary end user" == current_user in
-- (authenticated, anon) AND not an admin. Idempotent.
-- =====================================================================

create or replace function public.lock_privileged_profile_cols()
returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    new.role            := old.role;
    new.approval_status := old.approval_status;
    new.group_id        := old.group_id;
    new.totp_enabled    := old.totp_enabled;
  end if;
  return new;
end $$;

drop trigger if exists trg_lock_profile_cols on public.profiles;
create trigger trg_lock_profile_cols
  before update on public.profiles
  for each row execute function public.lock_privileged_profile_cols();

create or replace function public.lock_privileged_candidate_cols()
returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    -- subscription_until is granted only by the payment-verify API (service role).
    new.subscription_until := old.subscription_until;
  end if;
  return new;
end $$;

drop trigger if exists trg_lock_candidate_cols on public.candidates;
create trigger trg_lock_candidate_cols
  before update on public.candidates
  for each row execute function public.lock_privileged_candidate_cols();
