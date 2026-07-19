'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { PRIMARY_NAV, isActive } from './nav-items';
import { cn } from '@/lib/cn';

/**
 * Mobile bottom navigation (<lg) — mirrors the Flutter nav_shell: a paper bar
 * with a notch for the center action button. The mic FAB becomes "Add".
 */
export function BottomNav({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();
  const [a, b, c, d] = PRIMARY_NAV;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-3 lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="relative mx-auto flex h-[60px] max-w-md items-center rounded-2xl border border-stroke bg-paper">
        <Tab item={a!} active={isActive(pathname, a!.href)} />
        <Tab item={b!} active={isActive(pathname, b!.href)} />
        <div className="w-16 shrink-0" aria-hidden />
        <Tab item={c!} active={isActive(pathname, c!.href)} />
        <Tab item={d!} active={isActive(pathname, d!.href)} />

        <button
          type="button"
          onClick={onAdd}
          aria-label="Add expense"
          className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-[10px] items-center justify-center rounded-full border-4 border-canvas bg-terracotta text-white shadow-sm transition-colors hover:bg-terracotta-deep"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}

function Tab({
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
        'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold',
        active ? 'text-terracotta' : 'text-ink-muted',
      )}
    >
      <Icon name={item.icon} size={22} />
      {item.label}
      <span className={cn('mt-0.5 h-0.5 rounded-full bg-terracotta transition-all', active ? 'w-4' : 'w-0')} />
    </Link>
  );
}
