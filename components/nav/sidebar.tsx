'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Plus } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { AvatarBubble } from '@/components/ui/primitives';
import { PRIMARY_NAV, SECONDARY_NAV, isActive } from './nav-items';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';

/** Persistent desktop sidebar (≥lg). The mic FAB becomes a primary "Add" action. */
export function Sidebar({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-stroke bg-canvas px-4 py-5 lg:flex">
      <Link href="/" className="mb-6 px-2">
        <span className="font-serif text-2xl font-semibold text-ink">Ledgr</span>
      </Link>

      <button
        type="button"
        onClick={onAdd}
        className="mb-6 inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-terracotta font-semibold text-white transition-colors hover:bg-terracotta-deep"
      >
        <Plus size={18} /> Add expense
      </button>

      <nav className="flex flex-col gap-1">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        Manage
      </div>
      <nav className="flex flex-col gap-1">
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-card border border-stroke bg-paper p-3">
        <AvatarBubble name={user?.name || 'You'} size={38} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink">{user?.name || 'You'}</div>
          <div className="truncate text-xs text-ink-soft">{user?.email}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="rounded-sm p-2 text-ink-soft transition-colors hover:bg-canvas-alt hover:text-ink"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
}: {
  item: { href: string; label: string; icon: string };
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-sm px-3 py-2.5 text-[15px] font-medium transition-colors',
        active ? 'bg-orange-pale text-terracotta' : 'text-ink-muted hover:bg-canvas-alt hover:text-ink',
      )}
    >
      <Icon name={item.icon} size={20} />
      {item.label}
    </Link>
  );
}
