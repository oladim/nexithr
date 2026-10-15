-- =====================================================================
-- 0037 — Multiple role tracks, CV per role, reminders, upload hardening.
--
-- 1. candidate_tracks — every role a candidate is pursuing. The ACTIVE one is
--    candidates.target_role. Subscribers can add more (limit in settings).
--    Each track has its own CV, AI interview, Professional/HR interviews and
--    certificate. Switching tracks (switch_track) archives the pipeline rows
--    of the current role and restores those of the next one, atomically, so
--    the rest of the app always works on "the active role".
-- 2. cvs.role_key / certificates per role.
-- 3. Reminder bookkeeping + settings.
-- 4. Storage: size and file-type limits on every bucket; candidates can no
--    longer write CV files directly — uploads go through the server, which
--    validates them first.
-- Idempotent.
-- =====================================================================

-- ---------- settings ----------
alter table public.app_settings add column if not exists max_roles_per_candidate int     not null default 3;
alter table public.app_settings add column if not exists nudges_enabled          boolean not null default true;
alter table public.app_settings add column if not exists nudge_after_days        int     not null default 3;
alter table public.app_settings add column if not exists nudge_interval_days     int     not null default 4;
alter table public.app_settings add column if not exists nudge_max_per_step      int     not null default 3;

-- ---------- reminder bookkeeping ----------
alter table public.candidates add column if not exists nudge_key      text;
alter table public.candidates add column if not exists nudge_count    int not null default 0;
alter table public.candidates add column if not exists last_nudged_at timestamptz;

-- ---------- CV per role ----------
alter table public.cvs add column if not exists role_key text;
update public.cvs v set role_key = c.target_role
  from public.candidates c where c.id = v.candidate_id and v.role_key is null;
create index if not exists cvs_candidate_role_idx on public.cvs(candidate_id, role_key, uploaded_at desc);

-- New CVs belong to the candidate's active role (a candidate can't file a CV
-- under another role).
create or replace function public.cvs_default_role()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.role_key is null or (current_user in ('authenticated', 'anon') and not public.is_admin()) then
    new.role_key := (select target_role from public.candidates where id = new.candidate_id);
  end if;
  return new;
end $$;
drop trigger if exists cvs_default_role on public.cvs;
create trigger cvs_default_role before insert on public.cvs
  for each row execute function public.cvs_default_role();

-- ---------- certificates per role ----------
alter table public.certificates drop constraint if exists certificates_candidate_id_key;
do $$ begin
  alter table public.certificates add constraint certificates_candidate_role_key unique (candidate_id, role_key);
exception when duplicate_object or duplicate_table then null; end $$;

-- ---------- tracks ----------
create table if not exists public.candidate_tracks (
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  role_key     text not null,
  archived     jsonb,                 -- pipeline rows while this track is inactive
  created_at   timestamptz not null default now(),
  primary key (candidate_id, role_key)
);
alter table public.candidate_tracks enable row level security;
drop policy if exists tracks_select on public.candidate_tracks;
create policy tracks_select on public.candidate_tracks for select to authenticated
  using (candidate_id = auth.uid() or public.is_staff());
-- No client writes: add / switch go through the server.

insert into public.candidate_tracks (candidate_id, role_key)
  select id, target_role from public.candidates
  where target_role is not null and trim(target_role) <> ''
on conflict do nothing;

-- Changing the active role from the profile (before interviews start) renames
-- the track and moves its CVs — unless switch_track is doing the change.
create or replace function public.candidates_sync_track()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(current_setting('nexit.switching', true), '') = '1' then return new; end if;
  if new.target_role is distinct from old.target_role and new.target_role is not null and trim(new.target_role) <> '' then
    if old.target_role is not null and exists (select 1 from public.candidate_tracks where candidate_id = new.id and role_key = old.target_role)
       and not exists (select 1 from public.candidate_tracks where candidate_id = new.id and role_key = new.target_role) then
      update public.candidate_tracks set role_key = new.target_role where candidate_id = new.id and role_key = old.target_role;
      update public.cvs set role_key = new.target_role where candidate_id = new.id and role_key = old.target_role;
    elsif old.target_role is not null and exists (select 1 from public.candidate_tracks where candidate_id = new.id and role_key = new.target_role) then
      -- That role is another of their tracks with its own progress: switching
      -- must go through switch_track so nothing gets mixed up.
      raise exception 'You already have that role in My roles. Switch to it from your dashboard instead.' using errcode = 'P0001';
    else
      insert into public.candidate_tracks (candidate_id, role_key) values (new.id, new.target_role) on conflict do nothing;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists candidates_sync_track on public.candidates;
create trigger candidates_sync_track after update of target_role on public.candidates
  for each row execute function public.candidates_sync_track();

create or replace function public.candidates_track_on_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.target_role is not null and trim(new.target_role) <> '' then
    insert into public.candidate_tracks (candidate_id, role_key) values (new.id, new.target_role) on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists candidates_track_on_insert on public.candidates;
