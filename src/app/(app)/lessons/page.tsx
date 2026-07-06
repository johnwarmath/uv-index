import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import LessonsLearnedList from '@/components/LessonsLearnedList';
import type { LessonLearned, Site } from '@/types';

export default async function LessonsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: lessons }, { data: sites }] = await Promise.all([
    supabase.from('lessons_learned').select('*').order('created_at', { ascending: false }),
    supabase.from('sites').select('id, name'),
  ]);

  const siteList = (sites ?? []) as Pick<Site, 'id' | 'name'>[];
  const siteMap = new Map(siteList.map((s) => [s.id, s.name]));
  const lessonList = ((lessons ?? []) as LessonLearned[]).map((l) => ({
    ...l,
    site_name: siteMap.get(l.site_id) || 'Unknown site',
  }));

  const wentWellCount = lessonList.filter((l) => l.type === 'went_well').length;
  const improvementCount = lessonList.filter((l) => l.type === 'improvement_area').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-amber)] mb-1">
          {wentWellCount} went well · {improvementCount} to improve
        </p>
        <h1 className="font-display text-3xl font-semibold">Lessons learned</h1>
        <p className="text-sm text-[var(--color-paper-dim)] mt-1">Across all sites in your portfolio.</p>
      </div>

      <LessonsLearnedList
        lessons={lessonList}
        isAdmin={profile?.role === 'admin'}
        showSiteName
        siteNames={siteList}
      />
    </div>
  );
}
