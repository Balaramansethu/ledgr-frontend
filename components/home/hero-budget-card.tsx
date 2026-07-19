'use client';

import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';
import type { BudgetDto } from '@ledgr/shared';
import { PaperCard, SerifAmount } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/format';

const TRACK = 'rgba(193,95,60,0.15)';
const FILL = '#C15F3C';

/** Hero budget card with donut + month nav — ports the home_tab hero. */
export function HeroBudgetCard({
  monthLabel,
  total,
  budget,
  canNext,
  onPrev,
  onNext,
  onSetBudget,
}: {
  monthLabel: string;
  total: number;
  budget: BudgetDto | null | undefined;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSetBudget: () => void;
}) {
  const { fmt, plain, symbol } = useCurrency();
  const hasBudget = Boolean(budget && budget.amount > 0);
  const fraction = hasBudget ? Math.min(1, total / budget!.amount) : 0;
  const data = fraction > 0 ? [{ value: fraction }, { value: 1 - fraction }] : [{ value: 1 }];

  return (
    <PaperCard className="p-5">
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-ink">{hasBudget ? 'Total Budget' : 'Spent this month'}</h3>
        {hasBudget ? (
          <div className="text-right">
            <div className="text-xs text-ink-soft">Spent</div>
            <div className="font-bold text-ink tnum">{fmt(total)}</div>
            <div className="text-xs text-ink-soft">of {fmt(budget!.amount)}</div>
          </div>
        ) : null}
      </div>

      <div className="relative mx-auto my-2 h-[180px] w-[180px]">
        <PieChart width={180} height={180}>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={64}
            outerRadius={78}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={fraction > 0 && i === 0 ? FILL : TRACK} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hasBudget ? (
            <span className="font-serif text-3xl font-semibold text-ink">
              {Math.round(fraction * 100)}%
            </span>
          ) : (
            <SerifAmount value={plain(total, { compact: true })} symbol={symbol} className="text-3xl" />
          )}
          <span className="mt-0.5 text-xs text-ink-soft">{monthLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NavButton icon={<ChevronLeft size={18} />} onClick={onPrev} label="Previous month" />
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-orange-pale">
          <div
            className="h-full rounded-full transition-[width]"
            style={{
              width: `${hasBudget ? fraction * 100 : total > 0 ? 100 : 0}%`,
              backgroundImage: 'linear-gradient(90deg, #FF9D5C, #C15F3C)',
            }}
          />
        </div>
        <NavButton
          icon={<ChevronRight size={18} />}
          onClick={canNext ? onNext : undefined}
          label="Next month"
        />
      </div>

      {!hasBudget ? (
        <Button className="mt-4 w-full" onClick={onSetBudget}>
          <Flag size={16} /> Set a monthly budget
        </Button>
      ) : null}
    </PaperCard>
  );
}

function NavButton({
  icon,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas-alt text-ink transition-colors hover:bg-stroke disabled:opacity-40"
    >
      {icon}
    </button>
  );
}
