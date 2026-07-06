'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Trash2, MapPin, Lightbulb } from 'lucide-react';
import { LessonTypeBadge } from '@/components/Badges';
import PhotoCapture, { type PhotoCaptureResult } from '@/components/PhotoCapture';
import type { LessonLearned, LessonType } from '@/types';

export default function LessonsLearnedList({
  siteId,
  lessons,
  isAdmin,
  showSiteName = false,
  siteNames,
}: {
  siteId?: string;
  lessons: (LessonLearned & { site_name?: string })[];
  isAdmin: boolean;
  showSiteName?: boolean;
  siteNames?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<LessonType>('improvement_area');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [recommendation, setRecommendation] = useState('');
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
    await supabase.from('lessons_learned').insert({
      site_id: siteId || targetSite,
      title,
      type,
      category,
      description,
      recommendation,
      photo_url: photo.photo_url,
      latitude: photo.latitude,
      longitude: photo.longitude,
      created_by: user?.id,
    });
    setLoading(false);
    setTitle('');
    setDescription('');
    setRecommendation('');
    setType('improvement_area');
    setPhoto({ photo_url: null, latitude: null, longitude: null });
    setOpen(false);
    router.refresh();
  }

  async function deleteLesson(id: string) {
    const supabase = createClient();
    await supabase.from('lessons_learned').delete().eq('id', id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-semibold">Lessons learned</h3>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-card)] transition"
        >
          <Plus size={14} /> Log lesson
        </button>
      </div>

      {open && (
        <form
          onSubmit={handleAdd}
          className="mb-4 space-y-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3"
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
              placeholder="Racking delivery delayed a full week"
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
              Type
            </label>
            <div className="flex gap-2">
              {(['went_well', 'improvement_area'] as LessonType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded border px-3 py-1 text-xs font-medium transition ${
                    type === t
                      ? 'border-[var(--color-amber)] bg-[var(--color-amber)]/15 text-[var(--color-amber)]'
                      : 'border-[var(--color-border)] text-[var(--color-paper-dim)] hover:bg-[var(--color-bg)]'
                  }`}
                >
                  {t === 'went_well' ? 'Went well' : 'Improvement area'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Procurement / Design / Safety"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
              Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What happened and why"
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-amber)] resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
              Recommendation for next time
            </label>
            <textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              rows={2}
              placeholder="What to do differently on future projects"
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
              Save lesson
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

      {lessons.length === 0 ? (
        <p className="text-sm text-[var(--color-paper-dim)] py-6 text-center border border-dashed border-[var(--color-border)] rounded-md">
          No lessons logged yet. Capture what worked and what didn't for future projects.
        </p>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug flex items-center gap-1.5">
                    <Lightbulb size={13} className="text-[var(--color-amber)] shrink-0" />
                    {lesson.title}
                  </p>
                  <p className="text-xs text-[var(--color-paper-dim)] mt-0.5">
                    {showSiteName && lesson.site_name ? `${lesson.site_name} · ` : ''}
                    {lesson.category} · {new Date(lesson.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  {lesson.photo_url && (
                    <img
                      src={lesson.photo_url}
                      alt="Lesson photo"
                      className="h-12 w-12 rounded object-cover border border-[var(--color-border)]"
                    />
                  )}
                  <LessonTypeBadge type={lesson.type} />
                  {isAdmin && (
                    <button
                      onClick={() => deleteLesson(lesson.id)}
                      className="text-[var(--color-paper-dim)] hover:text-[var(--color-incident-bright)]"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              {lesson.description && <p className="text-xs text-[var(--color-paper-dim)] mb-1.5">{lesson.description}</p>}
              {lesson.recommendation && (
                <p className="text-xs text-[var(--color-paper)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-1.5 mb-1.5">
                  <span className="text-[var(--color-amber)] font-medium">Recommendation: </span>
                  {lesson.recommendation}
                </p>
              )}
              {lesson.latitude && lesson.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${lesson.latitude},${lesson.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[var(--color-amber)] hover:underline"
                >
                  <MapPin size={11} /> {lesson.latitude.toFixed(5)}, {lesson.longitude.toFixed(5)}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
