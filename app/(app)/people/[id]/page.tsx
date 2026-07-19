'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { AvatarBubble, PaperCard, SerifAmount } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useClearPerson, usePeople, usePersonSplits } from '@/lib/queries';
import { useCurrency } from '@/lib/format';

export default function PersonDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { data: people = [] } = usePeople();
  const { data: splits = [], isLoading } = usePersonSplits(id);
  const clear = useClearPerson();
  const { fmt, plain, symbol } = useCurrency();

  const person = people.find((p) => p.id === id);
  const balance = splits.reduce((sum, s) => sum + s.splitAmount, 0);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/people" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted">
        <ArrowLeft size={16} /> People
      </Link>

      <PaperCard className="flex flex-col items-center gap-2 p-6 text-center">
        <AvatarBubble name={person?.name ?? '?'} size={56} />
        <div className="text-lg font-bold text-ink">{person?.name ?? 'Unknown'}</div>
        <div className="text-sm text-ink-muted">owes you</div>
        <SerifAmount value={plain(balance)} symbol={symbol} className="text-4xl text-terracotta" />
        {balance > 0 ? (
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => clear.mutate(id)}
            disabled={clear.isPending}
          >
            <Check size={16} /> Settle up
          </Button>
        ) : null}
      </PaperCard>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : splits.length === 0 ? (
        <PaperCard className="p-8 text-center text-sm text-ink-muted">
          No shared expenses yet. Split an expense with {person?.name ?? 'them'} to see it here.
        </PaperCard>
      ) : (
        <PaperCard className="divide-y divide-stroke p-0">
          {splits.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink">{s.description}</div>
                <div className="text-xs text-ink-soft">
                  {new Date(s.createdAt).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  · total {fmt(s.totalAmount)}
                </div>
              </div>
              <div className="shrink-0 font-serif font-semibold text-ink tnum">{fmt(s.splitAmount)}</div>
            </div>
          ))}
        </PaperCard>
      )}
    </div>
  );
}
