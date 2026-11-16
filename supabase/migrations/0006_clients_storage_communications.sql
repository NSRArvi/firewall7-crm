-- Firewall 7 CRM: Module 2.3 - Client Management, Communications & Storage
-- Run this in Supabase SQL Editor

-- 1. Tighten RLS on clients & client_documents
drop policy if exists "Team can manage clients" on public.clients;
create policy "Active team can manage clients"
  on public.clients for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

drop policy if exists "Team can manage client_documents" on public.client_documents;
create policy "Active team can manage client_documents"
  on public.client_documents for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

-- 2. Client Communications table
create table if not exists public.client_communications (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  channel text not null default 'note', -- 'note', 'call', 'email', 'meeting'
  summary text not null,
  created_at timestamptz not null default now()
);

alter table public.client_communications enable row level security;

create policy "Active team can manage client_communications"
  on public.client_communications for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

-- 3. Supabase Storage bucket for client documents
insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', false)
on conflict (id) do nothing;

create policy "Active team can upload client documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'client-documents' and public.is_active_user());

create policy "Active team can view client documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'client-documents' and public.is_active_user());

create policy "Active team can delete client documents"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'client-documents' and public.is_active_user());
