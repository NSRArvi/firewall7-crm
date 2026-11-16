-- Firewall 7 CRM: Module 2.10 - Activity Logs RLS
-- Run this in Supabase SQL Editor

drop policy if exists "Team can view activity_logs" on public.activity_logs;
create policy "Active team can view activity_logs"
  on public.activity_logs for select
  to authenticated
  using (public.is_active_user());

create policy "Active team can insert activity_logs"
  on public.activity_logs for insert
  to authenticated
  with check (public.is_active_user());
