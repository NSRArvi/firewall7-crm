-- Firewall 7 CRM: Module 2.9 - Custom Roles, Designations & Module Permissions
-- Run this in Supabase SQL Editor after 0002_auth_rbac.sql

-- 1. ROLES TABLE
create table if not exists public.roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  is_system boolean not null default false,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. DESIGNATIONS TABLE
create table if not exists public.designations (
  id uuid primary key default uuid_generate_v4(),
  title text not null unique,
  department text,
  created_at timestamptz not null default now()
);

-- 3. LINK PROFILES TO ROLES & DESIGNATIONS
alter table public.profiles
  add column if not exists role_id uuid references public.roles(id) on delete set null,
  add column if not exists designation_id uuid references public.designations(id) on delete set null;

-- 4. ENABLE RLS
alter table public.roles enable row level security;
alter table public.designations enable row level security;

create policy "Active users can view roles"
  on public.roles for select
  to authenticated
  using (public.is_active_user());

create policy "Admins can manage roles"
  on public.roles for all
  to authenticated
  using (public.get_my_role() = 'admin' and public.is_active_user())
  with check (public.get_my_role() = 'admin' and public.is_active_user());

create policy "Active users can view designations"
  on public.designations for select
  to authenticated
  using (public.is_active_user());

create policy "Admins can manage designations"
  on public.designations for all
  to authenticated
  using (public.get_my_role() = 'admin' and public.is_active_user())
  with check (public.get_my_role() = 'admin' and public.is_active_user());

-- 5. SEED DEFAULT ROLES
insert into public.roles (name, description, is_system, permissions)
values
  (
    'Admin',
    'Full access to all CRM modules, team management, roles, and settings.',
    true,
    '{
      "dashboard":  {"view": true, "create": true, "edit": true, "delete": true},
      "leads":      {"view": true, "create": true, "edit": true, "delete": true},
      "clients":    {"view": true, "create": true, "edit": true, "delete": true},
      "services":   {"view": true, "create": true, "edit": true, "delete": true},
      "quotations": {"view": true, "create": true, "edit": true, "delete": true},
      "invoices":   {"view": true, "create": true, "edit": true, "delete": true},
      "projects":   {"view": true, "create": true, "edit": true, "delete": true},
      "reports":    {"view": true, "create": true, "edit": true, "delete": true},
      "team":       {"view": true, "create": true, "edit": true, "delete": true}
    }'::jsonb
  ),
  (
    'Manager',
    'Manage leads, clients, quotations, invoices, and projects.',
    false,
    '{
      "dashboard":  {"view": true, "create": false, "edit": false, "delete": false},
      "leads":      {"view": true, "create": true,  "edit": true,  "delete": false},
      "clients":    {"view": true, "create": true,  "edit": true,  "delete": false},
      "services":   {"view": true, "create": true,  "edit": true,  "delete": false},
      "quotations": {"view": true, "create": true,  "edit": true,  "delete": false},
      "invoices":   {"view": true, "create": true,  "edit": true,  "delete": false},
      "projects":   {"view": true, "create": true,  "edit": true,  "delete": false},
      "reports":    {"view": true, "create": false, "edit": false, "delete": false},
      "team":       {"view": true, "create": false, "edit": false, "delete": false}
    }'::jsonb
  ),
  (
    'Member',
    'Standard team member access for assigned leads and projects.',
    false,
    '{
      "dashboard":  {"view": true,  "create": false, "edit": false, "delete": false},
      "leads":      {"view": true,  "create": true,  "edit": true,  "delete": false},
      "clients":    {"view": true,  "create": false, "edit": false, "delete": false},
      "services":   {"view": true,  "create": false, "edit": false, "delete": false},
      "quotations": {"view": true,  "create": false, "edit": false, "delete": false},
      "invoices":   {"view": false, "create": false, "edit": false, "delete": false},
      "projects":   {"view": true,  "create": true,  "edit": true,  "delete": false},
      "reports":    {"view": false, "create": false, "edit": false, "delete": false},
      "team":       {"view": false, "create": false, "edit": false, "delete": false}
    }'::jsonb
  )
on conflict (name) do nothing;

-- 6. BACKFILL EXISTING PROFILES WITH ROLE_ID
update public.profiles p
set role_id = r.id
from public.roles r
where p.role_id is null
  and (
    (p.role = 'admin' and r.name = 'Admin') or
    (p.role = 'manager' and r.name = 'Manager') or
    (p.role = 'member' and r.name = 'Member')
  );
