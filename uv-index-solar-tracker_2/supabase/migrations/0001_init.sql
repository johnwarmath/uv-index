-- =========================================================
-- Solar Project Tracker: initial schema
-- =========================================================

-- ---------- ENUMS ----------
create type user_role as enum ('admin', 'standard');
create type site_status as enum ('planning', 'construction', 'commissioning', 'operational', 'on_hold');
create type task_status as enum ('not_started', 'in_progress', 'blocked', 'complete');
create type qc_result as enum ('pass', 'fail', 'na');
create type incident_severity as enum ('near_miss', 'minor', 'serious', 'critical');
create type incident_status as enum ('open', 'investigating', 'resolved', 'closed');

-- ---------- PROFILES (extends auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role user_role not null default 'standard',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
-- First user ever created becomes admin automatically; everyone after is standard.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_count int;
begin
  select count(*) into user_count from public.profiles;
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    case when user_count = 0 then 'admin' else 'standard' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- SITES ----------
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null default '',
  capacity_mw numeric(10,2),
  status site_status not null default 'planning',
  target_completion date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- TASKS (progress tracking) ----------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  title text not null,
  description text default '',
  status task_status not null default 'not_started',
  percent_complete int not null default 0 check (percent_complete between 0 and 100),
  assigned_to uuid references public.profiles(id),
  due_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- QC INSPECTIONS ----------
create table public.qc_inspections (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  title text not null,
  category text not null default 'general',
  result qc_result not null default 'na',
  notes text default '',
  photo_url text,
  inspected_by uuid references public.profiles(id),
  inspected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------- SAFETY INCIDENTS ----------
create table public.safety_incidents (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  title text not null,
  description text not null default '',
  severity incident_severity not null default 'minor',
  status incident_status not null default 'open',
  location_detail text default '',
  photo_url text,
  reported_by uuid references public.profiles(id),
  resolution_notes text default '',
  occurred_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- updated_at triggers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sites_set_updated_at before update on public.sites
  for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger incidents_set_updated_at before update on public.safety_incidents
  for each row execute function public.set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.tasks enable row level security;
alter table public.qc_inspections enable row level security;
alter table public.safety_incidents enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---- profiles ----
create policy "profiles_select_all_authenticated"
  on public.profiles for select
  to authenticated using (true);

create policy "profiles_update_self_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---- sites: everyone authenticated can read; any authenticated user can create; only admin can delete ----
create policy "sites_select_all"
  on public.sites for select to authenticated using (true);

create policy "sites_insert_authenticated"
  on public.sites for insert to authenticated with check (true);

create policy "sites_update_authenticated"
  on public.sites for update to authenticated using (true) with check (true);

create policy "sites_delete_admin_only"
  on public.sites for delete to authenticated using (public.is_admin());

-- ---- tasks ----
create policy "tasks_select_all"
  on public.tasks for select to authenticated using (true);

create policy "tasks_insert_authenticated"
  on public.tasks for insert to authenticated with check (true);

create policy "tasks_update_authenticated"
  on public.tasks for update to authenticated using (true) with check (true);

create policy "tasks_delete_admin_only"
  on public.tasks for delete to authenticated using (public.is_admin());

-- ---- qc_inspections ----
create policy "qc_select_all"
  on public.qc_inspections for select to authenticated using (true);

create policy "qc_insert_authenticated"
  on public.qc_inspections for insert to authenticated with check (true);

create policy "qc_update_authenticated"
  on public.qc_inspections for update to authenticated using (true) with check (true);

create policy "qc_delete_admin_only"
  on public.qc_inspections for delete to authenticated using (public.is_admin());

-- ---- safety_incidents ----
create policy "incidents_select_all"
  on public.safety_incidents for select to authenticated using (true);

create policy "incidents_insert_authenticated"
  on public.safety_incidents for insert to authenticated with check (true);

create policy "incidents_update_authenticated"
  on public.safety_incidents for update to authenticated using (true) with check (true);

create policy "incidents_delete_admin_only"
  on public.safety_incidents for delete to authenticated using (public.is_admin());

-- ---------- Indexes ----------
create index idx_tasks_site_id on public.tasks(site_id);
create index idx_qc_site_id on public.qc_inspections(site_id);
create index idx_incidents_site_id on public.safety_incidents(site_id);
create index idx_incidents_status on public.safety_incidents(status);
create index idx_incidents_severity on public.safety_incidents(severity);
