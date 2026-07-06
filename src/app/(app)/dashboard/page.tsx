import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import Link from 'next/link';
import PanelStrip from '@/components/PanelStrip';
import { SiteStatusBadge, IncidentSeverityBadge, LessonTypeBadge } from '@/components/Badges';
import { ArrowUpRight, ShieldAlert, ClipboardCheck, MapPin, TrendingUp, Lightbulb } from 'lucide-react';
import { computeConstructionPercent, computeQaqcPercent } from '@/lib/progress';
import type {
  Site,
  Task,
  SafetyIncident,
  QcInspection,
  QaqcChecklistItem,
  QaqcSignoff,
  QaqcSignoffResult,
  LessonLearned,
} from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [
    { data: sites },
    { data: tasks },
    { data: incidents },
    { data: qc },
    { data: checklistItems },
    { data: signoffs },
    { data: lessons },
  ] = await Promise.all([
    supabase.from('sites').select('*').order('created_at', { ascending: false }),
    supabase.from('tasks').select('*'),
    supabase.from('safety_incidents').select('*').order('occurred_at', { ascending: false }),
    supabase.from('qc_inspections').select('*'),
    supabase.from('qaqc_checklist_items').select('*'),
    supabase.from('qaqc_signoffs').select('*'),
    supabase.from('lessons_learned').select('*').order('created_at', { ascending: false }),
  ]);

  const signoffIds = (signoffs ?? []).map((s) => s.id);
  const { data: signoffResults } =
    signoffIds.length > 0
      ? await supabase.from('qaqc_signoff_results').select('*').in('signoff_id', signoffIds)
      : { data: [] };

  const allSites = (sites ?? []) as Site[];
  const activeSites = allSites.filter((s) => !s.archived);
  const activeSiteIds = new Set(activeSites.map((s) => s.id));

  const taskList = ((tasks ?? []) as Task[]).filter((t) => activeSiteIds.has(t.site_id));
  const incidentList = ((incidents ?? []) as SafetyIncident[]).filter((i) => activeSiteIds.has(i.site_id));
  const qcList = ((qc ?? []) as QcInspection[]).filter((q) => activeSiteIds.has(q.site_id));
  const lessonList = ((lessons ?? []) as LessonLearned[]).filter((l) => activeSiteIds.has(l.site_id));
  const checklistItemList = (checklistItems ?? []) as QaqcChecklistItem[];
  const signoffList = ((signoffs ?? []) as QaqcSignoff[]).filter((s) => activeSiteIds.has(s.site_id));
  const signoffResultList = (signoffResults ?? []) as QaqcSignoffResult[];

  const avgProgress = computeConstructionPercent(taskList);
  const avgQaqc = computeQaqcPercent(checklistItemList, signoffResultList);
  const openIncidents = incidentList.filter((i) => i.status === 'open' || i.status === 'investigating');
  const qcFailRate = qcList.length
    ? Math.round((qcList.filter((q) => q.result === 'fail').length / qcList.length) * 100)
    : 0;
  const recentIncidents = incidentList.slice(0, 4);
  const recentLessons = lessonList.slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-amber)] mb-1">
          Portfolio overview
        </p>
        <h1 className="font-display text-3xl font-semibold">
          Morning, {profile?.full_name?.split(' ')[0] || 'there'}.
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={MapPin} label="Active sites" value={activeSites.length.toString()} />
        <StatCard icon={TrendingUp} label="Avg. construction" value={`${avgProgress}%`} />
        <StatCard icon={ClipboardCheck} label="Avg. QAQC signoff" value={`${avgQaqc}%`} />
        <StatCard
          icon={ShieldAlert}
          label="Open incidents"
          value={openIncidents.length.toString()}
          tone={openIncidents.length > 0 ? 'incident' : 'default'}
        />
        <StatCard
          icon={ClipboardCheck}
          label="QC fail rate"
          value={`${qcFailRate}%`}
          tone={qcFailRate > 15 ? 'incident' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sites list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Sites</h2>
            <Link href="/sites" className="text-sm text-[var(--color-amber)] hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {activeSites.length === 0 && (
              <EmptyState text="No active sites. Add your first solar site to start tracking." />
            )}
            {activeSites.slice(0, 5).map((site) => {
              const siteTasks = taskList.filter((t) => t.site_id === site.id);
              const siteSignoffIds = signoffList.filter((s) => s.site_id === site.id).map((s) => s.id);
              const siteSignoffResults = signoffResultList.filter((r) => siteSignoffIds.includes(r.signoff_id));
              const constructionPercent = computeConstructionPercent(siteTasks);
              const qaqcPercent = computeQaqcPercent(checklistItemList, siteSignoffResults);
              return (
                <Link
                  key={site.id}
                  href={`/sites/${site.id}`}
                  className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 hover:border-[var(--color-amber)]/50 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-display font-semibold">{site.name}</p>
                      <p className="text-xs text-[var(--color-paper-dim)]">{site.location || 'No location set'}</p>
                    </div>
                    <SiteStatusBadge status={site.status} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-[var(--color-paper-dim)] w-14 shrink-0">CNSTR</span>
                      <PanelStrip percent={constructionPercent} />
                      <span className="font-mono text-xs text-[var(--color-paper-dim)] shrink-0 w-8">
                        {constructionPercent}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-[var(--color-paper-dim)] w-14 shrink-0">QAQC</span>
                      <PanelStrip percent={qaqcPercent} />
                      <span className="font-mono text-xs text-[var(--color-paper-dim)] shrink-0 w-8">
                        {qaqcPercent}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent incidents + lessons learned */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">Recent incidents</h2>
              <Link href="/incidents" className="text-sm text-[var(--color-amber)] hover:underline flex items-center gap-1">
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentIncidents.length === 0 && <EmptyState text="No incidents logged. That's a good sign." />}
              {recentIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-medium leading-snug">{inc.title}</p>
                    <IncidentSeverityBadge severity={inc.severity} />
                  </div>
                  <p className="text-xs text-[var(--color-paper-dim)] font-mono">
                    {new Date(inc.occurred_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">Lessons learned</h2>
              <Link href="/lessons" className="text-sm text-[var(--color-amber)] hover:underline flex items-center gap-1">
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentLessons.length === 0 && <EmptyState text="No lessons logged yet." />}
              {recentLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-medium leading-snug flex items-center gap-1.5">
                      <Lightbulb size={12} className="text-[var(--color-amber)] shrink-0" />
                      {lesson.title}
                    </p>
                    <LessonTypeBadge type={lesson.type} />
                  </div>
                  <p className="text-xs text-[var(--color-paper-dim)] font-mono">
                    {new Date(lesson.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: 'default' | 'incident';
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <div className="flex items-center gap-2 mb-2 text-[var(--color-paper-dim)]">
        <Icon size={14} />
        <span className="text-xs font-mono uppercase tracking-wide">{label}</span>
      </div>
      <p
        className={`font-display text-2xl font-semibold ${
          tone === 'incident' ? 'text-[var(--color-incident-bright)]' : 'text-[var(--color-paper)]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
      <p className="text-sm text-[var(--color-paper-dim)]">{text}</p>
    </div>
  );
}
