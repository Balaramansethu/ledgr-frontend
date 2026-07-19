'use client';

import { useRouter } from 'next/navigation';
import { Flag, Lightbulb, Repeat, Settings, Users } from 'lucide-react';
import { CATEGORIES, toCategoryKey } from '@ledgr/shared';
import { PaperCard, SectionLabel } from '@/components/ui/primitives';
import { FutureSnapshot } from '@/components/insights/future-snapshot';
import { useInsights, useMonthlyTotals, useSummary } from '@/lib/queries';
import { monthRange } from '@/lib/dates';

const QUICK_ACTIONS = [
  { icon: Flag, label: 'Budget', href: '/budget' },
  { icon: Repeat, label: 'Recurring', href: '/recurring' },
  { icon: Users, label: 'People', href: '/people' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

function mood(summary: Record<string, number | undefined>) {
  const total = Object.values(summary).reduce<number>((a, b) => a + (b ?? 0), 0);
  const sorted = Object.entries(summary)
    .filter(([, v]) => (v ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  if (sorted.length === 0 || total <= 0) {
    return { emoji: '🙂', title: 'Steady', desc: 'Your spending looks balanced.' };
  }
  const topPct = (sorted[0]![1] ?? 0) / total;
  const topName = CATEGORIES[toCategoryKey(sorted[0]![0])].displayName;
  if (topPct > 0.5) {
    return { emoji: '⚠️', title: 'Concentrated', desc: `${topName} is over half your spend — diversify or trim.` };
  }
  if (topPct > 0.35) {
    return { emoji: '🙂', title: 'Feeling good', desc: 'Your financial health is on track.' };
  }
  return { emoji: '😎', title: 'Balanced', desc: 'No single category is dominating.' };
}

export default function InsightsPage() {
  const router = useRouter();
  const now = new Date();
  const range = monthRange(now.getFullYear(), now.getMonth());
  const { data: points = [] } = useMonthlyTotals(6);
  const { data: tips = [] } = useInsights();
  const { data: summary = {} } = useSummary(range.from, range.to);
  const m = mood(summary);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-semibold text-ink lg:hidden">Insights</h1>

      <div className="grid grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => router.push(a.href)}
            className="flex flex-col items-center gap-2"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-stroke bg-paper text-ink transition-colors hover:bg-paper-warm">
              <a.icon size={22} />
            </span>
            <span className="text-xs font-semibold text-ink-muted">{a.label}</span>
          </button>
        ))}
      </div>

      <FutureSnapshot points={points} />

      <PaperCard className="flex items-center gap-4 p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-soft text-2xl">
          {m.emoji}
        </span>
        <div>
          <div className="font-bold text-ink">{m.title}</div>
          <div className="text-sm text-ink-muted">{m.desc}</div>
        </div>
      </PaperCard>

      {tips.length > 0 ? (
        <section className="flex flex-col gap-2">
          <SectionLabel>Smart tips</SectionLabel>
          <PaperCard className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb size={18} className="text-terracotta" />
              <span className="font-bold text-ink">For you</span>
            </div>
            <ul className="flex flex-col gap-2">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                  {tip}
                </li>
              ))}
            </ul>
          </PaperCard>
        </section>
      ) : null}
    </div>
  );
}
