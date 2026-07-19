'use client';

import { useEffect, useState } from 'react';
import { Camera, Split as SplitIcon, X } from 'lucide-react';
import { formatAmount, formatAmountInput, parseAmount, type ExpenseDto } from '@ledgr/shared';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { CategoryChip, type CategorySelection } from '@/components/category/category-select';
import { SplitDialog } from '@/components/split/split-dialog';
import { useUpdateExpense } from '@/lib/queries';
import { useCurrency } from '@/lib/format';
import { api } from '@/lib/api';

/** Edit an existing expense — ports the home_screen edit sheet. */
export function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
}: {
  expense: ExpenseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { symbol } = useCurrency();
  const update = useUpdateExpense();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selection, setSelection] = useState<CategorySelection>({ category: 'other', customKey: null });
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [splitOpen, setSplitOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expense && open) {
      setAmount(formatAmount(expense.amount));
      setDescription(expense.description);
      setSelection({ category: expense.category, customKey: expense.customCategoryKey });
      setReceiptUrl(expense.imageUrl);
      setError(null);
    }
  }, [expense, open]);

  if (!expense) return null;

  async function handleReceipt(file: File) {
    const form = new FormData();
    form.append('file', file);
    try {
      const { url } = await api.upload<{ url: string }>('/uploads/receipt', form);
      setReceiptUrl(url);
    } catch {
      setError('Could not upload the receipt.');
    }
  }

  async function handleUpdate() {
    const parsed = parseAmount(amount);
    if (!parsed || parsed <= 0 || !description.trim() || !expense) return;
    setBusy(true);
    try {
      await update.mutateAsync({
        id: expense.id,
        amount: parsed,
        description: description.trim(),
        category: selection.category,
        customCategoryKey: selection.customKey,
        imageUrl: receiptUrl,
      });
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  const parsedAmount = parseAmount(amount) ?? 0;

  return (
    <>
      <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Edit expense">
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
              className="h-11 w-full rounded-sm border border-stroke bg-paper px-3 outline-none focus:border-terracotta"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <CategoryChip value={selection} onChange={setSelection} />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-stroke bg-paper px-3 py-1.5 text-sm font-semibold text-ink">
              <Camera size={14} /> {receiptUrl ? 'Attached' : 'Receipt'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleReceipt(file);
                  e.target.value = '';
                }}
              />
            </label>
            {receiptUrl ? (
              <button
                type="button"
                onClick={() => setReceiptUrl(null)}
                className="rounded-full p-1 text-ink-soft hover:text-negative"
                aria-label="Remove receipt"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>

          {error ? <p className="text-sm text-negative">{error}</p> : null}

          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={parsedAmount <= 0}
              onClick={() => setSplitOpen(true)}
            >
              <SplitIcon size={16} /> Split
            </Button>
            <Button className="flex-[2]" disabled={busy} onClick={handleUpdate}>
              {busy ? 'Saving…' : 'Update'}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      <SplitDialog
        open={splitOpen}
        onOpenChange={setSplitOpen}
        amount={parsedAmount}
        description={description.trim() || 'Expense'}
        category={selection.category}
        customKey={selection.customKey}
        existingExpenseId={expense.id}
        onSaved={() => onOpenChange(false)}
      />
    </>
  );
}
