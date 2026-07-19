'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { CategoryKey } from '@ledgr/shared';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { AvatarBubble } from '@/components/ui/primitives';
import { useCreateExpense, usePeople, useReplaceSplits } from '@/lib/queries';
import { useCurrency } from '@/lib/format';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  category: CategoryKey;
  customKey?: string | null;
  /** When set, splits are attached to this existing expense; otherwise one is created. */
  existingExpenseId?: string;
  onSaved?: () => void;
}

/** Split an expense across people — ports split_sheet. */
export function SplitDialog({
  open,
  onOpenChange,
  amount,
  description,
  category,
  customKey,
  existingExpenseId,
  onSaved,
}: Props) {
  const { data: people = [] } = usePeople();
  const { symbol, fmt } = useCurrency();
  const createExpense = useCreateExpense();
  const replaceSplits = useReplaceSplits();
  const [shares, setShares] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const assigned = useMemo(
    () => Object.values(shares).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [shares],
  );
  const yourPart = Math.max(0, amount - assigned);
  const overAssigned = assigned > amount + 0.001;

  async function handleSave() {
    const splits = Object.entries(shares)
      .map(([personId, v]) => ({ personId, splitAmount: Number(v) || 0 }))
      .filter((s) => s.splitAmount > 0);
    if (splits.length === 0 || overAssigned) return;

    setBusy(true);
    try {
      let expenseId = existingExpenseId;
      if (!expenseId) {
        const expense = await createExpense.mutateAsync({
          amount,
          description,
          category,
          customCategoryKey: customKey ?? null,
          createdAt: new Date().toISOString(),
        });
        expenseId = expense.id;
      }
      await replaceSplits.mutateAsync({
        expenseId,
        totalAmount: amount,
        description,
        category,
        customCategoryKey: customKey ?? null,
        splits,
      });
      onSaved?.();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Split expense">
      <div className="mb-4 rounded-card border border-stroke bg-paper p-4">
        <div className="text-sm text-ink-muted">{description}</div>
        <div className="text-2xl font-serif font-semibold text-ink tnum">{fmt(amount)}</div>
      </div>

      {people.length === 0 ? (
        <div className="rounded-card border border-stroke bg-paper p-6 text-center">
          <p className="text-sm text-ink-muted">Add people first to split with them.</p>
          <Link href="/people" className="mt-2 inline-block text-sm font-semibold text-terracotta">
            Manage people →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {people.map((person) => (
            <div key={person.id} className="flex items-center gap-3">
              <AvatarBubble name={person.name} size={36} />
              <span className="flex-1 font-medium text-ink">{person.name}</span>
              <div className="flex items-center gap-1 rounded-sm border border-stroke bg-paper px-2">
                <span className="text-ink-soft">{symbol}</span>
                <input
                  inputMode="decimal"
                  value={shares[person.id] ?? ''}
                  onChange={(e) =>
                    setShares((s) => ({ ...s, [person.id]: e.target.value.replace(/[^0-9.]/g, '') }))
                  }
                  placeholder="0"
                  className="h-10 w-20 bg-transparent text-right tnum outline-none"
                />
              </div>
            </div>
          ))}

          <div className="mt-2 flex items-center justify-between rounded-card bg-orange-pale px-4 py-3">
            <span className="text-sm font-semibold text-terracotta-deep">Your part</span>
            <span className="font-serif text-lg font-semibold text-terracotta-deep tnum">
              {fmt(yourPart)}
            </span>
          </div>
          {overAssigned ? (
            <p className="text-sm text-negative">Splits add up to more than the total.</p>
          ) : null}

          <Button className="mt-2 w-full" disabled={busy || assigned <= 0 || overAssigned} onClick={handleSave}>
            {busy ? 'Saving…' : 'Save split'}
          </Button>
        </div>
      )}
    </ResponsiveDialog>
  );
}
