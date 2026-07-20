'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, PanelLeftClose, PanelLeftOpen, Plus } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { AvatarBubble } from '@/components/ui/primitives';
import { PRIMARY_NAV, SECONDARY_NAV, isActive } from './nav-items';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/cn';

const STORAGE_KEY = 'ledgr-sidebar-collapsed';

/** Persistent desktop sidebar (≥lg) with a shadcn-style collapse toggle. */
export function Sidebar({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === '1');
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-stroke bg-canvas py-5 transition-[width] duration-200 lg:flex',
        collapsed ? 'w-16 px-2' : 'w-64 px-4',
      )}
    >
      {/* Header: wordmark + collapse toggle (top-right when expanded) */}
      <div className={cn('mb-6 flex items-center', collapsed ? 'justify-center' : 'justify-between px-2')}>
        {!collapsed ? (
          <Link href="/">
            <span className="font-serif text-2xl font-semibold text-ink">Ledgr</span>
          </Link>
        ) : null}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-canvas-alt hover:text-ink"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <button
        type="button"
        onClick={onAdd}
        aria-label="Add expense"
        title="Add expense"
        className={cn(
          'mb-6 inline-flex items-center justify-center gap-2 rounded-sm bg-terracotta font-semibold text-white transition-colors hover:bg-terracotta-deep',
          collapsed ? 'h-10 w-10 self-center' : 'h-11',
        )}
      >
        <Plus size={18} />
        {!collapsed ? 'Add expense' : null}
      </button>

      <nav className="flex flex-col gap-1">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} collapsed={collapsed} />
        ))}
      </nav>

      {collapsed ? (
        <div className="mx-auto my-3 h-px w-8 bg-stroke" />
      ) : (
        <div className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Manage
        </div>
      )}

      <nav className="flex flex-col gap-1">
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} collapsed={collapsed} />
        ))}
      </nav>

      {/* Profile / logout */}
      <div
        className={cn(
          'mt-auto',
          collapsed
            ? 'flex flex-col items-center gap-2'
            : 'flex items-center gap-3 rounded-card border border-stroke bg-paper p-3',
        )}
      >
        <Link href="/settings" aria-label="Profile and settings" title={user?.name || 'You'}>
          <AvatarBubble name={user?.name || 'You'} size={collapsed ? 34 : 38} />
        </Link>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">{user?.name || 'You'}</div>
            <div className="truncate text-xs text-ink-soft">{user?.email}</div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
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
  collapsed,
}: {
  item: { href: string; label: string; icon: string };
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center rounded-sm text-[15px] font-medium transition-colors',
        collapsed ? 'h-10 w-10 justify-center self-center' : 'gap-3 px-3 py-2.5',
        active ? 'bg-orange-pale text-terracotta' : 'text-ink-muted hover:bg-canvas-alt hover:text-ink',
      )}
    >
      <Icon name={item.icon} size={20} />
      {!collapsed ? item.label : null}
    </Link>
  );
}
