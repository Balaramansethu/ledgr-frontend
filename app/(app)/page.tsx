'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiggyBank } from 'lucide-react';
import { PaperCard, SectionLabel } from '@/components/ui/primitives';
import { Spinner } from '@/components/ui/spinner';
import { HeroBudgetCard } from '@/components/home/hero-budget-card';
import { CategoryProgressCard } from '@/components/home/category-progress';
import { ExpenseList } from '@/components/expense/expense-list';
import { useAuth } from '@/lib/auth';
import { useBudget, useCategories, useExpenses, useSummary } from '@/lib/queries';
import { isCurrentMonth, monthLabel, monthRange, nextMonth, prevMonth } from '@/lib/dates';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const now = new Date();
  const [ym, setYm] = useState({ year: now.getFullYear(), month0: now.getMonth() });
  const range = useMemo(() => monthRange(ym.year, ym.month0), [ym]);

  const { data: expenses = [], isLoading } = useExpenses(range.from, range.to);
  const { data: summary = {} } = useSummary(range.from, range.to);
  const { data: budget } = useBudget();
  const { data: custom = [] } = useCategories();

  const total = Object.values(summary).reduce<number>((a, b) => a + (b ?? 0), 0);
  const sorted = Object.entries(summary)
    .filter(([, v]) => (v ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Hi, {firstName}</h1>
        <p className="text-sm text-ink-muted">Here&apos;s where your money went.</p>
      </div>

      <HeroBudgetCard
        monthLabel={monthLabel(ym.year, ym.month0)}
        total={total}
        budget={budget}
        canNext={!isCurrentMonth(ym.year, ym.month0)}
        onPrev={() => setYm(prevMonth(ym.year, ym.month0))}
        onNext={() => setYm(nextMonth(ym.year, ym.month0))}
        onSetBudget={() => router.push('/budget')}
      />

      <section className="flex flex-col gap-3">
        <SectionLabel>{sorted.length === 0 ? 'Your budgets' : 'Your categories'}</SectionLabel>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : sorted.length === 0 ? (
          <PaperCard className="flex flex-col items-center gap-2 p-6 text-center">
            <PiggyBank size={36} className="text-terracotta" />
            <p className="font-semibold text-ink">No expenses yet this month</p>
            <p className="text-sm text-ink-muted">Use the + button to log your first one.</p>
          </PaperCard>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {sorted.map(([key, value]) => (
              <CategoryProgressCard key={key} categoryKey={key} amount={value ?? 0} total={total} />
            ))}
          </div>
        )}
      </section>

      {expenses.length > 0 ? (
        <section className="flex flex-col gap-2">
          <SectionLabel>Recent activity</SectionLabel>
          <PaperCard className="p-2">
            <ExpenseList expenses={expenses.slice(0, 12)} custom={custom} />
          </PaperCard>
        </section>
      ) : null}
    </div>
  );
}
