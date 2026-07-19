'use client';

import { useState } from 'react';
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey, type CustomCategoryDto } from '@ledgr/shared';
import { Icon } from '@/components/ui/icon';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { resolveCategory } from '@/lib/categories';
import { useCategories } from '@/lib/queries';
import { cn } from '@/lib/cn';

export interface CategorySelection {
  category: CategoryKey;
  customKey: string | null;
}

/** A chip showing the current category that opens a picker. */
export function CategoryChip({
  value,
  onChange,
  className,
}: {
  value: CategorySelection;
  onChange: (value: CategorySelection) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: custom = [] } = useCategories();
  const visual = resolveCategory(value.category, value.customKey, custom);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-terracotta px-3 py-1.5 text-sm font-bold text-white',
          className,
        )}
      >
        <Icon name={visual.icon} size={14} />
        {visual.name}
      </button>
      <ResponsiveDialog open={open} onOpenChange={setOpen} title="Choose category">
        <CategoryGrid
          value={value}
          custom={custom}
          onPick={(sel) => {
            onChange(sel);
            setOpen(false);
          }}
        />
      </ResponsiveDialog>
    </>
  );
}

export function CategoryGrid({
  value,
  custom,
  onPick,
}: {
  value: CategorySelection;
  custom: CustomCategoryDto[];
  onPick: (value: CategorySelection) => void;
}) {
  const builtIn = CATEGORY_KEYS.map((key) => ({
    sel: { category: key, customKey: null } as CategorySelection,
    icon: CATEGORIES[key].icon,
    color: CATEGORIES[key].color,
    name: CATEGORIES[key].displayName,
  }));
  const customs = custom.map((c) => ({
    sel: { category: 'other' as CategoryKey, customKey: c.key },
    icon: c.icon,
    color: c.color,
    name: c.name,
  }));

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {[...builtIn, ...customs].map((item) => {
        const selected =
          item.sel.customKey === value.customKey &&
          (item.sel.customKey !== null || item.sel.category === value.category);
        return (
          <button
            key={item.sel.customKey ?? item.sel.category}
            type="button"
            onClick={() => onPick(item.sel)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-card border p-3 text-center transition-colors',
              selected ? 'border-terracotta bg-orange-pale' : 'border-stroke bg-paper hover:bg-paper-warm',
            )}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-sm"
              style={{ backgroundColor: `${item.color}24`, color: item.color }}
            >
              <Icon name={item.icon} size={20} />
            </span>
            <span className="line-clamp-1 text-xs font-semibold text-ink">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}
