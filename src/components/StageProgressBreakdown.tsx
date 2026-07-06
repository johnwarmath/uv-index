'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import PanelStrip from '@/components/PanelStrip';
import { computeStageBreakdown } from '@/lib/progress';
import type { Task, QaqcChecklistItem, QaqcSignoffResult } from '@/types';

export default function StageProgressBreakdown({
  checklistItems,
  tasks,
  signoffResults,
}: {
  checklistItems: QaqcChecklistItem[];
  tasks: Task[];
  signoffResults: QaqcSignoffResult[];
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const breakdown = useMemo(
    () => computeStageBreakdown(checklistItems, tasks, signoffResults),
    [checklistItems, tasks, signoffResults]
  );

  const flows = useMemo(() => Array.from(new Set(breakdown.map((b) => b.flow))), [breakdown]);

  function toggle(flow: string) {
    setCollapsed((prev) => ({ ...prev, [flow]: !prev[flow] }));
  }

  if (breakdown.length === 0) return null;

  return (
    <div className="space-y-2 mb-8">
      <p className="text-xs font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-2">
        Progress by stage
      </p>
      {flows.map((flow) => {
        const stages = breakdown.filter((b) => b.flow === flow);
        const flowConstruction = Math.round(
          stages.reduce((s, x) => s + x.constructionPercent, 0) / stages.length
        );
        const flowQaqc = Math.round(stages.reduce((s, x) => s + x.qaqcPercent, 0) / stages.length);
        const isCollapsed = collapsed[flow];

        return (
          <div key={flow} className="rounded-md border border-[var(--color-border)] overflow-hidden">
            <button
              onClick={() => toggle(flow)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card)]/70 transition text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                {isCollapsed ? (
                  <ChevronRight size={14} className="shrink-0 text-[var(--color-paper-dim)]" />
                ) : (
                  <ChevronDown size={14} className="shrink-0 text-[var(--color-paper-dim)]" />
                )}
                <span className="font-display font-semibold text-sm">{flow}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[var(--color-paper-dim)] w-9">CNSTR</span>
                  <div className="w-16">
                    <PanelStrip percent={flowConstruction} segments={8} />
                  </div>
                  <span className="font-mono text-xs text-[var(--color-paper-dim)] w-8">{flowConstruction}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[var(--color-paper-dim)] w-9">QAQC</span>
                  <div className="w-16">
                    <PanelStrip percent={flowQaqc} segments={8} />
                  </div>
                  <span className="font-mono text-xs text-[var(--color-paper-dim)] w-8">{flowQaqc}%</span>
                </div>
              </div>
            </button>

            {!isCollapsed && (
              <div className="divide-y divide-[var(--color-border)]">
                {stages.map((s) => (
                  <div key={s.stage} className="flex items-center justify-between gap-3 px-3 py-2 bg-[var(--color-bg)]">
                    <span className="text-xs text-[var(--color-paper-dim)] truncate">{s.stage}</span>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14">
                          <PanelStrip percent={s.constructionPercent} segments={6} />
                        </div>
                        <span className="font-mono text-xs text-[var(--color-paper-dim)] w-8">
                          {s.constructionPercent}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-14">
                          <PanelStrip percent={s.qaqcPercent} segments={6} />
                        </div>
                        <span className="font-mono text-xs text-[var(--color-paper-dim)] w-8">{s.qaqcPercent}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
