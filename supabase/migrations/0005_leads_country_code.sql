-- Firewall 7 CRM: Add country_code to leads
-- Run this in Supabase SQL Editor

alter table public.leads
  add column if not exists country_code text;
