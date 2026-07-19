'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { NavShell } from '@/components/nav/nav-shell';
import { AddExpenseProvider } from '@/components/add-expense/add-expense-context';
import { PwaBoot } from '@/components/pwa/pwa-boot';
import { FullScreenLoader } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (!user.onboarded) router.replace('/onboarding');
  }, [loading, user, router]);

  // Auto-log any due recurring expenses once per session (ports the launch pass).
  useEffect(() => {
    if (user && !processed.current) {
      processed.current = true;
      api.post('/recurring/process').catch(() => undefined);
    }
  }, [user]);

  if (loading || !user || !user.onboarded) return <FullScreenLoader />;

  return (
    <AddExpenseProvider>
      <PwaBoot />
      <NavShell>{children}</NavShell>
    </AddExpenseProvider>
  );
}
