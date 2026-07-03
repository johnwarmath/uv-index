import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import AppShell from '@/components/AppShell';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');

  return <AppShell profile={profile}>{children}</AppShell>;
}
