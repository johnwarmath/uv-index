-- =========================================================
-- Add archive/close capability to sites
-- =========================================================

alter table public.sites
  add column archived boolean not null default false;

create index idx_sites_archived on public.sites(archived);
