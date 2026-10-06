-- =====================================================================
-- Re-runnable version of the storage setup. Safe to run any time — it drops
-- the policies first, so you won't hit "policy ... already exists".
-- (If you already ran 0002_storage.sql, running this once is enough and 0002
--  can be ignored.)
-- =====================================================================
insert into storage.buckets (id, name, public) values ('cvs', 'cvs', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

drop policy if exists "cv_owner_rw"        on storage.objects;
drop policy if exists "cv_staff_read"      on storage.objects;
drop policy if exists "avatar_public_read" on storage.objects;
drop policy if exists "avatar_owner_write" on storage.objects;

create policy "cv_owner_rw" on storage.objects
  for all to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "cv_staff_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'cvs' and public.is_staff());

create policy "avatar_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatar_owner_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
