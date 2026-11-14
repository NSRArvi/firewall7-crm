-- Firewall 7 CRM: Authentication, RBAC & Admin Seeding
-- Run this in Supabase SQL Editor after 0001_initial_schema.sql

create extension if not exists "pgcrypto";

-- 1. Helper functions for RLS
create or replace function public.get_my_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

-- 2. Auto-create profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'member'),
    'active'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Tighten RLS policies: Only active authenticated users can view/manage data
drop policy if exists "Authenticated users can view profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Active users can view profiles"
  on public.profiles for select
  to authenticated
  using (public.is_active_user());

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id and public.is_active_user())
  with check (auth.uid() = id);

create policy "Admins can manage all profiles"
  on public.profiles for all
  to authenticated
  using (public.get_my_role() = 'admin' and public.is_active_user())
  with check (public.get_my_role() = 'admin' and public.is_active_user());

-- 4. Seed initial Admin user: admin@firewall7.com / @Firewall7
do $$
declare
  admin_id uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email = 'admin@firewall7.com') then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated',
      'authenticated',
      'admin@firewall7.com',
      crypt('@Firewall7', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Firewall 7 Admin","role":"admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into public.profiles (id, full_name, email, role, status)
    values (admin_id, 'Firewall 7 Admin', 'admin@firewall7.com', 'admin', 'active')
    on conflict (id) do update set role = 'admin', status = 'active';
  end if;
end $$;
