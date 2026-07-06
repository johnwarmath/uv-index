-- =========================================================
-- Preconstruction workflow: Developer/Utility context, Exhibits, LNTPs
-- =========================================================

alter table public.sites
  add column developer text not null default '',
  add column utility text not null default '';

create type exhibit_status as enum ('not_started', 'drafted', 'executed');
create type lntp_status as enum ('pending', 'issued', 'complete');

create table public.exhibits (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null,
  type text not null default 'general',
  status exhibit_status not null default 'not_started',
  target_date date,
  notes text default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lntps (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  description text not null,
  scope text default '',
  date_issued date,
  status lntp_status not null default 'pending',
  notes text default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.exhibits enable row level security;
alter table public.lntps enable row level security;

create policy "exhibits_select_all" on public.exhibits for select to authenticated using (true);
create policy "exhibits_insert_authenticated" on public.exhibits for insert to authenticated with check (true);
create policy "exhibits_update_authenticated" on public.exhibits for update to authenticated using (true) with check (true);
create policy "exhibits_delete_admin_only" on public.exhibits for delete to authenticated using (public.is_admin());

create policy "lntps_select_all" on public.lntps for select to authenticated using (true);
create policy "lntps_insert_authenticated" on public.lntps for insert to authenticated with check (true);
create policy "lntps_update_authenticated" on public.lntps for update to authenticated using (true) with check (true);
create policy "lntps_delete_admin_only" on public.lntps for delete to authenticated using (public.is_admin());

create trigger exhibits_set_updated_at before update on public.exhibits
  for each row execute function public.set_updated_at();
create trigger lntps_set_updated_at before update on public.lntps
  for each row execute function public.set_updated_at();

create index idx_exhibits_site_id on public.exhibits(site_id);
create index idx_lntps_site_id on public.lntps(site_id);
