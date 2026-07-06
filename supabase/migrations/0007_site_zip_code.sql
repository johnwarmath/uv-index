-- =========================================================
-- Add ZIP code to sites for precise weather geocoding
-- =========================================================

alter table public.sites
  add column zip_code text not null default '';
