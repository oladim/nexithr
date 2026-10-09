-- =====================================================================
-- 0027 — Maintenance mode.
--   * app_settings: on/off switch, scheduled start, expected end, message.
--   * public.in_maintenance(): true once maintenance is ON and its start
--     time has passed (or no start was set). It stays true until an admin
--     switches it off — the end time is only shown to users as an estimate.
--   * RESTRICTIVE write policies on user-facing tables: while maintenance
--     is active nobody except an admin can insert/update/delete, even by
--     calling Supabase directly from the browser. Reads still work.
--     (Server routes using the service role are blocked in middleware.)
-- Idempotent.
-- =====================================================================

alter table public.app_settings add column if not exists maintenance_enabled boolean not null default false;
alter table public.app_settings add column if not exists maintenance_start   timestamptz;
alter table public.app_settings add column if not exists maintenance_end     timestamptz;
alter table public.app_settings add column if not exists maintenance_message text;

create or replace function public.in_maintenance()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select maintenance_enabled and (maintenance_start is null or maintenance_start <= now())
    from public.app_settings where id = 1
  ), false);
$$;
grant execute on function public.in_maintenance() to anon, authenticated;

do $$
declare
  t text;
  tables text[] := array[
    'profiles','candidates','cvs','interviews','ai_interviews','stage_attempts',
    'interviewer_notes','submissions','enrollments','applications','jobs',
    'hire_requests','course_requests','staff_applications','candidate_payments',
    'payments','token_transactions','notification_prefs','certificates'
  ];
begin
  foreach t in array tables loop
    if to_regclass('public.' || t) is null then continue; end if;
    execute format('drop policy if exists maint_block_ins on public.%I', t);
    execute format('drop policy if exists maint_block_upd on public.%I', t);
    execute format('drop policy if exists maint_block_del on public.%I', t);
    execute format('create policy maint_block_ins on public.%I as restrictive for insert to authenticated
                      with check (public.is_admin() or not public.in_maintenance())', t);
    execute format('create policy maint_block_upd on public.%I as restrictive for update to authenticated
                      using (public.is_admin() or not public.in_maintenance())
                      with check (public.is_admin() or not public.in_maintenance())', t);
    execute format('create policy maint_block_del on public.%I as restrictive for delete to authenticated
                      using (public.is_admin() or not public.in_maintenance())', t);
  end loop;
end $$;
