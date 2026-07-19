'use client';

import { CATEGORIES, toCategoryKey } from '@ledgr/shared';
import { Icon } from '@/components/ui/icon';
import { PaperCard } from '@/components/ui/primitives';
import { useCurrency } from '@/lib/format';

/** Per-category spend card with a colored progress bar — ports _CategoryProgressCard. */
export function CategoryProgressCard({
  categoryKey,
  amount,
  total,
}: {
  categoryKey: string;
  amount: number;
  total: number;
}) {
  const { fmt } = useCurrency();
  const def = CATEGORIES[toCategoryKey(categoryKey)];
  const pct = total > 0 ? amount / total : 0;

  return (
    <PaperCard className="p-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-sm"
          style={{ backgroundColor: `${def.color}24`, color: def.color }}
        >
          <Icon name={def.icon} size={20} />
        </span>
        <div className="flex-1">
          <div className="font-bold text-ink">{def.displayName}</div>
          <div className="text-xs text-ink-soft">
            Spent {fmt(amount, { compact: true })} of {fmt(total, { compact: true })}
          </div>
        </div>
        <div className="font-bold text-terracotta tnum">{Math.round(pct * 100)}%</div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-orange-pale">
        <div
          className="h-full rounded-full transition-[width]"
          style={{
            width: `${Math.min(100, pct * 100)}%`,
            backgroundImage: `linear-gradient(90deg, ${def.color}b3, ${def.color})`,
          }}
        />
      </div>
    </PaperCard>
  );
}
