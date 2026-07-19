'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/** Registers the service worker and shows an offline banner. */
export function PwaBoot() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
    setOffline(!navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-2 bg-ink px-4 py-1.5 text-xs font-medium text-canvas">
      <WifiOff size={13} />
      You&apos;re offline — showing saved data. Changes will save when you reconnect.
    </div>
  );
}
