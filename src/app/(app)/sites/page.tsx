import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import PanelStrip from '@/components/PanelStrip';
import { SiteStatusBadge } from '@/components/Badges';
import NewSiteButton from '@/components/NewSiteButton';
import { computeConstructionPercent, computeQaqcPercent } from '@/lib/progress';
import type { Site, Task, QaqcChecklistItem, QaqcSignoff, QaqcSignoffResult } from '@/types';

export default async function SitesPage() {
  const supabase = await createClient();
  const [{ data: sites }, { data: tasks }, { data: checklistItems }, { data: signoffs }] = await Promise.all([
    supabase.from('sites').select('*').order('created_at', { ascending: false }),
    supabase.from('tasks').select('*'),
    supabase.from('qaqc_checklist_items').select('*'),
    supabase.from('qaqc_signoffs').select('*'),
  ]);

  const signoffIds = (signoffs ?? []).map((s) => s.id);
  const { data: signoffResults } =
    signoffIds.length > 0
      ? await supabase.from('qaqc_signoff_results').select('*').in('signoff_id', signoffIds)
      : { data: [] };

  const siteList = (sites ?? []) as Site[];
  const taskList = (tasks ?? []) as Task[];
  const checklistItemList = (checklistItems ?? []) as QaqcChecklistItem[];
  const signoffList = (signoffs ?? []) as QaqcSignoff[];
  const signoffResultList = (signoffResults ?? []) as QaqcSignoffResult[];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-amber)] mb-1">
            {siteList.length} {siteList.length === 1 ? 'site' : 'sites'}
          </p>
          <h1 className="font-display text-3xl font-semibold">Sites</h1>
        </div>
        <NewSiteButton checklistItems={checklistItemList} />
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
            const siteSignoffIds = signoffList.filter((s) => s.site_id === site.id).map((s) => s.id);
            const siteSignoffResults = signoffResultList.filter((r) => siteSignoffIds.includes(r.signoff_id));
            const constructionPercent = computeConstructionPercent(siteTasks);
            const qaqcPercent = computeQaqcPercent(checklistItemList, siteSignoffResults);
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
                <div className="space-y-1.5 mb-3">
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
                    <span className="font-mono text-xs text-[var(--color-paper-dim)] shrink-0 w-8">{qaqcPercent}%</span>
                  </div>
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
