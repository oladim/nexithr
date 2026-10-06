-- =====================================================================
-- Storage buckets for CV files (private) and avatars (public).
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- CVs are private: a candidate can manage only files under a folder named
-- after their own user id (path convention: "<uid>/<filename>"). Staff may read.
create policy "cv_owner_rw" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "cv_staff_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'cvs' and public.is_staff());

-- Avatars are public-read; each user writes only their own folder.
create policy "avatar_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatar_owner_write" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
