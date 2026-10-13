-- =====================================================================
-- 0036 — CV review can suggest a lower level.
-- When the AI read of a CV shows the candidate meets a LOWER level of their
-- chosen role (e.g. Mid-level instead of Senior), the reviewer can suggest
-- it. The candidate accepts (target role changes to that level and the CV is
-- approved) or keeps their level (the review goes back to the reviewer).
-- Idempotent.
-- =====================================================================

alter type cv_status add value if not exists 'Level suggested';

alter table public.cvs add column if not exists suggested_role     text;   -- role_key the reviewer suggests
alter table public.cvs add column if not exists original_role      text;   -- role_key the candidate applied with
alter table public.cvs add column if not exists level_response     text;   -- 'accepted' | 'declined' | null
alter table public.cvs add column if not exists level_responded_at timestamptz;

-- Only admins (or the server) may set the suggestion or record a response —
-- a candidate must not be able to point suggested_role at any role they like.
create or replace function public.cvs_guard_level()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.suggested_role := null; new.original_role := null;
      new.level_response := null; new.level_responded_at := null;
    else
      new.suggested_role := old.suggested_role; new.original_role := old.original_role;
      new.level_response := old.level_response; new.level_responded_at := old.level_responded_at;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists cvs_guard_level on public.cvs;
create trigger cvs_guard_level before insert or update on public.cvs
  for each row execute function public.cvs_guard_level();
