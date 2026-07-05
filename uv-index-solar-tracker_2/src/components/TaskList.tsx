'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Trash2 } from 'lucide-react';
import { TaskStatusBadge } from '@/components/Badges';
import PanelStrip from '@/components/PanelStrip';
import type { Task, TaskStatus, Profile } from '@/types';

export default function TaskList({
  siteId,
  tasks,
  isAdmin,
}: {
  siteId: string;
  tasks: Task[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

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
          className="mb-4 flex flex-wrap items-end gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3"
        >
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
        </form>
      )}

      {tasks.length === 0 ? (
        <p className="text-sm text-[var(--color-paper-dim)] py-6 text-center border border-dashed border-[var(--color-border)] rounded-md">
          No tasks yet. Add milestones to track construction progress.
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
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
              <div className="flex items-center gap-3">
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
                <span className="font-mono text-xs text-[var(--color-paper-dim)] w-9 shrink-0">
                  {task.percent_complete}%
                </span>
                {task.due_date && (
                  <span className="font-mono text-xs text-[var(--color-paper-dim)] shrink-0">
                    Due {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
