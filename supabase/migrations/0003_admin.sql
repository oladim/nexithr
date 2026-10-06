-- =====================================================================
-- Role administration helper.
--
-- Public signup only ever creates a 'candidate' (see handle_new_user).
-- Elevated roles (admin, recruiter, interviewer) are granted deliberately
-- with this function, run from the Supabase SQL editor by a project owner.
--
--   select public.set_user_role('you@yourcompany.com', 'admin');
--
-- Non-destructive: it changes the role and ensures the matching sub-row
-- exists, but never deletes a user's existing candidate/interviewer data.
-- =====================================================================
create or replace function public.set_user_role(user_email text, new_role user_role)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  select id into uid from public.profiles where lower(email) = lower(user_email);
  if uid is null then
    raise exception 'No user found with email %', user_email;
  end if;

  update public.profiles set role = new_role where id = uid;

  if new_role = 'candidate' then
    insert into public.candidates (id) values (uid) on conflict (id) do nothing;
  elsif new_role = 'interviewer' then
    insert into public.interviewers (id) values (uid) on conflict (id) do nothing;
  end if;

  return format('%s is now %s', user_email, new_role);
end $$;

-- Only the service role / SQL editor should call this — not end users.
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on function public.set_user_role(text, user_role) from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.set_user_role(text, user_role) from authenticated';
  end if;
end $$;
