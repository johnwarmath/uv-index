-- =========================================================
-- Add Flow/Stage grouping to tasks, mirroring the QAQC checklist taxonomy
-- =========================================================

alter table public.tasks
  add column flow text not null default '',
  add column stage text not null default '';

create index idx_tasks_flow_stage on public.tasks(flow, stage);
