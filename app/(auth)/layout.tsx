import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-10">
      <div className="mb-8 text-center">
        <div className="font-serif text-4xl font-semibold text-ink">Ledgr</div>
        <p className="mt-1 text-sm text-ink-muted">Your ledger, your data.</p>
      </div>
      <div className="w-full max-w-sm rounded-sheet border border-stroke bg-paper p-6">{children}</div>
    </div>
  );
}
