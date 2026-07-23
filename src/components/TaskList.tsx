'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import PanelStrip from '@/components/PanelStrip';
import type { Task, TaskStatus, QaqcChecklistItem } from '@/types';

const UNGROUPED = 'Ungrouped';

export default function TaskList({
  siteId,
  tasks,
  checklistItems,
  isAdmin,
}: {
  siteId: string;
  tasks: Task[];
  checklistItems: QaqcChecklistItem[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const flows = useMemo(() => Array.from(new Set(checklistItems.map((i) => i.flow))), [checklistItems]);
  const [flow, setFlow] = useState(flows[0] || '');
  const stages = useMemo(
    () => Array.from(new Set(checklistItems.filter((i) => i.flow === flow).map((i) => i.stage))),
    [checklistItems, flow]
  );
  const [stage, setStage] = useState(stages[0] || '');

  function handleFlowChange(newFlow: string) {
    setFlow(newFlow);
    setStage(checklistItems.find((i) => i.flow === newFlow)?.stage || '');
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('tasks').insert({
      site_id: siteId,
      title,
      due_date: dueDate || null,
      flow,
      stage,
      created_by: user?.id,
    });
    setLoading(false);
    setTitle('');
    setDueDate('');
    setOpen(false);
    router.refresh();
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    const supabase = createClient();
    await supabase.from('tasks').update(patch).eq('id', id);
    router.refresh();
  }

  async function deleteTask(id: string) {
    const supabase = createClient();
    await supabase.from('tasks').delete().eq('id', id);
    router.refresh();
  }

  // Group tasks by flow, ordered by the checklist template's flow order, with legacy/no-flow tasks last.
  const flowOrder = flows.length ? flows : Array.from(new Set(tasks.map((t) => t.flow).filter(Boolean)));
  const groupedFlows = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const key = t.flow || UNGROUPED;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    const ordered = [...flowOrder.filter((f) => map.has(f)), ...(map.has(UNGROUPED) ? [UNGROUPED] : [])];
    return ordered.map((f) => ({ flow: f, tasks: map.get(f)! }));
  }, [tasks, flowOrder]);

  function toggleCollapse(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-semibold">Progress tasks</h3>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-card)] transition"
        >
          <Plus size={14} /> Add task
        </button>
      </div>

      {open && (
        <form
          onSubmit={handleAdd}
          className="mb-4 space-y-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Flow
              </label>
              <select
                value={flow}
                onChange={(e) => handleFlowChange(e.target.value)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              >
                {flows.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              >
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Task
              </label>
              <input
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Install racking — Block C"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Due
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-[var(--color-amber)] px-3 py-1.5 text-sm font-semibold text-[var(--color-bg)] hover:brightness-105 disabled:opacity-60"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border border-[var(--color-border)] p-1.5 text-[var(--color-paper-dim)] hover:bg-[var(--color-bg)]"
            >
              <X size={16} />
            </button>
          </div>
        </form>
      )}

      {tasks.length === 0 ? (
        <p className="text-sm text-[var(--color-paper-dim)] py-6 text-center border border-dashed border-[var(--color-border)] rounded-md">
          No tasks yet. Add milestones to track construction progress.
        </p>
      ) : (
        <div className="space-y-3">
          {groupedFlows.map(({ flow: flowKey, tasks: flowTasks }) => {
            const flowProgress = Math.round(
              flowTasks.reduce((s, t) => s + t.percent_complete, 0) / flowTasks.length
            );
            const isCollapsed = collapsed[flowKey];

            // Sub-group by stage within this flow, preserving checklist stage order where available.
            const stageOrderForFlow = Array.from(
              new Set(checklistItems.filter((i) => i.flow === flowKey).map((i) => i.stage))
            );
            const byStage = new Map<string, Task[]>();
            for (const t of flowTasks) {
              const key = t.stage || UNGROUPED;
              if (!byStage.has(key)) byStage.set(key, []);
              byStage.get(key)!.push(t);
            }
            const orderedStages = [
              ...stageOrderForFlow.filter((s) => byStage.has(s)),
              ...(byStage.has(UNGROUPED) ? [UNGROUPED] : []),
            ];

            return (
              <div key={flowKey} className="rounded-md border border-[var(--color-border)] overflow-hidden">
                <button
                  onClick={() => toggleCollapse(flowKey)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card)]/70 transition text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isCollapsed ? (
                      <ChevronRight size={14} className="shrink-0 text-[var(--color-paper-dim)]" />
                    ) : (
                      <ChevronDown size={14} className="shrink-0 text-[var(--color-paper-dim)]" />
                    )}
                    <span className="font-display font-semibold text-sm">{flowKey}</span>
                    <span className="text-xs text-[var(--color-paper-dim)] font-mono">({flowTasks.length})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-40">
                    <PanelStrip percent={flowProgress} segments={10} />
                    <span className="font-mono text-xs text-[var(--color-paper-dim)] w-9 shrink-0">
                      {flowProgress}%
                    </span>
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="p-3 space-y-3 bg-[var(--color-bg)]">
                    {orderedStages.map((stageKey) => (
                      <div key={stageKey}>
                        <p className="text-xs font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-2">
                          {stageKey}
                        </p>
                        <div className="space-y-2">
                          {byStage.get(stageKey)!.map((task) => (
                            <div
                              key={task.id}
                              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <p className="text-sm font-medium leading-snug">{task.title}</p>
                                <div className="flex items-center gap-2 shrink-0">
                                  <select
                                    value={task.status}
                                    onChange={(e) => {
                                      const status = e.target.value as TaskStatus;
                                      const percent =
                                        status === 'complete' ? 100 : status === 'not_started' ? 0 : task.percent_complete;
                                      updateTask(task.id, { status, percent_complete: percent });
                                    }}
                                    className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs outline-none"
                                  >
                                    <option value="not_started">Not started</option>
                                    <option value="in_progress">In progress</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="complete">Complete</option>
                                  </select>
                                  {isAdmin && (
                                    <button
                                      onClick={() => deleteTask(task.id)}
                                      className="text-[var(--color-paper-dim)] hover:text-[var(--color-incident-bright)]"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mb-2">
                                <PanelStrip percent={task.percent_complete} segments={20} />
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={task.percent_complete}
                                  onChange={(e) => {
                                    const percent = parseInt(e.target.value);
                                    updateTask(task.id, {
                                      percent_complete: percent,
                                      status: percent === 100 ? 'complete' : percent === 0 ? 'not_started' : 'in_progress',
                                    });
                                  }}
                                  className="w-24 accent-[var(--color-amber)]"
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={task.percent_complete}
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      if (raw === '') return;
                                      const percent = Math.max(0, Math.min(100, parseInt(raw) || 0));
                                      updateTask(task.id, {
                                        percent_complete: percent,
                                        status: percent === 100 ? 'complete' : percent === 0 ? 'not_started' : 'in_progress',
                                      });
                                    }}
                                    className="w-12 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 py-0.5 text-xs font-mono text-right outline-none focus:border-[var(--color-amber)]"
                                  />
                                  <span className="font-mono text-xs text-[var(--color-paper-dim)]">%</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)]">
                                    Due
                                  </span>
                                  <input
                                    type="date"
                                    value={task.due_date ?? ''}
                                    onChange={(e) => updateTask(task.id, { due_date: e.target.value || null })}
                                    className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 py-0.5 text-xs outline-none focus:border-[var(--color-amber)]"
                                  />
                                </div>
                                <span className="font-mono text-[10px] text-[var(--color-paper-dim)]">
                                  Updated {new Date(task.updated_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