create trigger candidates_track_on_insert after insert on public.candidates
  for each row execute function public.candidates_track_on_insert();

-- Atomically make another track active. Server-only.
create or replace function public.switch_track(cid uuid, new_role text)
returns void language plpgsql security definer set search_path = public as $$
declare
  cur text;
  arch jsonb;
begin
  select target_role into cur from public.candidates where id = cid for update;
  if not found then raise exception 'NO_CANDIDATE'; end if;
  if cur is not distinct from new_role then return; end if;
  if not exists (select 1 from public.candidate_tracks where candidate_id = cid and role_key = new_role) then
    raise exception 'NO_TRACK';
  end if;
  if exists (select 1 from public.interviews where candidate_id = cid and status = 'Confirmed') then
    raise exception 'OPEN_INTERVIEW';
  end if;

  -- 1) archive the current track's pipeline
  if cur is not null then
    insert into public.candidate_tracks (candidate_id, role_key) values (cid, cur) on conflict do nothing;
    update public.candidate_tracks set archived = jsonb_build_object(
      'ai',        (select to_jsonb(a) from public.ai_interviews a where a.candidate_id = cid),
      'stages',    coalesce((select jsonb_agg(to_jsonb(s)) from public.stage_attempts s where s.candidate_id = cid), '[]'::jsonb),
      'interviews',coalesce((select jsonb_agg(to_jsonb(i)) from public.interviews i where i.candidate_id = cid), '[]'::jsonb),
      'notes',     coalesce((select jsonb_agg(to_jsonb(n)) from public.interviewer_notes n where n.candidate_id = cid), '[]'::jsonb),
      'last_ai_attempt_at', (select to_jsonb(last_ai_attempt_at) from public.candidates where id = cid)
    ) where candidate_id = cid and role_key = cur;
    delete from public.interviewer_notes where candidate_id = cid;
    delete from public.stage_attempts    where candidate_id = cid;
    delete from public.interviews        where candidate_id = cid;
    delete from public.ai_interviews     where candidate_id = cid;
  end if;

  -- 2) restore the next track
  select archived into arch from public.candidate_tracks where candidate_id = cid and role_key = new_role;
  if arch is not null then
    if jsonb_typeof(arch->'ai') = 'object' then
      insert into public.ai_interviews select * from jsonb_populate_record(null::public.ai_interviews, arch->'ai');
    end if;
    insert into public.stage_attempts    select * from jsonb_populate_recordset(null::public.stage_attempts,    coalesce(arch->'stages', '[]'));
    insert into public.interviews        select * from jsonb_populate_recordset(null::public.interviews,        coalesce(arch->'interviews', '[]'));
    insert into public.interviewer_notes select * from jsonb_populate_recordset(null::public.interviewer_notes, coalesce(arch->'notes', '[]'));
  end if;
  -- A fresh track starts like a fresh sign-up: an empty AI interview record.
  insert into public.ai_interviews (candidate_id) values (cid) on conflict do nothing;
  update public.candidate_tracks set archived = null where candidate_id = cid and role_key = new_role;

  perform set_config('nexit.switching', '1', true);
  update public.candidates
     set target_role = new_role,
         last_ai_attempt_at = case when arch ? 'last_ai_attempt_at' and jsonb_typeof(arch->'last_ai_attempt_at') = 'string'
                                   then (arch->>'last_ai_attempt_at')::timestamptz else null end,
         nudge_key = null, nudge_count = 0
   where id = cid;
  perform set_config('nexit.switching', '', true);
end $$;
revoke all on function public.switch_track(uuid, text) from public, anon, authenticated;
grant execute on function public.switch_track(uuid, text) to service_role;

-- ---------- storage hardening ----------
update storage.buckets set file_size_limit = 5242880,
  allowed_mime_types = array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  where id = 'cvs';
update storage.buckets set file_size_limit = 2097152,
  allowed_mime_types = array['image/png','image/jpeg','image/webp']      -- no SVG (can carry scripts)
  where id = 'avatars';
update storage.buckets set file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf','image/png','image/jpeg']
  where id = 'staff-docs';
update storage.buckets set file_size_limit = 26214400,
  allowed_mime_types = array['application/pdf','image/png','image/jpeg','image/webp','application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain']
  where id = 'training';

-- CV files: candidates may READ their own, but only the server writes them
-- (after validating the file). Staff read via the existing staff policy.
drop policy if exists "cv_owner_rw"   on storage.objects;
drop policy if exists "cv_owner_read" on storage.objects;
create policy "cv_owner_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

-- CV records: candidates read their own; only admins (and the server, after
-- validating the file) create, change or delete them. Stops a client from
-- filing a record that points at someone else's file.
drop policy if exists cvs_write on public.cvs;
drop policy if exists cvs_admin_write on public.cvs;
create policy cvs_admin_write on public.cvs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create index if not exists cvs_status_idx on public.cvs(status, uploaded_at desc);
