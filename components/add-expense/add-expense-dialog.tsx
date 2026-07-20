'use client';

import { useEffect, useState } from 'react';
import { Split as SplitIcon, X } from 'lucide-react';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { SerifAmount } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { CategoryChip, type CategorySelection } from '@/components/category/category-select';
import { ReceiptField } from '@/components/expense/receipt-field';
import { SplitDialog } from '@/components/split/split-dialog';
import { Keypad, applyKey } from './keypad';
import { useCreateExpense, useCategories } from '@/lib/queries';
import { useCurrency } from '@/lib/format';
import { resolveCategory } from '@/lib/categories';

const DEFAULT_CATEGORY: CategorySelection = { category: 'other', customKey: null };

export function AddExpenseDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { symbol } = useCurrency();
  const { data: custom = [] } = useCategories();
  const createExpense = useCreateExpense();

  const [input, setInput] = useState('');
  const [note, setNote] = useState('');
  const [selection, setSelection] = useState<CategorySelection>(DEFAULT_CATEGORY);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splitOpen, setSplitOpen] = useState(false);

  const amount = input === '' ? null : Number(input);
  const description = note.trim() || resolveCategory(selection.category, selection.customKey, custom).name;

  function reset() {
    setInput('');
    setNote('');
    setSelection(DEFAULT_CATEGORY);
    setReceiptUrl(null);
    setError(null);
  }

  function close() {
    onOpenChange(false);
    setTimeout(reset, 200);
  }

  // Physical keyboard support on desktop.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (/^[0-9]$/.test(e.key)) setInput((v) => applyKey(v, e.key));
      else if (e.key === '.') setInput((v) => applyKey(v, '.'));
      else if (e.key === 'Backspace') setInput((v) => applyKey(v, '⌫'));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  async function handleSave() {
    if (!amount || amount <= 0) return;
    setBusy(true);
    try {
      await createExpense.mutateAsync({
        amount,
        description,
        category: selection.category,
        customCategoryKey: selection.customKey,
        imageUrl: receiptUrl,
        createdAt: new Date().toISOString(),
      });
      close();
    } catch {
      setError('Could not save the expense. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <ResponsiveDialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())} title="Add expense" hideTitle>
        <div className="flex flex-col items-center">
          <div className="py-4">
            <SerifAmount value={input === '' ? '0.00' : input} symbol={symbol} className="text-5xl" />
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <CategoryChip value={selection} onChange={setSelection} />
          </div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="mb-3 h-11 w-full rounded-sm border border-stroke bg-paper px-4 text-sm outline-none focus:border-terracotta"
          />

          <ReceiptField value={receiptUrl} onChange={setReceiptUrl} className="mb-4" />

          {error ? (
            <div className="mb-3 flex w-full items-center justify-between rounded-sm bg-negative/10 px-3 py-2 text-sm text-negative">
              {error}
              <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
          ) : null}

          <div className="w-full">
            <Keypad onPress={(k) => setInput((v) => applyKey(v, k))} />
          </div>

          <div className="mt-4 flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={!amount || amount <= 0}
              onClick={() => setSplitOpen(true)}
            >
              <SplitIcon size={16} /> Split
            </Button>
            <Button className="flex-[2]" disabled={!amount || amount <= 0 || busy} onClick={handleSave}>
              {busy ? 'Saving…' : 'Save expense'}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {amount && amount > 0 ? (
        <SplitDialog
          open={splitOpen}
          onOpenChange={setSplitOpen}
          amount={amount}
          description={description}
          category={selection.category}
          customKey={selection.customKey}
          onSaved={close}
        />
      ) : null}
    </>
  );
}
