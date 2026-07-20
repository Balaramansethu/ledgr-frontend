'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { AvatarBubble } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth';

/**
 * Top header inside the content column. On desktop it carries the page title
 * and the primary "Add expense" action; on mobile it shows a compact bar with
 * the wordmark and a profile shortcut (the FAB lives in the bottom nav).
 */
export function Header({ title, actions, onAdd }: { title: string; actions?: ReactNode; onAdd: () => void }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 border-b border-stroke bg-canvas/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-3 px-4 lg:px-8">
        <span className="font-serif text-xl font-semibold text-ink lg:hidden">Ledgr</span>
        <h1 className="hidden text-lg font-bold text-ink lg:block">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          {actions}
          {/* <button
            type="button"
            onClick={onAdd}
            className="hidden h-10 items-center gap-2 rounded-sm bg-terracotta px-4 text-sm font-semibold text-white transition-colors hover:bg-terracotta-deep lg:inline-flex"
          >
            <Plus size={16} /> Add expense
          </button> */}
          <Link href="/settings" aria-label="Profile and settings" className="lg:hidden">
            <AvatarBubble name={user?.name || 'You'} size={36} />
          </Link>
        </div>
      </div>
    </header>
  );
}
