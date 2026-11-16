-- Firewall 7 CRM: Module 2.2 & 2.8 - Tighten Leads & Lead Activities RLS
-- Run this in Supabase SQL Editor

drop policy if exists "Team can manage leads" on public.leads;
create policy "Active team can manage leads"
  on public.leads for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

drop policy if exists "Team can manage lead_activities" on public.lead_activities;
create policy "Active team can manage lead_activities"
  on public.lead_activities for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());
