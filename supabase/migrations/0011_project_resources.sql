-- Firewall 7 CRM: Project Documents & Links
-- Run this in Supabase SQL Editor

create table if not exists public.project_documents (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_links (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.project_documents enable row level security;
alter table public.project_links enable row level security;

create policy "Active team can manage project_documents"
  on public.project_documents for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

create policy "Active team can manage project_links"
  on public.project_links for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false)
on conflict (id) do nothing;

create policy "Active team can upload project documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-documents' and public.is_active_user());

create policy "Active team can view project documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'project-documents' and public.is_active_user());

create policy "Active team can delete project documents"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-documents' and public.is_active_user());
