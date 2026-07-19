'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth';
import { ThemeProvider, useTheme } from './theme';
import { ToastProvider } from '@/components/ui/toast';

/** Keep the applied theme in sync with the signed-in user's saved preference. */
function ThemeSync() {
  const { user } = useAuth();
  const { setMode, mode } = useTheme();
  useEffect(() => {
    if (user && user.settings.themeMode !== mode) {
      setMode(user.settings.themeMode);
    }
    // Only react to the user's saved theme changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.settings.themeMode]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <AuthProvider>
          <ThemeSync />
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
