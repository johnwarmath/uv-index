import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import IncidentList from '@/components/IncidentList';
import type { SafetyIncident, Site } from '@/types';

export default async function IncidentsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const [{ data: incidents }, { data: sites }] = await Promise.all([
    supabase.from('safety_incidents').select('*').order('occurred_at', { ascending: false }),
    supabase.from('sites').select('id, name'),
  ]);

  const siteList = (sites ?? []) as Pick<Site, 'id' | 'name'>[];
  const siteMap = new Map(siteList.map((s) => [s.id, s.name]));
  const incidentList = ((incidents ?? []) as SafetyIncident[]).map((i) => ({
    ...i,
    site_name: siteMap.get(i.site_id) || 'Unknown site',
  }));

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-incident-bright)] mb-1">
          {incidentList.filter((i) => i.status === 'open' || i.status === 'investigating').length} open
        </p>
        <h1 className="font-display text-3xl font-semibold">Safety incidents</h1>
        <p className="text-sm text-[var(--color-paper-dim)] mt-1">Across all sites in your portfolio.</p>
      </div>

      <IncidentList
        incidents={incidentList}
        isAdmin={profile?.role === 'admin'}
        showSiteName
        siteNames={siteList}
      />
    </div>
  );
}
