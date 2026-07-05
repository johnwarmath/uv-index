'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, X } from 'lucide-react';
import type { SiteStatus } from '@/types';

export default function NewSiteButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState<SiteStatus>('planning');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('sites').insert({
      name,
      location,
      capacity_mw: capacity ? parseFloat(capacity) : null,
      status,
      target_completion: targetDate || null,
      created_by: user?.id,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
    setName('');
    setLocation('');
    setCapacity('');
    setTargetDate('');
    setStatus('planning');
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
          <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold">New solar site</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Site name">
                <input
                  required
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
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SiteStatus)}
                    className="input"
                  >
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
                  {loading ? 'Creating…' : 'Create site'}
                </button>
              </div>
            </form>
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
