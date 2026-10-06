-- =====================================================================
-- 0018 — Role-based access control for the admin portal.
--
-- Admins can be split into GROUPS, and each group is granted a set of
-- feature permissions (the keys in lib/permissions.js). An admin whose
-- profile has NO group (group_id is null) is a SUPER-ADMIN and implicitly
-- holds every permission — this keeps every pre-existing admin fully
-- functional with no data migration.
--
-- Group create/update/delete and user ↔ group assignment are performed
-- server-side with the service-role key (admin API routes), after the
-- caller has been verified. RLS below only needs to let a signed-in user
-- READ the group they belong to (so their permissions resolve) and let
-- admins read all groups for the management UI. Idempotent.
-- =====================================================================

create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  permissions text[] not null default '{}',
  created_at  timestamptz not null default now()
);

alter table public.profiles add column if not exists group_id uuid references public.groups(id) on delete set null;

alter table public.groups enable row level security;

-- A user may read their own group (to resolve permissions); admins read all.
drop policy if exists groups_select on public.groups;
create policy groups_select on public.groups
  for select to authenticated
  using (
    public.is_admin()
    or id = (select p.group_id from public.profiles p where p.id = auth.uid())
  );
-- (No insert/update/delete policies — writes go through the service role.)
