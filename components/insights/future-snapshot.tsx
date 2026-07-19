'use client';

import { Area, AreaChart, ResponsiveContainer, XAxis } from 'recharts';
import type { MonthlyTotalPoint } from '@ledgr/shared';
import { MONTH_SHORT } from '@/lib/dates';
import { PaperCard, SerifAmount, TrendPill } from '@/components/ui/primitives';
import { useCurrency } from '@/lib/format';

/** Projected average monthly spend + trend — ports _FutureSnapshotCard. */
export function FutureSnapshot({ points }: { points: MonthlyTotalPoint[] }) {
  const { plain, symbol } = useCurrency();
  const values = points.map((p) => p.total);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const last = values.at(-1) ?? 0;
  const pctDelta = avg > 0 ? Math.round(((last - avg) / avg) * 100) : 0;

  const data = points.map((p) => ({
    label: MONTH_SHORT[new Date(p.month).getMonth()],
    value: p.total,
  }));

  return (
    <PaperCard className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-ink">Future snapshot</h3>
        {avg > 0 ? <TrendPill text={`${pctDelta >= 0 ? '+' : ''}${pctDelta}%`} positive={pctDelta <= 0} /> : null}
      </div>
      <p className="mt-0.5 text-sm text-ink-muted">Projected average monthly spend</p>
      <div className="mt-4">
        <SerifAmount value={plain(avg, { compact: true })} symbol={symbol} className="text-3xl" />
      </div>

      <div className="mt-4 h-24">
        {data.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-muted">
            Track a few more months to see your trend
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C15F3C" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#C15F3C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8E8B83' }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#C15F3C"
                strokeWidth={3}
                fill="url(#trend)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </PaperCard>
  );
}
