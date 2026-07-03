import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Zap, Calendar } from 'lucide-react';
import PanelStrip from '@/components/PanelStrip';
import { SiteStatusBadge } from '@/components/Badges';
import SiteTabs from '@/components/SiteTabs';
import type { Site, Task, QcInspection, SafetyIncident, LessonLearned } from '@/types';

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: site }, { data: tasks }, { data: inspections }, { data: incidents }, { data: lessons }] =
    await Promise.all([
      supabase.from('sites').select('*').eq('id', id).single(),
      supabase.from('tasks').select('*').eq('site_id', id).order('created_at', { ascending: false }),
      supabase.from('qc_inspections').select('*').eq('site_id', id).order('inspected_at', { ascending: false }),
      supabase.from('safety_incidents').select('*').eq('site_id', id).order('occurred_at', { ascending: false }),
      supabase.from('lessons_learned').select('*').eq('site_id', id).order('created_at', { ascending: false }),
    ]);

  if (!site) notFound();

  const siteData = site as Site;
  const taskList = (tasks ?? []) as Task[];
  const inspectionList = (inspections ?? []) as QcInspection[];
  const incidentList = (incidents ?? []) as SafetyIncident[];
  const lessonList = (lessons ?? []) as LessonLearned[];

  const progress = taskList.length
    ? Math.round(taskList.reduce((s, t) => s + t.percent_complete, 0) / taskList.length)
    : 0;

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/sites"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-paper-dim)] hover:text-[var(--color-paper)] mb-6"
      >
        <ArrowLeft size={14} /> All sites
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="font-display text-3xl font-semibold">{siteData.name}</h1>
          <SiteStatusBadge status={siteData.status} />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-paper-dim)] mb-5">
          {siteData.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> {siteData.location}
            </span>
          )}
          {siteData.capacity_mw && (
            <span className="flex items-center gap-1.5">
              <Zap size={14} /> {siteData.capacity_mw} MW
            </span>
          )}
          {siteData.target_completion && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> Target {new Date(siteData.target_completion).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 max-w-sm">
          <PanelStrip percent={progress} />
          <span className="font-mono text-sm text-[var(--color-paper-dim)] shrink-0">{progress}% complete</span>
        </div>
      </div>

      <SiteTabs
        siteId={siteData.id}
        tasks={taskList}
        inspections={inspectionList}
        incidents={incidentList}
        lessons={lessonList}
        isAdmin={profile?.role === 'admin'}
      />
    </div>
  );
}
