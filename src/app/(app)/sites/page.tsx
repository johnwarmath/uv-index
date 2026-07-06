import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import PanelStrip from '@/components/PanelStrip';
import { SiteStatusBadge } from '@/components/Badges';
import NewSiteButton from '@/components/NewSiteButton';
import type { Site, Task } from '@/types';

export default async function SitesPage() {
  const supabase = await createClient();
  const [{ data: sites }, { data: tasks }] = await Promise.all([
    supabase.from('sites').select('*').order('created_at', { ascending: false }),
    supabase.from('tasks').select('*'),
  ]);

  const siteList = (sites ?? []) as Site[];
  const taskList = (tasks ?? []) as Task[];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-amber)] mb-1">
            {siteList.length} {siteList.length === 1 ? 'site' : 'sites'}
          </p>
          <h1 className="font-display text-3xl font-semibold">Sites</h1>
        </div>
        <NewSiteButton />
      </div>

      {siteList.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center">
          <p className="text-[var(--color-paper-dim)] mb-1">No sites yet.</p>
          <p className="text-sm text-[var(--color-paper-dim)]">Add your first utility solar site to start tracking progress, QC, and safety.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {siteList.map((site) => {
            const siteTasks = taskList.filter((t) => t.site_id === site.id);
            const progress = siteTasks.length
              ? Math.round(siteTasks.reduce((s, t) => s + t.percent_complete, 0) / siteTasks.length)
              : 0;
            return (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 hover:border-[var(--color-amber)]/50 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display font-semibold text-lg">{site.name}</p>
                    <p className="text-xs text-[var(--color-paper-dim)]">{site.location || 'No location set'}</p>
                  </div>
                  <SiteStatusBadge status={site.status} />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <PanelStrip percent={progress} />
                  <span className="font-mono text-xs text-[var(--color-paper-dim)] shrink-0">{progress}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--color-paper-dim)] font-mono">
                  <span>{site.capacity_mw ? `${site.capacity_mw} MW` : '—'}</span>
                  <span>{siteTasks.length} tasks</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
