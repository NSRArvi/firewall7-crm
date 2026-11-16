-- Firewall 7 CRM: Module 2.7 - Tighten Projects & Tasks RLS
-- Run this in Supabase SQL Editor

drop policy if exists "Team can manage projects" on public.projects;
create policy "Active team can manage projects"
  on public.projects for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

drop policy if exists "Team can manage project_tasks" on public.project_tasks;
create policy "Active team can manage project_tasks"
  on public.project_tasks for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());
