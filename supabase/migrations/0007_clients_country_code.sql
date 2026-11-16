-- Firewall 7 CRM: Add country_code to clients
-- Run this in Supabase SQL Editor

alter table public.clients
  add column if not exists country_code text;
