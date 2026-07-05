'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, MinusCircle, ClipboardCheck, Trash2 } from 'lucide-react';
import type { QaqcChecklistItem, QaqcSignoff, QaqcSignoffResult, QcResult } from '@/types';

type ItemResult = Record<string, { result: QcResult; notes: string }>;

export default function QaqcSignoffTab({
  siteId,
  checklistItems,
  signoffs,
  signoffResults,
  isAdmin,
}: {
  siteId: string;
  checklistItems: QaqcChecklistItem[];
  signoffs: QaqcSignoff[];
  signoffResults: QaqcSignoffResult[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const flows = useMemo(() => Array.from(new Set(checklistItems.map((i) => i.flow))), [checklistItems]);
  const [flow, setFlow] = useState(flows[0] || '');
  const stages = useMemo(
    () => Array.from(new Set(checklistItems.filter((i) => i.flow === flow).map((i) => i.stage))),
    [checklistItems, flow]
  );
  const [stage, setStage] = useState(stages[0] || '');
  const [identifier, setIdentifier] = useState('');
  const [notes, setNotes] = useState('');
  const [results, setResults] = useState<ItemResult>({});
  const [loading, setLoading] = useState(false);
  const [expandedSignoff, setExpandedSignoff] = useState<string | null>(null);

  const stageItems = useMemo(
    () =>
      checklistItems
        .filter((i) => i.flow === flow && i.stage === stage)
        .sort((a, b) => a.sort_order - b.sort_order),
    [checklistItems, flow, stage]
  );

  function handleFlowChange(newFlow: string) {
    setFlow(newFlow);
    const firstStage = checklistItems.find((i) => i.flow === newFlow)?.stage || '';
    setStage(firstStage);
    setResults({});
  }

  function handleStageChange(newStage: string) {
    setStage(newStage);
    setResults({});
  }

  function setItemResult(itemId: string, result: QcResult) {
    setResults((prev) => ({ ...prev, [itemId]: { result, notes: prev[itemId]?.notes || '' } }));
  }

  function setItemNotes(itemId: string, notes: string) {
    setResults((prev) => ({ ...prev, [itemId]: { result: prev[itemId]?.result || 'na', notes } }));
  }

  const checkedCount = stageItems.filter((i) => results[i.id]?.result && results[i.id]?.result !== 'na').length;
  const failCount = stageItems.filter((i) => results[i.id]?.result === 'fail').length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: signoff, error } = await supabase
      .from('qaqc_signoffs')
      .insert({ site_id: siteId, flow, stage, identifier, notes, signed_off_by: user?.id })
      .select()
      .single();

    if (error || !signoff) {
      setLoading(false);
      return;
    }

    const rows = stageItems.map((item) => ({
      signoff_id: signoff.id,
      checklist_item_id: item.id,
      result: results[item.id]?.result || 'na',
      notes: results[item.id]?.notes || '',
    }));

    await supabase.from('qaqc_signoff_results').insert(rows);

    setLoading(false);
    setIdentifier('');
    setNotes('');
    setResults({});
    router.refresh();
  }

  async function deleteSignoff(id: string) {
    const supabase = createClient();
    await supabase.from('qaqc_signoffs').delete().eq('id', id);
    router.refresh();
  }

  const sortedSignoffs = [...signoffs].sort(
    (a, b) => new Date(b.signed_off_at).getTime() - new Date(a.signed_off_at).getTime()
  );

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-display text-base font-semibold mb-1">New QAQC signoff</h3>
        <p className="text-xs text-[var(--color-paper-dim)] mb-4">
          Select a flow and stage, tag the specific location, then work through the checklist.
        </p>

        <form onSubmit={handleSubmit} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                onChange={(e) => handleStageChange(e.target.value)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              >
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Location / identifier
              </label>
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Row 14, Pier B-12…"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
            <p className="text-xs text-[var(--color-paper-dim)] font-mono">
              {checkedCount}/{stageItems.length} checked
              {failCount > 0 && <span className="text-[var(--color-incident-bright)]"> · {failCount} failed</span>}
            </p>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {stageItems.map((item) => {
              const r = results[item.id]?.result;
              return (
                <div key={item.id} className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-snug flex-1">{item.item_text}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setItemResult(item.id, 'pass')}
                        title="Pass"
                        className={`rounded p-1 transition ${
                          r === 'pass' ? 'text-[var(--color-working-bright)]' : 'text-[var(--color-paper-dim)] hover:text-[var(--color-working-bright)]'
                        }`}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemResult(item.id, 'fail')}
                        title="Fail"
                        className={`rounded p-1 transition ${
                          r === 'fail' ? 'text-[var(--color-incident-bright)]' : 'text-[var(--color-paper-dim)] hover:text-[var(--color-incident-bright)]'
                        }`}
                      >
                        <XCircle size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemResult(item.id, 'na')}
                        title="N/A"
                        className={`rounded p-1 transition ${
                          r === 'na' || !r ? 'text-[var(--color-blocked)]' : 'text-[var(--color-paper-dim)] hover:text-[var(--color-blocked)]'
                        }`}
                      >
                        <MinusCircle size={18} />
                      </button>
                    </div>
                  </div>
                  {r === 'fail' && (
                    <input
                      value={results[item.id]?.notes || ''}
                      onChange={(e) => setItemNotes(item.id, e.target.value)}
                      placeholder="What's wrong / corrective action"
                      className="mt-2 w-full rounded border border-[var(--color-incident)]/40 bg-[var(--color-bg-card)] px-2 py-1 text-xs outline-none focus:border-[var(--color-incident)]"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
              Overall notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional summary notes for this signoff"
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-[var(--color-amber)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)] hover:brightness-105 disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Submit signoff'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-display text-base font-semibold mb-3">Signoff history</h3>
        {sortedSignoffs.length === 0 ? (
          <p className="text-sm text-[var(--color-paper-dim)] py-6 text-center border border-dashed border-[var(--color-border)] rounded-md">
            No QAQC signoffs recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {sortedSignoffs.map((s) => {
              const items = signoffResults.filter((r) => r.signoff_id === s.id);
              const fails = items.filter((r) => r.result === 'fail').length;
              const expanded = expandedSignoff === s.id;
              return (
                <div key={s.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
                  <button
                    onClick={() => setExpandedSignoff(expanded ? null : s.id)}
                    className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-[var(--color-bg)]/40 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {expanded ? <ChevronDown size={14} className="shrink-0 text-[var(--color-paper-dim)]" /> : <ChevronRight size={14} className="shrink-0 text-[var(--color-paper-dim)]" />}
                      <ClipboardCheck size={14} className="shrink-0 text-[var(--color-amber)]" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {s.flow} · {s.stage} · {s.identifier}
                        </p>
                        <p className="text-xs text-[var(--color-paper-dim)] font-mono">
                          {new Date(s.signed_off_at).toLocaleDateString()} · {items.length} items
                          {fails > 0 && <span className="text-[var(--color-incident-bright)]"> · {fails} failed</span>}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSignoff(s.id);
                        }}
                        className="shrink-0 text-[var(--color-paper-dim)] hover:text-[var(--color-incident-bright)]"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </button>
                  {expanded && (
                    <div className="border-t border-[var(--color-border)] p-3 space-y-1.5">
                      {s.notes && <p className="text-xs text-[var(--color-paper-dim)] mb-2 italic">{s.notes}</p>}
                      {items.map((r) => {
                        const item = checklistItems.find((i) => i.id === r.checklist_item_id);
                        return (
                          <div key={r.id} className="flex items-start justify-between gap-2 text-xs">
                            <span className="text-[var(--color-paper-dim)]">{item?.item_text || 'Unknown item'}</span>
                            <span
                              className={`shrink-0 font-mono ${
                                r.result === 'pass'
                                  ? 'text-[var(--color-working-bright)]'
                                  : r.result === 'fail'
                                  ? 'text-[var(--color-incident-bright)]'
                                  : 'text-[var(--color-blocked)]'
                              }`}
                            >
                              {r.result === 'na' ? 'N/A' : r.result.toUpperCase()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
