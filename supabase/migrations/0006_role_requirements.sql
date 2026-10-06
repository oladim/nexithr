-- =====================================================================
-- Role requirements — the skillset an admin defines for each target role.
-- Used to score a submitted CV against the role during review.
-- =====================================================================
create table if not exists public.role_requirements (
  role_key        text primary key,            -- matches candidates.target_role
  title           text not null,
  required_skills text[] not null default '{}',
  min_experience  int not null default 1,       -- years
  updated_by      uuid references public.profiles(id) on delete set null,
  updated_at      timestamptz not null default now()
);

alter table public.role_requirements enable row level security;

-- Any signed-in user may read (candidates can see what a role needs);
-- only admins may change them.
drop policy if exists rolereq_select on public.role_requirements;
create policy rolereq_select on public.role_requirements
  for select to authenticated using (true);
drop policy if exists rolereq_write on public.role_requirements;
create policy rolereq_write on public.role_requirements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Sensible defaults (admins can edit these in the app).
insert into public.role_requirements (role_key, title, required_skills, min_experience) values
  ('software', 'Software Development', array['JavaScript','React','Node','TypeScript','SQL','REST APIs','Git'], 1),
  ('data',     'Data & Analytics',    array['Python','SQL','Pandas','Statistics','Data Visualization','Machine Learning'], 1),
  ('product',  'Product & Design',    array['Figma','Prototyping','User Research','Design Systems','Wireframing'], 1),
  ('cloud',    'Cloud & DevOps',      array['AWS','Docker','Kubernetes','CI/CD','Terraform','Linux'], 2),
  ('security', 'Cybersecurity',       array['Network Security','SIEM','Penetration Testing','Incident Response','Firewalls'], 2),
  ('support',  'IT Support',          array['Troubleshooting','Windows','Networking','Active Directory','Ticketing'], 1)
on conflict (role_key) do nothing;
