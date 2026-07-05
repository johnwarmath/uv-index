'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sun } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-amber)]">
            <Sun size={18} className="text-[var(--color-bg)]" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">UV Index</span>
        </div>

        <h1 className="font-display text-2xl font-semibold mb-1">Sign in</h1>
        <p className="text-[var(--color-paper-dim)] text-sm mb-8">
          Track progress, QC, and safety across your sites.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)]"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-incident-bright)] bg-[var(--color-incident)]/10 border border-[var(--color-incident)]/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--color-amber)] px-3 py-2.5 text-sm font-semibold text-[var(--color-bg)] hover:brightness-105 disabled:opacity-60 transition"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-paper-dim)]">
          No account?{' '}
          <Link href="/signup" className="text-[var(--color-amber)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
