'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ChevronRight, Trash2, UserPlus, Users } from 'lucide-react';
import { AvatarBubble, PaperCard } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAddPerson, useBalances, useDeletePerson, usePeople } from '@/lib/queries';
import { useCurrency } from '@/lib/format';

export default function PeoplePage() {
  const { data: people = [], isLoading } = usePeople();
  const { data: balances = [] } = useBalances();
  const add = useAddPerson();
  const del = useDeletePerson();
  const { fmt } = useCurrency();
  const [name, setName] = useState('');

  const balanceFor = (id: string) => balances.find((b) => b.personId === id)?.total ?? 0;

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await add.mutateAsync(name.trim());
    setName('');
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-2xl font-semibold text-ink lg:hidden">People</h1>
      <p className="text-sm text-ink-muted">Track who owes you from split expenses.</p>

      <form onSubmit={onAdd} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a person"
          className="h-11 flex-1 rounded-sm border border-stroke bg-paper px-3 outline-none focus:border-terracotta"
        />
        <Button type="submit" disabled={!name.trim() || add.isPending}>
          <UserPlus size={16} /> Add
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : people.length === 0 ? (
        <PaperCard className="flex flex-col items-center gap-2 p-8 text-center">
          <Users size={36} className="text-terracotta" />
          <p className="font-semibold text-ink">No people yet</p>
          <p className="text-sm text-ink-muted">Add someone to start splitting expenses.</p>
        </PaperCard>
      ) : (
        <div className="flex flex-col gap-2">
          {people.map((person) => {
            const owed = balanceFor(person.id);
            return (
              <PaperCard key={person.id} className="flex items-center gap-3 p-3">
                <Link href={`/people/${person.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <AvatarBubble name={person.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink">{person.name}</div>
                    <div className="text-xs text-ink-soft">
                      {owed > 0 ? `owes you ${fmt(owed)}` : 'settled up'}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-ink-soft" />
                </Link>
                <button
                  type="button"
                  aria-label={`Remove ${person.name}`}
                  onClick={() => del.mutate(person.id)}
                  className="rounded-sm p-2 text-ink-soft hover:bg-canvas-alt hover:text-negative"
                >
                  <Trash2 size={16} />
                </button>
              </PaperCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
