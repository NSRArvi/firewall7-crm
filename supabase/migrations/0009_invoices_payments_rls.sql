-- Firewall 7 CRM: Module 2.6 - Tighten Invoices & Payments RLS
-- Run this in Supabase SQL Editor

drop policy if exists "Team can manage invoices" on public.invoices;
create policy "Active team can manage invoices"
  on public.invoices for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

drop policy if exists "Team can manage payments" on public.payments;
create policy "Active team can manage payments"
  on public.payments for all
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());
