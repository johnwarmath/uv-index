-- =========================================================
-- Add EPC (Engineering, Procurement, Construction contractor) to sites
-- =========================================================

alter table public.sites
  add column epc text not null default '';
