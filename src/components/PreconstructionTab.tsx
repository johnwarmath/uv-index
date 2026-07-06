'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Sparkles, Pencil, Check } from 'lucide-react';
import type { Site, Exhibit, ExhibitStatus, Lntp, LntpStatus } from '@/types';

export default function PreconstructionTab({
  site,
  exhibits,
  lntps,
  isAdmin,
}: {
  site: Site;
  exhibits: Exhibit[];
  lntps: Lntp[];
  isAdmin: boolean;
}) {
  const router = useRouter();

  // ---- Developer / Utility context ----
  const [editingContext, setEditingContext] = useState(false);
  const [developer, setDeveloper] = useState(site.developer);
  const [utility, setUtility] = useState(site.utility);
  const [savingContext, setSavingContext] = useState(false);

  async function saveContext() {
    setSavingContext(true);
    const supabase = createClient();
    await supabase.from('sites').update({ developer, utility }).eq('id', site.id);
    setSavingContext(false);
    setEditingContext(false);
    router.refresh();
  }

  // ---- Exhibits ----
  const [exhibitOpen, setExhibitOpen] = useState(false);
  const [exhibitName, setExhibitName] = useState('');
  const [exhibitType, setExhibitType] = useState('general');
  const [exhibitDate, setExhibitDate] = useState('');
  const [exhibitLoading, setExhibitLoading] = useState(false);

  async function addExhibit(e: React.FormEvent) {
    e.preventDefault();
    setExhibitLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('exhibits').insert({
      site_id: site.id,
      name: exhibitName,
      type: exhibitType,
      target_date: exhibitDate || null,
      created_by: user?.id,
    });
    setExhibitLoading(false);
    setExhibitName('');
    setExhibitType('general');
    setExhibitDate('');
    setExhibitOpen(false);
    router.refresh();
  }

  async function updateExhibitStatus(id: string, status: ExhibitStatus) {
    const supabase = createClient();
    await supabase.from('exhibits').update({ status }).eq('id', id);
    router.refresh();
  }

  async function deleteExhibit(id: string) {
    const supabase = createClient();
    await supabase.from('exhibits').delete().eq('id', id);
    router.refresh();
  }

  // ---- LNTPs ----
  const [lntpOpen, setLntpOpen] = useState(false);
  const [lntpDescription, setLntpDescription] = useState('');
  const [lntpScope, setLntpScope] = useState('');
  const [lntpDate, setLntpDate] = useState('');
  const [lntpLoading, setLntpLoading] = useState(false);

  async function addLntp(e: React.FormEvent) {
    e.preventDefault();
    setLntpLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('lntps').insert({
      site_id: site.id,
      description: lntpDescription,
      scope: lntpScope,
      date_issued: lntpDate || null,
      created_by: user?.id,
    });
    setLntpLoading(false);
    setLntpDescription('');
    setLntpScope('');
    setLntpDate('');
    setLntpOpen(false);
    router.refresh();
  }

  async function updateLntpStatus(id: string, status: LntpStatus) {
    const supabase = createClient();
    await supabase.from('lntps').update({ status }).eq('id', id);
    router.refresh();
  }

  async function deleteLntp(id: string) {
    const supabase = createClient();
    await supabase.from('lntps').delete().eq('id', id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Developer / Utility context */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold">Project context</h3>
          {!editingContext && (
            <button
              onClick={() => setEditingContext(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-card)] transition"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
        </div>
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
          {editingContext ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                  Developer
                </label>
                <input
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  placeholder="e.g. Lightsource bp"
                  className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                  Utility
                </label>
                <input
                  value={utility}
                  onChange={(e) => setUtility(e.target.value)}
                  placeholder="e.g. Oncor Electric Delivery"
                  className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
                />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <button
                  onClick={saveContext}
                  disabled={savingContext}
                  className="inline-flex items-center gap-1.5 rounded bg-[var(--color-amber)] px-3 py-1.5 text-sm font-semibold text-[var(--color-bg)] hover:brightness-105 disabled:opacity-60"
                >
                  <Check size={14} /> {savingContext ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setDeveloper(site.developer);
                    setUtility(site.utility);
                    setEditingContext(false);
                  }}
                  className="rounded border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-paper-dim)] hover:bg-[var(--color-bg)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                  Location
                </p>
                <p>{site.location || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                  Developer
                </p>
                <p>{site.developer || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                  Utility
                </p>
                <p>{site.utility || '—'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI guidance placeholder */}
      <div className="rounded-md border border-dashed border-[var(--color-amber)]/40 bg-[var(--color-amber)]/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="text-[var(--color-amber)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">AI-generated guidance — coming soon</p>
            <p className="text-xs text-[var(--color-paper-dim)]">
              Once connected, this will suggest a typical Exhibit/LNTP checklist and answer questions
              using this site&apos;s location ({site.location || 'not set'}), developer ({site.developer || 'not set'}),
              and utility ({site.utility || 'not set'}) as context.
            </p>
          </div>
        </div>
      </div>

      {/* Exhibits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-semibold">Exhibits</h3>
          <button
            onClick={() => setExhibitOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-card)] transition"
          >
            <Plus size={14} /> Add exhibit
          </button>
        </div>

        {exhibitOpen && (
          <form
            onSubmit={addExhibit}
            className="mb-4 space-y-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                  Exhibit name
                </label>
                <input
                  required
                  autoFocus
                  value={exhibitName}
                  onChange={(e) => setExhibitName(e.target.value)}
                  placeholder="Exhibit A — Scope of Work"
                  className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                  Type
                </label>
                <input
                  value={exhibitType}
                  onChange={(e) => setExhibitType(e.target.value)}
                  placeholder="EPC / Interconnection / PPA"
                  className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Target / execution date
              </label>
              <input
                type="date"
                value={exhibitDate}
                onChange={(e) => setExhibitDate(e.target.value)}
                className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={exhibitLoading}
                className="rounded bg-[var(--color-amber)] px-3 py-1.5 text-sm font-semibold text-[var(--color-bg)] hover:brightness-105 disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setExhibitOpen(false)}
                className="rounded border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-paper-dim)] hover:bg-[var(--color-bg)]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {exhibits.length === 0 ? (
          <p className="text-sm text-[var(--color-paper-dim)] py-6 text-center border border-dashed border-[var(--color-border)] rounded-md">
            No exhibits tracked yet.
          </p>
        ) : (
          <div className="space-y-2">
            {exhibits.map((ex) => (
              <div key={ex.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{ex.name}</p>
                    <p className="text-xs text-[var(--color-paper-dim)] mt-0.5">
                      {ex.type}
                      {ex.target_date && ` · Target ${new Date(ex.target_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={ex.status}
                      onChange={(e) => updateExhibitStatus(ex.id, e.target.value as ExhibitStatus)}
                      className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs outline-none"
                    >
                      <option value="not_started">Not started</option>
                      <option value="drafted">Drafted</option>
                      <option value="executed">Executed</option>
                    </select>
                    {isAdmin && (
                      <button
                        onClick={() => deleteExhibit(ex.id)}
                        className="text-[var(--color-paper-dim)] hover:text-[var(--color-incident-bright)]"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LNTPs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-semibold">Limited Notices to Proceed</h3>
          <button
            onClick={() => setLntpOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-card)] transition"
          >
            <Plus size={14} /> Add LNTP
          </button>
        </div>

        {lntpOpen && (
          <form
            onSubmit={addLntp}
            className="mb-4 space-y-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3"
          >
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Description
              </label>
              <input
                required
                autoFocus
                value={lntpDescription}
                onChange={(e) => setLntpDescription(e.target.value)}
                placeholder="LNTP #1 — Site mobilization and grading"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Scope covered
              </label>
              <textarea
                value={lntpScope}
                onChange={(e) => setLntpScope(e.target.value)}
                rows={2}
                placeholder="What work this LNTP authorizes"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)] resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Date issued
              </label>
              <input
                type="date"
                value={lntpDate}
                onChange={(e) => setLntpDate(e.target.value)}
                className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={lntpLoading}
                className="rounded bg-[var(--color-amber)] px-3 py-1.5 text-sm font-semibold text-[var(--color-bg)] hover:brightness-105 disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setLntpOpen(false)}
                className="rounded border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-paper-dim)] hover:bg-[var(--color-bg)]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {lntps.length === 0 ? (
          <p className="text-sm text-[var(--color-paper-dim)] py-6 text-center border border-dashed border-[var(--color-border)] rounded-md">
            No LNTPs tracked yet.
          </p>
        ) : (
          <div className="space-y-2">
            {lntps.map((l) => (
              <div key={l.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{l.description}</p>
                    <p className="text-xs text-[var(--color-paper-dim)] mt-0.5">
                      {l.date_issued ? `Issued ${new Date(l.date_issued).toLocaleDateString()}` : 'Not yet issued'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={l.status}
                      onChange={(e) => updateLntpStatus(l.id, e.target.value as LntpStatus)}
                      className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="issued">Issued</option>
                      <option value="complete">Complete</option>
                    </select>
                    {isAdmin && (
                      <button
                        onClick={() => deleteLntp(l.id)}
                        className="text-[var(--color-paper-dim)] hover:text-[var(--color-incident-bright)]"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {l.scope && <p className="text-xs text-[var(--color-paper-dim)]">{l.scope}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
