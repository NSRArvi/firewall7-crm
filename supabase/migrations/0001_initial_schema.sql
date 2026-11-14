-- Firewall 7 CRM & Business Management System
-- Initial PostgreSQL Schema for Supabase

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES & RBAC (Module 2.9)
create type user_role as enum ('admin', 'manager', 'member');
create type account_status as enum ('active', 'inactive', 'invited');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'member',
  status account_status not null default 'active',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. LEADS & WEBSITE ENQUIRIES (Modules 2.2 & 2.8)
create type lead_status as enum ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost');
create type lead_source as enum ('website_consultation', 'website_contact', 'referral', 'outbound', 'other');

create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null,
  company_name text,
  job_title text,
  phone text,
  topic text,
  notes text,
  source lead_source not null default 'website_consultation',
  status lead_status not null default 'new',
  consultation_date date,
  consultation_slot text,
  timezone text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_activities (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  activity_type text not null, -- 'note', 'call', 'email', 'meeting', 'status_change'
  content text not null,
  follow_up_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3. CLIENTS (Module 2.3)
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  address text,
  industry text,
  lead_id uuid references public.leads(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_documents (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 4. CYBERSECURITY SERVICES CATALOG (Module 2.4)
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  description text,
  base_price numeric(12, 2) not null default 0,
  billing_cycle text not null default 'one_time', -- 'one_time', 'monthly', 'annual'
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. QUOTATIONS (Module 2.5)
create type quotation_status as enum ('draft', 'sent', 'approved', 'rejected', 'expired');

create table public.quotations (
  id uuid primary key default uuid_generate_v4(),
  quote_number text not null unique,
  client_id uuid references public.clients(id) on delete cascade not null,
  status quotation_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  tax_rate numeric(5, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  valid_until date,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quotation_items (
  id uuid primary key default uuid_generate_v4(),
  quotation_id uuid references public.quotations(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null,
  description text not null,
  quantity integer not null default 1,
  unit_price numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0
);

-- 6. INVOICES & PAYMENTS (Module 2.6)
create type invoice_status as enum ('unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled');

create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text not null unique,
  client_id uuid references public.clients(id) on delete cascade not null,
  quotation_id uuid references public.quotations(id) on delete set null,
  status invoice_status not null default 'unpaid',
  subtotal numeric(12, 2) not null default 0,
  tax_rate numeric(5, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  amount_paid numeric(12, 2) not null default 0,
  due_date date not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  amount numeric(12, 2) not null,
  payment_method text not null,
  payment_date date not null default current_date,
  reference_number text,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 7. PROJECTS & TASKS (Module 2.7)
create type project_status as enum ('planning', 'in_progress', 'review', 'completed', 'on_hold');
create type task_status as enum ('todo', 'in_progress', 'done');

create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  status project_status not null default 'planning',
  start_date date,
  deadline date,
  manager_id uuid references public.profiles(id) on delete set null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status task_status not null default 'todo',
  assigned_to uuid references public.profiles(id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. ACTIVITY LOGS & NOTIFICATIONS (Module 2.10)
create table public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.clients enable row level security;
alter table public.client_documents enable row level security;
alter table public.services enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.projects enable row level security;
alter table public.project_tasks enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

-- Basic authenticated internal team policies (can be refined per role)
create policy "Authenticated users can view profiles" on public.profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create policy "Team can manage leads" on public.leads for all to authenticated using (true) with check (true);
create policy "Team can manage lead_activities" on public.lead_activities for all to authenticated using (true) with check (true);
create policy "Team can manage clients" on public.clients for all to authenticated using (true) with check (true);
create policy "Team can manage client_documents" on public.client_documents for all to authenticated using (true) with check (true);
create policy "Team can manage services" on public.services for all to authenticated using (true) with check (true);
create policy "Team can manage quotations" on public.quotations for all to authenticated using (true) with check (true);
create policy "Team can manage quotation_items" on public.quotation_items for all to authenticated using (true) with check (true);
create policy "Team can manage invoices" on public.invoices for all to authenticated using (true) with check (true);
create policy "Team can manage payments" on public.payments for all to authenticated using (true) with check (true);
create policy "Team can manage projects" on public.projects for all to authenticated using (true) with check (true);
create policy "Team can manage project_tasks" on public.project_tasks for all to authenticated using (true) with check (true);
create policy "Team can view activity_logs" on public.activity_logs for select to authenticated using (true);
create policy "Users can manage own notifications" on public.notifications for all to authenticated using (auth.uid() = user_id);
