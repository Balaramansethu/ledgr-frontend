'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatAmount, formatAmountInput, parseAmount } from '@ledgr/shared';
import { PaperCard, ProgressBar, SectionLabel, SerifAmount } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { useBudget, useDaily, useDeleteBudget, useSetBudget, useSummary } from '@/lib/queries';
import { monthLabel, monthRange } from '@/lib/dates';
import { useCurrency } from '@/lib/format';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function BudgetPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month0 = now.getMonth();
  const range = useMemo(() => monthRange(year, month0), [year, month0]);

  const { data: budget } = useBudget();
  const { data: summary = {} } = useSummary(range.from, range.to);
  const { data: daily = {} } = useDaily(range.from, range.to);
  const setBudget = useSetBudget();
  const deleteBudget = useDeleteBudget();
  const { fmt, plain, symbol } = useCurrency();

  const [amount, setAmount] = useState('');
  useEffect(() => {
    if (budget) setAmount(formatAmount(budget.amount));
  }, [budget]);

  const spent = Object.values(summary).reduce<number>((a, b) => a + (b ?? 0), 0);
  const fraction = budget && budget.amount > 0 ? spent / budget.amount : 0;

  async function handleSave() {
    const parsed = parseAmount(amount);
    if (!parsed || parsed <= 0) return;
    await setBudget.mutateAsync({
      amount: parsed,
      startDate: new Date(year, month0, 1).toISOString(),
      endDate: new Date(year, month0 + 1, 0, 23, 59, 59).toISOString(),
    });
  }

  // Calendar grid
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const firstDow = (new Date(year, month0, 1).getDay() + 6) % 7; // Mon=0
  const maxDaily = Math.max(1, ...Object.values(daily));

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-serif text-2xl font-semibold text-ink lg:hidden">Budget</h1>

      <PaperCard className="p-5">
        {budget ? (
          <>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-ink-muted">Spent this month</div>
                <SerifAmount value={plain(spent)} symbol={symbol} className="text-3xl" />
                <div className="mt-1 text-sm text-ink-soft">of {fmt(budget.amount)}</div>
              </div>
              <button
                type="button"
                aria-label="Remove budget"
                onClick={() => deleteBudget.mutate()}
                className="rounded-sm p-2 text-ink-soft hover:bg-canvas-alt hover:text-negative"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <ProgressBar fraction={fraction} className="mt-4" />
            <div className="mt-2 text-sm font-semibold text-terracotta">
              {Math.round(fraction * 100)}% used
            </div>
          </>
        ) : (
          <div className="text-sm text-ink-muted">Set a budget for {monthLabel(year, month0)}.</div>
        )}

        <div className="mt-4 flex items-end gap-2">
          <label className="flex-1">
            <span className="mb-1.5 block text-sm font-medium text-ink-muted">
              Monthly budget amount
            </span>
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
          <Button onClick={handleSave} disabled={setBudget.isPending}>
            {budget ? 'Update' : 'Set budget'}
          </Button>
        </div>
      </PaperCard>

      <section className="flex flex-col gap-2">
        <SectionLabel>{monthLabel(year, month0)}</SectionLabel>
        <PaperCard className="p-4">
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink-soft">
            {WEEKDAYS.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDow }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = `${year}-${String(month0 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const spentOnDay = daily[key] ?? 0;
              const intensity = spentOnDay > 0 ? 0.12 + 0.68 * (spentOnDay / maxDaily) : 0;
              return (
                <div
                  key={key}
                  title={spentOnDay > 0 ? fmt(spentOnDay) : 'No spend'}
                  className="flex aspect-square items-center justify-center rounded-sm border border-stroke text-xs text-ink"
                  style={{ backgroundColor: `rgba(193,95,60,${intensity})` }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </PaperCard>
      </section>
    </div>
  );
}
