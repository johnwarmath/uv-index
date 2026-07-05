import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import Link from 'next/link';
import PanelStrip from '@/components/PanelStrip';
import { SiteStatusBadge, IncidentSeverityBadge } from '@/components/Badges';
import { ArrowUpRight, ShieldAlert, ClipboardCheck, MapPin, TrendingUp } from 'lucide-react';
import type { Site, Task, SafetyIncident, QcInspection } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: sites }, { data: tasks }, { data: incidents }, { data: qc }] = await Promise.all([
    supabase.from('sites').select('*').order('created_at', { ascending: false }),
    supabase.from('tasks').select('*'),
    supabase.from('safety_incidents').select('*').order('occurred_at', { ascending: false }),
    supabase.from('qc_inspections').select('*'),
  ]);

  const siteList = (sites ?? []) as Site[];
  const taskList = (tasks ?? []) as Task[];
  const incidentList = (incidents ?? []) as SafetyIncident[];
  const qcList = (qc ?? []) as QcInspection[];

  const avgProgress = taskList.length
    ? Math.round(taskList.reduce((sum, t) => sum + t.percent_complete, 0) / taskList.length)
    : 0;
  const openIncidents = incidentList.filter((i) => i.status === 'open' || i.status === 'investigating');
  const qcFailRate = qcList.length
    ? Math.round((qcList.filter((q) => q.result === 'fail').length / qcList.length) * 100)
    : 0;
  const recentIncidents = incidentList.slice(0, 5);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-amber)] mb-1">
          Portfolio overview
        </p>
        <h1 className="font-display text-3xl font-semibold">
          Morning, {profile?.full_name?.split(' ')[0] || 'there'}.
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={MapPin} label="Active sites" value={siteList.length.toString()} />
        <StatCard icon={TrendingUp} label="Avg. progress" value={`${avgProgress}%`} />
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
            {siteList.length === 0 && (
              <EmptyState text="No sites yet. Add your first solar site to start tracking." />
            )}
            {siteList.slice(0, 5).map((site) => {
              const siteTasks = taskList.filter((t) => t.site_id === site.id);
              const progress = siteTasks.length
                ? Math.round(siteTasks.reduce((s, t) => s + t.percent_complete, 0) / siteTasks.length)
                : 0;
              return (
                <Link
                  key={site.id}
                  href={`/sites/${site.id}`}
                  className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 hover:border-[var(--color-amber)]/50 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-display font-semibold">{site.name}</p>
                      <p className="text-xs text-[var(--color-paper-dim)]">{site.location || 'No location set'}</p>
                    </div>
                    <SiteStatusBadge status={site.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <PanelStrip percent={progress} />
                    <span className="font-mono text-xs text-[var(--color-paper-dim)] shrink-0">{progress}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent incidents */}
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
