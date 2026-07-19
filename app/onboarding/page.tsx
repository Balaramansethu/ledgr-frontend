'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CURRENCIES, type UserDto } from '@ledgr/shared';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { FullScreenLoader } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function OnboardingPage() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.onboarded) router.replace('/');
    else setName(user.name);
  }, [loading, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      await api.post('/users/me/complete-onboarding', { name, currencyCode: currency });
      const { user: updated } = await api.patch<{ user: UserDto }>('/users/me', { timezone: tz });
      setUser(updated);
      router.replace('/');
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user || user.onboarded) return <FullScreenLoader />;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-10">
      <div className="mb-8 text-center">
        <div className="font-serif text-4xl font-semibold text-ink">Welcome to Ledgr</div>
        <p className="mt-1 text-sm text-ink-muted">A couple of details to get you set up.</p>
      </div>
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-sheet border border-stroke bg-paper p-6"
      >
        <Field label="What should we call you?" required value={name} onChange={(e) => setName(e.target.value)} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Currency</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-11 w-full rounded-sm border border-stroke bg-paper px-3 text-ink outline-none focus:border-terracotta"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.displayName} ({c.symbol})
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" disabled={busy} className="mt-1">
          {busy ? 'Setting up…' : 'Start tracking'}
        </Button>
      </form>
    </div>
  );
}
