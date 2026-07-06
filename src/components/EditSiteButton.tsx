'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Pencil, X } from 'lucide-react';
import type { Site, SiteStatus } from '@/types';

export default function EditSiteButton({ site }: { site: Site }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(site.name);
  const [location, setLocation] = useState(site.location);
  const [zipCode, setZipCode] = useState(site.zip_code);
  const [capacity, setCapacity] = useState(site.capacity_mw?.toString() ?? '');
  const [status, setStatus] = useState<SiteStatus>(site.status);
  const [targetDate, setTargetDate] = useState(site.target_completion ?? '');
  const [developer, setDeveloper] = useState(site.developer);
  const [epc, setEpc] = useState(site.epc);
  const [utility, setUtility] = useState(site.utility);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Site name is required.');
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('sites')
      .update({
        name,
        location,
        zip_code: zipCode,
        capacity_mw: capacity ? parseFloat(capacity) : null,
        status,
        target_completion: targetDate || null,
        developer,
        epc,
        utility,
      })
      .eq('id', site.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-card)] transition"
      >
        <Pencil size={13} /> Edit site
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-raised)]">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--color-border)]">
              <h2 className="font-display text-lg font-semibold">Edit site</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <Field label="Site name">
                <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Location">
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className="input" />
                </Field>
                <Field label="ZIP code (for weather)">
                  <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="input" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Capacity (MW)">
                  <input
                    type="number"
                    step="0.1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
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

              <div className="pt-2 border-t border-[var(--color-border)]">
                <p className="text-xs font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-3 pt-3">
                  Project parties
                </p>
                <div className="space-y-3">
                  <Field label="Developer">
                    <input
                      value={developer}
                      onChange={(e) => setDeveloper(e.target.value)}
                      placeholder="e.g. Lightsource bp"
                      className="input"
                    />
                  </Field>
                  <Field label="EPC">
                    <input
                      value={epc}
                      onChange={(e) => setEpc(e.target.value)}
                      placeholder="e.g. McCarthy Building Companies"
                      className="input"
                    />
                  </Field>
                  <Field label="Utility">
                    <input
                      value={utility}
                      onChange={(e) => setUtility(e.target.value)}
                      placeholder="e.g. Oncor Electric Delivery"
                      className="input"
                    />
                  </Field>
                </div>
              </div>

              {error && (
                <p className="text-sm text-[var(--color-incident-bright)] bg-[var(--color-incident)]/10 border border-[var(--color-incident)]/30 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-bg-card)] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-md bg-[var(--color-amber)] px-3 py-2 text-sm font-semibold text-[var(--color-bg)] hover:brightness-105 disabled:opacity-60 transition"
                >
                  {loading ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>

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
        </div>
      )}
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
