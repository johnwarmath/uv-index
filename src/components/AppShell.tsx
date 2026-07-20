'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Zap, ShieldAlert, MapPin, LogOut, ShieldCheck, Lightbulb } from 'lucide-react';
import type { Profile } from '@/types';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/sites', label: 'Sites', icon: MapPin },
  { href: '/incidents', label: 'Safety', icon: ShieldAlert },
  { href: '/lessons', label: 'Lessons', icon: Lightbulb },
];

export default function AppShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-raised)] flex-col">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-[var(--color-border)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-amber)]">
            <Zap size={16} className="text-[var(--color-bg)]" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Bolt Energy</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-[var(--color-bg-card)] text-[var(--color-paper)] font-medium'
                    : 'text-[var(--color-paper-dim)] hover:bg-[var(--color-bg-card)]/60 hover:text-[var(--color-paper)]'
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label === 'Safety' ? 'Safety incidents' : item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-working)] text-xs font-semibold font-display">
              {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile.full_name || profile.email}</p>
              <p className="flex items-center gap-1 text-xs text-[var(--color-paper-dim)]">
                {profile.role === 'admin' && <ShieldCheck size={11} className="text-[var(--color-amber)]" />}
                {profile.role === 'admin' ? 'Admin' : 'Standard user'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[var(--color-paper-dim)] hover:bg-[var(--color-bg-card)]/60 hover:text-[var(--color-paper)] transition"
          >
            <LogOut size={16} strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 border-b border-[var(--color-border)] bg-[var(--color-bg-raised)]/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-amber)]">
            <Zap size={14} className="text-[var(--color-bg)]" strokeWidth={2.5} />
          </div>
          <span className="font-display text-base font-semibold tracking-tight">Bolt Energy</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-working)] text-xs font-semibold font-display shrink-0"
          aria-label="Sign out"
        >
          {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
        </button>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch justify-around border-t border-[var(--color-border)] bg-[var(--color-bg-raised)]/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {nav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] transition ${
                active ? 'text-[var(--color-amber)]' : 'text-[var(--color-paper-dim)]'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 overflow-x-hidden pt-14 pb-16 md:pt-0 md:pb-0">{children}</main>
    </div>
  );
}
