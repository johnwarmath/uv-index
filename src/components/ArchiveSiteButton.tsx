'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Archive, ArchiveRestore } from 'lucide-react';

export default function ArchiveSiteButton({ siteId, archived }: { siteId: string; archived: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function toggleArchive() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from('sites').update({ archived: !archived }).eq('id', siteId);
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (archived) {
    return (
      <button
        onClick={toggleArchive}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-working)]/50 text-[var(--color-working-bright)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-working)]/10 transition disabled:opacity-60"
      >
        <ArchiveRestore size={13} /> {loading ? 'Restoring…' : 'Restore site'}
      </button>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-paper-dim)]">Archive this site?</span>
        <button
          onClick={toggleArchive}
          disabled={loading}
          className="rounded border border-[var(--color-amber)] text-[var(--color-amber)] px-2.5 py-1 text-xs font-medium hover:bg-[var(--color-amber)]/10 transition disabled:opacity-60"
        >
          {loading ? 'Archiving…' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-paper-dim)] hover:bg-[var(--color-bg-card)] transition"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-paper-dim)] hover:bg-[var(--color-bg-card)] transition"
    >
      <Archive size={13} /> Archive site
    </button>
  );
}
