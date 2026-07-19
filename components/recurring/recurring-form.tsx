'use client';

import { useEffect, useState } from 'react';
import { formatAmount, formatAmountInput, parseAmount, type RecurringDto } from '@ledgr/shared';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { CategoryChip, type CategorySelection } from '@/components/category/category-select';
import { useAddRecurring, useUpdateRecurring } from '@/lib/queries';
import { useCurrency } from '@/lib/format';

export function RecurringForm({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: RecurringDto | null;
}) {
  const { symbol } = useCurrency();
  const add = useAddRecurring();
  const update = useUpdateRecurring();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState(1);
  const [selection, setSelection] = useState<CategorySelection>({ category: 'bills', customKey: null });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setAmount(formatAmount(initial.amount));
      setDescription(initial.description);
      setDay(initial.dayOfMonth);
      setSelection({ category: initial.category, customKey: initial.customCategoryKey });
    } else {
      setAmount('');
      setDescription('');
      setDay(1);
      setSelection({ category: 'bills', customKey: null });
    }
  }, [open, initial]);

  async function handleSave() {
    const parsed = parseAmount(amount);
    if (!parsed || parsed <= 0 || !description.trim()) return;
    setBusy(true);
    try {
      const payload = {
        amount: parsed,
        description: description.trim(),
        category: selection.category,
        customCategoryKey: selection.customKey,
        dayOfMonth: day,
      };
      if (initial) await update.mutateAsync({ id: initial.id, ...payload });
      else await add.mutateAsync(payload);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={initial ? 'Edit rule' : 'New recurring rule'}>
      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Amount</span>
          <div className="flex h-11 items-center gap-2 rounded-sm border border-stroke bg-paper px-3 focus-within:border-terracotta">
            <span className="text-ink-soft">{symbol}</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(formatAmountInput(e.target.value))}
              className="h-full flex-1 bg-transparent tnum outline-none"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Description</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Netflix"
            className="h-11 w-full rounded-sm border border-stroke bg-paper px-3 outline-none focus:border-terracotta"
          />
        </label>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-ink-muted">Category</span>
          <CategoryChip value={selection} onChange={setSelection} />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-muted">Day of month (1–28)</span>
          <input
            type="number"
            min={1}
            max={28}
            value={day}
            onChange={(e) => setDay(Math.min(28, Math.max(1, Number(e.target.value) || 1)))}
            className="h-11 w-24 rounded-sm border border-stroke bg-paper px-3 tnum outline-none focus:border-terracotta"
          />
        </label>

        <Button className="mt-2" disabled={busy} onClick={handleSave}>
          {busy ? 'Saving…' : initial ? 'Save changes' : 'Add rule'}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
