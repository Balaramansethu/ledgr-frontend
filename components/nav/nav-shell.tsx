'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';
import { Header } from './header';
import { PRIMARY_NAV, SECONDARY_NAV } from './nav-items';
import { useAddExpense } from '@/components/add-expense/add-expense-context';

function titleForPath(pathname: string): string {
  const all = [...PRIMARY_NAV, ...SECONDARY_NAV];
  if (pathname === '/') return 'Home';
  const match = all.find((n) => n.href !== '/' && pathname.startsWith(n.href));
  return match?.label ?? 'Ledgr';
}

/** App frame: sidebar + header on desktop, bottom nav + FAB on mobile. */
export function NavShell({ children, headerActions }: { children: ReactNode; headerActions?: ReactNode }) {
  const pathname = usePathname();
  const { open } = useAddExpense();

  return (
    <div className="flex min-h-dvh">
      <Sidebar onAdd={open} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={titleForPath(pathname)} actions={headerActions} onAdd={open} />
        <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-28 pt-4 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <BottomNav onAdd={open} />
    </div>
  );
}
