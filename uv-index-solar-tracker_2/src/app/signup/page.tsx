'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Sun } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-2xl font-semibold mb-2">Check your email</h1>
          <p className="text-[var(--color-paper-dim)] text-sm">
            We sent a confirmation link to <span className="text-[var(--color-paper)]">{email}</span>.
            Confirm your address, then sign in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-[var(--color-amber)] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
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

        <h1 className="font-display text-2xl font-semibold mb-1">Create account</h1>
        <p className="text-[var(--color-paper-dim)] text-sm mb-8">
          The first person to sign up becomes the site admin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1.5">
              Full name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)]"
              placeholder="Jordan Reyes"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-amber)] focus:ring-1 focus:ring-[var(--color-amber)]"
              placeholder="At least 6 characters"
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
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-paper-dim)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--color-amber)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
