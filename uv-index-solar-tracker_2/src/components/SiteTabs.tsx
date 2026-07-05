'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import TaskList from '@/components/TaskList';
import QcList from '@/components/QcList';
import IncidentList from '@/components/IncidentList';
import LessonsLearnedList from '@/components/LessonsLearnedList';
import QaqcSignoffTab from '@/components/QaqcSignoffTab';
import type {
  Task,
  QcInspection,
  SafetyIncident,
  LessonLearned,
  QaqcChecklistItem,
  QaqcSignoff,
  QaqcSignoffResult,
} from '@/types';

const SiteMap = dynamic(() => import('@/components/SiteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] flex items-center justify-center text-sm text-[var(--color-paper-dim)]">
      Loading map…
    </div>
  ),
});

const tabs = [
  { key: 'progress', label: 'Progress' },
  { key: 'qc', label: 'Quality control' },
  { key: 'qaqc', label: 'QAQC signoff' },
  { key: 'safety', label: 'Safety' },
  { key: 'lessons', label: 'Lessons learned' },
  { key: 'map', label: 'Map' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function SiteTabs({
  siteId,
  tasks,
  inspections,
  incidents,
  lessons,
  checklistItems,
  signoffs,
  signoffResults,
  isAdmin,
}: {
  siteId: string;
  tasks: Task[];
  inspections: QcInspection[];
  incidents: SafetyIncident[];
  lessons: LessonLearned[];
  checklistItems: QaqcChecklistItem[];
  signoffs: QaqcSignoff[];
  signoffResults: QaqcSignoffResult[];
  isAdmin: boolean;
}) {
  const [tab, setTab] = useState<TabKey>('progress');

  const counts: Record<TabKey, number> = {
    progress: tasks.length,
    qc: inspections.length,
    qaqc: signoffs.length,
    safety: incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length,
    lessons: lessons.length,
    map: 0,
  };

  return (
    <div>
      <div className="flex gap-1 border-b border-[var(--color-border)] mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-2.5 text-sm font-medium transition ${
              tab === t.key ? 'text-[var(--color-paper)]' : 'text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]'
            }`}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-mono ${
                  t.key === 'safety' && counts[t.key] > 0
                    ? 'bg-[var(--color-incident)]/20 text-[var(--color-incident-bright)]'
                    : 'bg-[var(--color-bg-card)] text-[var(--color-paper-dim)]'
                }`}
              >
                {counts[t.key]}
              </span>
            )}
            {tab === t.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-amber)]" />
            )}
          </button>
        ))}
      </div>

      {tab === 'progress' && <TaskList siteId={siteId} tasks={tasks} isAdmin={isAdmin} />}
      {tab === 'qc' && <QcList siteId={siteId} inspections={inspections} isAdmin={isAdmin} />}
      {tab === 'qaqc' && (
        <QaqcSignoffTab
          siteId={siteId}
          checklistItems={checklistItems}
          signoffs={signoffs}
          signoffResults={signoffResults}
          isAdmin={isAdmin}
        />
      )}
      {tab === 'safety' && <IncidentList siteId={siteId} incidents={incidents} isAdmin={isAdmin} />}
      {tab === 'lessons' && <LessonsLearnedList siteId={siteId} lessons={lessons} isAdmin={isAdmin} />}
      {tab === 'map' && <SiteMap inspections={inspections} incidents={incidents} />}
    </div>
  );
}
