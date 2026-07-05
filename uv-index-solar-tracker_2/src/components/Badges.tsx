import type { SiteStatus, TaskStatus, QcResult, IncidentSeverity, IncidentStatus, LessonType } from '@/types';

const siteStatusStyles: Record<SiteStatus, string> = {
  planning: 'bg-[var(--color-blocked)]/20 text-[var(--color-blocked)] border-[var(--color-blocked)]/40',
  construction: 'bg-[var(--color-amber)]/15 text-[var(--color-amber)] border-[var(--color-amber)]/40',
  commissioning: 'bg-[var(--color-working)]/20 text-[var(--color-working-bright)] border-[var(--color-working)]/40',
  operational: 'bg-[var(--color-working-bright)]/20 text-[var(--color-working-bright)] border-[var(--color-working-bright)]/40',
  on_hold: 'bg-[var(--color-incident)]/15 text-[var(--color-incident-bright)] border-[var(--color-incident)]/40',
};

const taskStatusStyles: Record<TaskStatus, string> = {
  not_started: 'bg-[var(--color-blocked)]/20 text-[var(--color-blocked)] border-[var(--color-blocked)]/40',
  in_progress: 'bg-[var(--color-amber)]/15 text-[var(--color-amber)] border-[var(--color-amber)]/40',
  blocked: 'bg-[var(--color-incident)]/15 text-[var(--color-incident-bright)] border-[var(--color-incident)]/40',
  complete: 'bg-[var(--color-working-bright)]/20 text-[var(--color-working-bright)] border-[var(--color-working-bright)]/40',
};

const qcResultStyles: Record<QcResult, string> = {
  pass: 'bg-[var(--color-working-bright)]/20 text-[var(--color-working-bright)] border-[var(--color-working-bright)]/40',
  fail: 'bg-[var(--color-incident)]/15 text-[var(--color-incident-bright)] border-[var(--color-incident)]/40',
  na: 'bg-[var(--color-blocked)]/20 text-[var(--color-blocked)] border-[var(--color-blocked)]/40',
};

const incidentSeverityStyles: Record<IncidentSeverity, string> = {
  near_miss: 'bg-[var(--color-blocked)]/20 text-[var(--color-blocked)] border-[var(--color-blocked)]/40',
  minor: 'bg-[var(--color-amber)]/15 text-[var(--color-amber)] border-[var(--color-amber)]/40',
  serious: 'bg-[var(--color-incident)]/15 text-[var(--color-incident-bright)] border-[var(--color-incident)]/40',
  critical: 'bg-[var(--color-incident)]/30 text-[var(--color-incident-bright)] border-[var(--color-incident-bright)]/60',
};

const incidentStatusStyles: Record<IncidentStatus, string> = {
  open: 'bg-[var(--color-incident)]/15 text-[var(--color-incident-bright)] border-[var(--color-incident)]/40',
  investigating: 'bg-[var(--color-amber)]/15 text-[var(--color-amber)] border-[var(--color-amber)]/40',
  resolved: 'bg-[var(--color-working)]/20 text-[var(--color-working-bright)] border-[var(--color-working)]/40',
  closed: 'bg-[var(--color-blocked)]/20 text-[var(--color-blocked)] border-[var(--color-blocked)]/40',
};

const lessonTypeStyles: Record<LessonType, string> = {
  went_well: 'bg-[var(--color-working-bright)]/20 text-[var(--color-working-bright)] border-[var(--color-working-bright)]/40',
  improvement_area: 'bg-[var(--color-amber)]/15 text-[var(--color-amber)] border-[var(--color-amber)]/40',
};

function labelize(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}

export function SiteStatusBadge({ status }: { status: SiteStatus }) {
  return <Badge className={siteStatusStyles[status]}>{labelize(status)}</Badge>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={taskStatusStyles[status]}>{labelize(status)}</Badge>;
}

export function QcResultBadge({ result }: { result: QcResult }) {
  return <Badge className={qcResultStyles[result]}>{result === 'na' ? 'N/A' : labelize(result)}</Badge>;
}

export function IncidentSeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return <Badge className={incidentSeverityStyles[severity]}>{labelize(severity)}</Badge>;
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return <Badge className={incidentStatusStyles[status]}>{labelize(status)}</Badge>;
}

export function LessonTypeBadge({ type }: { type: LessonType }) {
  return (
    <Badge className={lessonTypeStyles[type]}>{type === 'went_well' ? 'Went well' : 'Improvement area'}</Badge>
  );
}
