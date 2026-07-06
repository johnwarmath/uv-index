import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Zap, Calendar } from 'lucide-react';
import PanelStrip from '@/components/PanelStrip';
import StageProgressBreakdown from '@/components/StageProgressBreakdown';
import WeatherForecast from '@/components/WeatherForecast';
import { SiteStatusBadge } from '@/components/Badges';
import SiteTabs from '@/components/SiteTabs';
import { computeConstructionPercent, computeQaqcPercent } from '@/lib/progress';
import { geocodeLocation, getForecast } from '@/lib/weather';
import type {
  Site,
  Task,
  QcInspection,
  SafetyIncident,
  LessonLearned,
  QaqcChecklistItem,
  QaqcSignoff,
  QaqcSignoffResult,
  Exhibit,
  Lntp,
} from '@/types';

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [
    { data: site },
    { data: tasks },
    { data: inspections },
    { data: incidents },
    { data: lessons },
    { data: checklistItems },
    { data: signoffs },
    { data: exhibits },
    { data: lntps },
  ] = await Promise.all([
    supabase.from('sites').select('*').eq('id', id).single(),
    supabase.from('tasks').select('*').eq('site_id', id).order('created_at', { ascending: false }),
    supabase.from('qc_inspections').select('*').eq('site_id', id).order('inspected_at', { ascending: false }),
    supabase.from('safety_incidents').select('*').eq('site_id', id).order('occurred_at', { ascending: false }),
    supabase.from('lessons_learned').select('*').eq('site_id', id).order('created_at', { ascending: false }),
    supabase.from('qaqc_checklist_items').select('*').order('sort_order', { ascending: true }),
    supabase.from('qaqc_signoffs').select('*').eq('site_id', id).order('signed_off_at', { ascending: false }),
    supabase.from('exhibits').select('*').eq('site_id', id).order('created_at', { ascending: false }),
    supabase.from('lntps').select('*').eq('site_id', id).order('created_at', { ascending: false }),
  ]);

  if (!site) notFound();

  const signoffIds = (signoffs ?? []).map((s) => s.id);
  const { data: signoffResults } =
    signoffIds.length > 0
      ? await supabase.from('qaqc_signoff_results').select('*').in('signoff_id', signoffIds)
      : { data: [] };

  const siteData = site as Site;
  const taskList = (tasks ?? []) as Task[];
  const inspectionList = (inspections ?? []) as QcInspection[];
  const incidentList = (incidents ?? []) as SafetyIncident[];
  const lessonList = (lessons ?? []) as LessonLearned[];
  const checklistItemList = (checklistItems ?? []) as QaqcChecklistItem[];
  const signoffList = (signoffs ?? []) as QaqcSignoff[];
  const signoffResultList = (signoffResults ?? []) as QaqcSignoffResult[];
  const exhibitList = (exhibits ?? []) as Exhibit[];
  const lntpList = (lntps ?? []) as Lntp[];

  const progress = computeConstructionPercent(taskList);
  const qaqcOverall = computeQaqcPercent(checklistItemList, signoffResultList);

  const geocode = await geocodeLocation(siteData.location);
  const forecast = geocode ? await getForecast(geocode.latitude, geocode.longitude) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 max-w-xl">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] shrink-0 w-16">
              Construction
            </span>
            <PanelStrip percent={progress} />
            <span className="font-mono text-sm text-[var(--color-paper-dim)] shrink-0">{progress}%</span>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] shrink-0 w-16">
              QAQC
            </span>
            <PanelStrip percent={qaqcOverall} />
            <span className="font-mono text-sm text-[var(--color-paper-dim)] shrink-0">{qaqcOverall}%</span>
          </div>
        </div>
      </div>

      <WeatherForecast forecast={forecast} locationLabel={geocode?.displayName ?? null} />

      <StageProgressBreakdown checklistItems={checklistItemList} tasks={taskList} signoffResults={signoffResultList} />

      <SiteTabs
        site={siteData}
        tasks={taskList}
        inspections={inspectionList}
        incidents={incidentList}
        lessons={lessonList}
        checklistItems={checklistItemList}
        signoffs={signoffList}
        signoffResults={signoffResultList}
        exhibits={exhibitList}
        lntps={lntpList}
        isAdmin={profile?.role === 'admin'}
      />
    </div>
  );
}
