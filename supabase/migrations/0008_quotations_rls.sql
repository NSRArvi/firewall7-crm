-- Firewall 7 CRM: Module 2.5 - Tighten Quotations RLS
-- Run this in Supabase SQL Editor

drop policy if exists "Team can manage quotations" on public.quotations;
create policy "Active team can manage quotations"
  on public.quotations for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

drop policy if exists "Team can manage quotation_items" on public.quotation_items;
create policy "Active team can manage quotation_items"
  on public.quotation_items for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());
