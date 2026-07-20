'use client';

import { Trash2 } from 'lucide-react';
import type { CustomCategoryDto, ExpenseDto } from '@ledgr/shared';
import { Icon } from '@/components/ui/icon';
import { useImageViewer } from '@/components/ui/image-viewer';
import { resolveCategory } from '@/lib/categories';
import { useCurrency } from '@/lib/format';

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** A single expense row — ports expense_tile.dart. */
export function ExpenseTile({
  expense,
  custom,
  onEdit,
  onDelete,
}: {
  expense: ExpenseDto;
  custom: CustomCategoryDto[];
  onEdit: (expense: ExpenseDto) => void;
  onDelete: (expense: ExpenseDto) => void;
}) {
  const { fmt } = useCurrency();
  const { view } = useImageViewer();
  const visual = resolveCategory(expense.category, expense.customCategoryKey, custom);

  return (
    <div className="group flex items-center gap-3 rounded-card px-2 py-2.5 transition-colors hover:bg-paper-warm">
      <button
        type="button"
        onClick={() => onEdit(expense)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm"
          style={{ backgroundColor: `${visual.color}24`, color: visual.color }}
        >
          <Icon name={visual.icon} size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">{expense.description}</span>
          <span className="block text-xs text-ink-soft">
            {visual.name} · {timeLabel(expense.createdAt)}
          </span>
        </span>
        <span className="shrink-0 font-serif text-base font-semibold text-ink tnum">
          {fmt(expense.amount)}
        </span>
      </button>
      {expense.imageUrl ? (
        <button
          type="button"
          onClick={() => view(expense.imageUrl!, expense.description)}
          aria-label="View receipt"
          title="View receipt"
          className="shrink-0 overflow-hidden rounded-sm border border-stroke transition-transform hover:scale-105"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={expense.imageUrl} alt="" className="h-9 w-9 object-cover" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onDelete(expense)}
        aria-label={`Delete ${expense.description}`}
        className="shrink-0 rounded-sm p-2 text-ink-soft opacity-0 transition-opacity hover:bg-canvas-alt hover:text-negative focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
