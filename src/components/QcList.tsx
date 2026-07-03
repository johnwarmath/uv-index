'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Trash2, MapPin } from 'lucide-react';
import { QcResultBadge } from '@/components/Badges';
import PhotoCapture, { type PhotoCaptureResult } from '@/components/PhotoCapture';
import type { QcInspection, QcResult } from '@/types';

export default function QcList({
  siteId,
  inspections,
  isAdmin,
}: {
  siteId: string;
  inspections: QcInspection[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [result, setResult] = useState<QcResult>('pass');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<PhotoCaptureResult>({ photo_url: null, latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('qc_inspections').insert({
      site_id: siteId,
      title,
      category,
      result,
      notes,
      photo_url: photo.photo_url,
      latitude: photo.latitude,
      longitude: photo.longitude,
      inspected_by: user?.id,
    });
    setLoading(false);
    setTitle('');
    setNotes('');
    setResult('pass');
    setPhoto({ photo_url: null, latitude: null, longitude: null });
    setOpen(false);
    router.refresh();
  }

  async function deleteInspection(id: string) {
    const supabase = createClient();
    await supabase.from('qc_inspections').delete().eq('id', id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-semibold">Quality control inspections</h3>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-card)] transition"
        >
          <Plus size={14} /> Log inspection
        </button>
      </div>

      {open && (
        <form
          onSubmit={handleAdd}
          className="mb-4 space-y-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Inspection item
              </label>
              <input
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Torque check — inverter pad 3"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Electrical / Mechanical / Civil"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
              Result
            </label>
            <div className="flex gap-2">
              {(['pass', 'fail', 'na'] as QcResult[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResult(r)}
                  className={`rounded border px-3 py-1 text-xs font-medium transition ${
                    result === r
                      ? 'border-[var(--color-amber)] bg-[var(--color-amber)]/15 text-[var(--color-amber)]'
                      : 'border-[var(--color-border)] text-[var(--color-paper-dim)] hover:bg-[var(--color-bg)]'
                  }`}
                >
                  {r === 'na' ? 'N/A' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes or corrective actions"
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)] resize-none"
            />
          </div>
          <PhotoCapture onChange={setPhoto} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-[var(--color-amber)] px-3 py-1.5 text-sm font-semibold text-[var(--color-bg)] hover:brightness-105 disabled:opacity-60"
            >
              Save inspection
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-paper-dim)] hover:bg-[var(--color-bg)]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {inspections.length === 0 ? (
        <p className="text-sm text-[var(--color-paper-dim)] py-6 text-center border border-dashed border-[var(--color-border)] rounded-md">
          No inspections logged yet.
        </p>
      ) : (
        <div className="space-y-2">
          {inspections.map((qc) => (
            <div key={qc.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{qc.title}</p>
                  <p className="text-xs text-[var(--color-paper-dim)] mt-0.5">
                    {qc.category} · {new Date(qc.inspected_at).toLocaleDateString()}
                  </p>
                  {qc.notes && <p className="text-xs text-[var(--color-paper-dim)] mt-1.5">{qc.notes}</p>}
                  {qc.latitude && qc.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${qc.latitude},${qc.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[var(--color-amber)] mt-1.5 hover:underline"
                    >
                      <MapPin size={11} /> {qc.latitude.toFixed(5)}, {qc.longitude.toFixed(5)}
                    </a>
                  )}
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  {qc.photo_url && (
                    <img
                      src={qc.photo_url}
                      alt="Inspection photo"
                      className="h-12 w-12 rounded object-cover border border-[var(--color-border)]"
                    />
                  )}
                  <QcResultBadge result={qc.result} />
                  {isAdmin && (
                    <button
                      onClick={() => deleteInspection(qc.id)}
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
  );
}
