'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Trash2, MapPin } from 'lucide-react';
import { IncidentSeverityBadge, IncidentStatusBadge } from '@/components/Badges';
import PhotoCapture, { type PhotoCaptureResult } from '@/components/PhotoCapture';
import type { SafetyIncident, IncidentSeverity, IncidentStatus } from '@/types';

export default function IncidentList({
  siteId,
  incidents,
  isAdmin,
  showSiteName = false,
  siteNames,
}: {
  siteId?: string;
  incidents: (SafetyIncident & { site_name?: string })[];
  isAdmin: boolean;
  showSiteName?: boolean;
  siteNames?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('minor');
  const [locationDetail, setLocationDetail] = useState('');
  const [targetSite, setTargetSite] = useState(siteId || siteNames?.[0]?.id || '');
  const [photo, setPhoto] = useState<PhotoCaptureResult>({ photo_url: null, latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('safety_incidents').insert({
      site_id: siteId || targetSite,
      title,
      description,
      severity,
      location_detail: locationDetail,
      photo_url: photo.photo_url,
      latitude: photo.latitude,
      longitude: photo.longitude,
      reported_by: user?.id,
    });
    setLoading(false);
    setTitle('');
    setDescription('');
    setLocationDetail('');
    setSeverity('minor');
    setPhoto({ photo_url: null, latitude: null, longitude: null });
    setOpen(false);
    router.refresh();
  }

  async function updateStatus(id: string, status: IncidentStatus) {
    const supabase = createClient();
    await supabase
      .from('safety_incidents')
      .update({ status, resolved_at: status === 'resolved' || status === 'closed' ? new Date().toISOString() : null })
      .eq('id', id);
    router.refresh();
  }

  async function deleteIncident(id: string) {
    const supabase = createClient();
    await supabase.from('safety_incidents').delete().eq('id', id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-semibold">Safety incidents</h3>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-incident)]/50 text-[var(--color-incident-bright)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-incident)]/10 transition"
        >
          <Plus size={14} /> Report incident
        </button>
      </div>

      {open && (
        <form
          onSubmit={handleAdd}
          className="mb-4 space-y-3 rounded-md border border-[var(--color-incident)]/40 bg-[var(--color-bg-card)] p-3"
        >
          {!siteId && siteNames && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Site
              </label>
              <select
                value={targetSite}
                onChange={(e) => setTargetSite(e.target.value)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              >
                {siteNames.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
              What happened
            </label>
            <input
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Worker slipped near trench — Block B"
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
              Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What happened, who was involved, immediate actions taken"
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Location detail
              </label>
              <input
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="Near inverter station 4"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              >
                <option value="near_miss">Near miss</option>
                <option value="minor">Minor</option>
                <option value="serious">Serious</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <PhotoCapture onChange={setPhoto} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-[var(--color-incident)] px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
            >
              Submit report
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

      {incidents.length === 0 ? (
        <p className="text-sm text-[var(--color-paper-dim)] py-6 text-center border border-dashed border-[var(--color-border)] rounded-md">
          No incidents reported.
        </p>
      ) : (
        <div className="space-y-2">
          {incidents.map((inc) => (
            <div key={inc.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{inc.title}</p>
                  <p className="text-xs text-[var(--color-paper-dim)] mt-0.5 font-mono">
                    {showSiteName && inc.site_name ? `${inc.site_name} · ` : ''}
                    {new Date(inc.occurred_at).toLocaleDateString()}
                    {inc.location_detail ? ` · ${inc.location_detail}` : ''}
                  </p>
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  {inc.photo_url && (
                    <img
                      src={inc.photo_url}
                      alt="Incident photo"
                      className="h-12 w-12 rounded object-cover border border-[var(--color-border)]"
                    />
                  )}
                  <IncidentSeverityBadge severity={inc.severity} />
                  {isAdmin && (
                    <button
                      onClick={() => deleteIncident(inc.id)}
                      className="text-[var(--color-paper-dim)] hover:text-[var(--color-incident-bright)]"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              {inc.description && <p className="text-xs text-[var(--color-paper-dim)] mb-2">{inc.description}</p>}
              {inc.latitude && inc.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${inc.latitude},${inc.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[var(--color-amber)] mb-2 hover:underline"
                >
                  <MapPin size={11} /> {inc.latitude.toFixed(5)}, {inc.longitude.toFixed(5)}
                </a>
              )}
              <div>
                <select
                  value={inc.status}
                  onChange={(e) => updateStatus(inc.id, e.target.value as IncidentStatus)}
                  className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs outline-none"
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
