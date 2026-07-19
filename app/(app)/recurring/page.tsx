'use client';

import { useState } from 'react';
import { Pencil, Plus, Repeat, Trash2 } from 'lucide-react';
import type { RecurringDto } from '@ledgr/shared';
import { Icon } from '@/components/ui/icon';
import { PaperCard } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { RecurringForm } from '@/components/recurring/recurring-form';
import { useCategories, useDeleteRecurring, useRecurring, useUpdateRecurring } from '@/lib/queries';
import { resolveCategory } from '@/lib/categories';
import { useCurrency } from '@/lib/format';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
}

export default function RecurringPage() {
  const { data: rules = [], isLoading } = useRecurring();
  const { data: custom = [] } = useCategories();
  const { fmt } = useCurrency();
  const del = useDeleteRecurring();
  const update = useUpdateRecurring();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringDto | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-ink lg:hidden">Recurring</h1>
        <Button
          className="ml-auto"
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} /> New rule
        </Button>
      </div>

      <p className="text-sm text-ink-muted">
        Recurring bills are logged automatically each month on their due day.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : rules.length === 0 ? (
        <PaperCard className="flex flex-col items-center gap-2 p-8 text-center">
          <Repeat size={36} className="text-terracotta" />
          <p className="font-semibold text-ink">No recurring bills yet</p>
          <p className="text-sm text-ink-muted">Add rent, subscriptions, or any monthly bill.</p>
        </PaperCard>
      ) : (
        <div className="flex flex-col gap-2">
          {rules.map((rule) => {
            const visual = resolveCategory(rule.category, rule.customCategoryKey, custom);
            return (
              <PaperCard key={rule.id} className="flex items-center gap-3 p-4">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-sm"
                  style={{ backgroundColor: `${visual.color}24`, color: visual.color }}
                >
                  <Icon name={visual.icon} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">{rule.description}</div>
                  <div className="text-xs text-ink-soft">
                    {fmt(rule.amount)} · {ordinal(rule.dayOfMonth)} of each month
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => update.mutate({ id: rule.id, isActive: !rule.isActive })}
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    rule.isActive ? 'bg-positive/12 text-positive' : 'bg-canvas-alt text-ink-soft'
                  }`}
                >
                  {rule.isActive ? 'Active' : 'Paused'}
                </button>
                <button
                  type="button"
                  aria-label="Edit"
                  onClick={() => {
                    setEditing(rule);
                    setFormOpen(true);
                  }}
                  className="rounded-sm p-2 text-ink-soft hover:bg-canvas-alt hover:text-ink"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={() => del.mutate(rule.id)}
                  className="rounded-sm p-2 text-ink-soft hover:bg-canvas-alt hover:text-negative"
                >
                  <Trash2 size={16} />
                </button>
              </PaperCard>
            );
          })}
        </div>
      )}

      <RecurringForm open={formOpen} onOpenChange={setFormOpen} initial={editing} />
    </div>
  );
}
