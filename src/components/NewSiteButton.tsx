'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, ChevronDown, ChevronRight, Check } from 'lucide-react';
import type { SiteStatus, QaqcChecklistItem } from '@/types';

export default function NewSiteButton({ checklistItems }: { checklistItems: QaqcChecklistItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'details' | 'tasks'>('details');

  // Step 1 fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState<SiteStatus>('planning');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Step 2: selected checklist item ids -> become tasks
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsedFlows, setCollapsedFlows] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const flows = useMemo(() => Array.from(new Set(checklistItems.map((i) => i.flow))), [checklistItems]);

  function resetAll() {
    setName('');
    setLocation('');
    setCapacity('');
    setStatus('planning');
    setTargetDate('');
    setSelected(new Set());
    setStep('details');
    setError(null);
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Site name is required.');
      return;
    }
    setError(null);
    setStep('tasks');
  }

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleStage(stageItems: QaqcChecklistItem[], allSelected: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const item of stageItems) {
        if (allSelected) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
  }

  function toggleFlow(flowItems: QaqcChecklistItem[], allSelected: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const item of flowItems) {
        if (allSelected) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
  }

  function toggleCollapse(flow: string) {
    setCollapsedFlows((prev) => ({ ...prev, [flow]: !prev[flow] }));
  }

  async function handleCreate() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .insert({
        name,
        location,
        capacity_mw: capacity ? parseFloat(capacity) : null,
        status,
        target_completion: targetDate || null,
        created_by: user?.id,
      })
      .select()
      .single();

    if (siteError || !site) {
      setLoading(false);
      setError(siteError?.message || 'Failed to create site.');
      return;
    }

    if (selected.size > 0) {
      const selectedItems = checklistItems.filter((i) => selected.has(i.id));
      const taskRows = selectedItems.map((item) => ({
        site_id: site.id,
        title: item.item_text,
        flow: item.flow,
        stage: item.stage,
        created_by: user?.id,
      }));
      await supabase.from('tasks').insert(taskRows);
    }

    setLoading(false);
    setOpen(false);
    resetAll();
    router.push(`/sites/${site.id}`);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-amber)] px-3.5 py-2 text-sm font-semibold text-[var(--color-bg)] hover:brightness-105 transition"
      >
        <Plus size={16} strokeWidth={2.5} />
        New site
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-raised)]">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--color-border)]">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  {step === 'details' ? 'New solar site' : 'Select initial tasks'}
                </h2>
                {step === 'tasks' && (
                  <p className="text-xs text-[var(--color-paper-dim)] mt-1">
                    Toggle on the checklist items relevant to this project — each becomes a Progress task.
                    {selected.size > 0 && ` ${selected.size} selected.`}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  resetAll();
                }}
                className="text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]"
              >
                <X size={18} />
              </button>
            </div>

            {step === 'details' && (
              <form onSubmit={handleNext} className="p-6 space-y-4 overflow-y-auto">
                <Field label="Site name">
                  <input
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mesquite Ridge Solar"
                    className="input"
                  />
                </Field>
                <Field label="Location">
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Pecos County, TX"
                    className="input"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Capacity (MW)">
                    <input
                      type="number"
                      step="0.1"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="150"
                      className="input"
                    />
                  </Field>
                  <Field label="Status">
                    <select value={status} onChange={(e) => setStatus(e.target.value as SiteStatus)} className="input">
                      <option value="planning">Planning</option>
                      <option value="construction">Construction</option>
                      <option value="commissioning">Commissioning</option>
                      <option value="operational">Operational</option>
                      <option value="on_hold">On hold</option>
                    </select>
                  </Field>
                </div>
                <Field label="Target completion">
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="input"
                  />
                </Field>

                {error && (
                  <p className="text-sm text-[var(--color-incident-bright)] bg-[var(--color-incident)]/10 border border-[var(--color-incident)]/30 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      resetAll();
                    }}
                    className="flex-1 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-bg-card)] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-[var(--color-amber)] px-3 py-2 text-sm font-semibold text-[var(--color-bg)] hover:brightness-105 transition"
                  >
                    Next: pick tasks
                  </button>
                </div>
              </form>
            )}

            {step === 'tasks' && (
              <>
                <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-2">
                  {flows.map((flow) => {
                    const flowItems = checklistItems.filter((i) => i.flow === flow);
                    const flowAllSelected = flowItems.every((i) => selected.has(i.id));
                    const flowSomeSelected = flowItems.some((i) => selected.has(i.id));
                    const stages = Array.from(new Set(flowItems.map((i) => i.stage)));
                    const isCollapsed = collapsedFlows[flow];

                    return (
                      <div key={flow} className="rounded-md border border-[var(--color-border)] overflow-hidden">
                        <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[var(--color-bg-card)]">
                          <button
                            onClick={() => toggleCollapse(flow)}
                            className="flex items-center gap-2 min-w-0 flex-1 text-left"
                          >
                            {isCollapsed ? (
                              <ChevronRight size={14} className="shrink-0 text-[var(--color-paper-dim)]" />
                            ) : (
                              <ChevronDown size={14} className="shrink-0 text-[var(--color-paper-dim)]" />
                            )}
                            <span className="font-display font-semibold text-sm">{flow}</span>
                            <span className="text-xs text-[var(--color-paper-dim)] font-mono">
                              ({flowItems.filter((i) => selected.has(i.id)).length}/{flowItems.length})
                            </span>
                          </button>
                          <button
                            onClick={() => toggleFlow(flowItems, flowAllSelected)}
                            className={`shrink-0 flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-mono uppercase tracking-wide transition ${
                              flowSomeSelected
                                ? 'border-[var(--color-amber)] text-[var(--color-amber)]'
                                : 'border-[var(--color-border)] text-[var(--color-paper-dim)] hover:bg-[var(--color-bg)]'
                            }`}
                          >
                            {flowAllSelected ? 'Clear all' : 'Select all'}
                          </button>
                        </div>

                        {!isCollapsed && (
                          <div className="p-2 space-y-2 bg-[var(--color-bg)]">
                            {stages.map((stage) => {
                              const stageItems = flowItems.filter((i) => i.stage === stage);
                              const stageAllSelected = stageItems.every((i) => selected.has(i.id));
                              return (
                                <div key={stage}>
                                  <div className="flex items-center justify-between px-1 mb-1">
                                    <p className="text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)]">
                                      {stage}
                                    </p>
                                    <button
                                      onClick={() => toggleStage(stageItems, stageAllSelected)}
                                      className="text-[10px] font-mono text-[var(--color-amber)] hover:underline"
                                    >
                                      {stageAllSelected ? 'Clear' : 'Select all'}
                                    </button>
                                  </div>
                                  <div className="space-y-1">
                                    {stageItems.map((item) => {
                                      const checked = selected.has(item.id);
                                      return (
                                        <label
                                          key={item.id}
                                          className={`flex items-start gap-2 rounded px-2 py-1.5 text-sm cursor-pointer transition ${
                                            checked
                                              ? 'bg-[var(--color-amber)]/10'
                                              : 'hover:bg-[var(--color-bg-card)]/60'
                                          }`}
                                        >
                                          <span
                                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                              checked
                                                ? 'bg-[var(--color-amber)] border-[var(--color-amber)]'
                                                : 'border-[var(--color-border)]'
                                            }`}
                                          >
                                            {checked && <Check size={11} className="text-[var(--color-bg)]" strokeWidth={3} />}
                                          </span>
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleItem(item.id)}
                                            className="sr-only"
                                          />
                                          <span className={checked ? 'text-[var(--color-paper)]' : 'text-[var(--color-paper-dim)]'}>
                                            {item.item_text}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <p className="mx-6 mb-2 text-sm text-[var(--color-incident-bright)] bg-[var(--color-incident)]/10 border border-[var(--color-incident)]/30 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-2 p-6 pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => setStep('details')}
                    className="flex-1 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-bg-card)] transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="flex-1 rounded-md bg-[var(--color-amber)] px-3 py-2 text-sm font-semibold text-[var(--color-bg)] hover:brightness-105 disabled:opacity-60 transition"
                  >
                    {loading ? 'Creating…' : `Create site${selected.size > 0 ? ` with ${selected.size} tasks` : ''}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid var(--color-border);
          background: var(--color-bg-card);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: var(--color-amber);
        }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
