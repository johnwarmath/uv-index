-- =========================================================
-- Lessons learned log
-- =========================================================

create type lesson_type as enum ('went_well', 'improvement_area');

create table public.lessons_learned (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  title text not null,
  type lesson_type not null default 'improvement_area',
  category text not null default 'general',
  description text default '',
  recommendation text default '',
  photo_url text,
  latitude double precision,
  longitude double precision,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.lessons_learned enable row level security;

create policy "lessons_select_all"
  on public.lessons_learned for select to authenticated using (true);

create policy "lessons_insert_authenticated"
  on public.lessons_learned for insert to authenticated with check (true);

create policy "lessons_update_authenticated"
  on public.lessons_learned for update to authenticated using (true) with check (true);

create policy "lessons_delete_admin_only"
  on public.lessons_learned for delete to authenticated using (public.is_admin());

create index idx_lessons_site_id on public.lessons_learned(site_id);
