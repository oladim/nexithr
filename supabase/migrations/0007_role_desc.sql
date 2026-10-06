-- =====================================================================
-- Role requirements: add a long-text description (full role brief / detailed
-- requirements). role_key is already a text PK, so admins can add custom roles.
-- =====================================================================
alter table public.role_requirements add column if not exists description text;
