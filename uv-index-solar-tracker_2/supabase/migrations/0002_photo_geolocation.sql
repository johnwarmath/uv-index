-- =========================================================
-- Add device geolocation to QC inspections and safety incidents
-- =========================================================

alter table public.qc_inspections
  add column latitude double precision,
  add column longitude double precision;

alter table public.safety_incidents
  add column latitude double precision,
  add column longitude double precision;

-- ---------- Storage bucket for photos ----------
insert into storage.buckets (id, name, public)
values ('site-photos', 'site-photos', true)
on conflict (id) do nothing;

-- Any authenticated user can upload; anyone can view (bucket is public);
-- only admins can delete.
create policy "site_photos_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-photos');

create policy "site_photos_select_all"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'site-photos');

create policy "site_photos_delete_admin_only"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-photos' and public.is_admin());
