'use client';

import { useState } from 'react';
import type { CustomCategoryDto, ExpenseDto, SplitDto } from '@ledgr/shared';
import { ExpenseTile } from './expense-tile';
import { EditExpenseDialog } from './edit-expense-dialog';
import { useCreateExpense, useDeleteExpense, useReplaceSplits } from '@/lib/queries';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

/** Renders a list of expenses with edit + delete-with-undo — ports the shared
 *  edit/delete handling from home_screen.dart. */
export function ExpenseList({
  expenses,
  custom,
}: {
  expenses: ExpenseDto[];
  custom: CustomCategoryDto[];
}) {
  const [editing, setEditing] = useState<ExpenseDto | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const del = useDeleteExpense();
  const create = useCreateExpense();
  const replace = useReplaceSplits();
  const { toast } = useToast();

  async function handleDelete(expense: ExpenseDto) {
    const splits = await api
      .get<{ splits: SplitDto[] }>(`/expenses/${expense.id}/splits`)
      .then((r) => r.splits)
      .catch(() => [] as SplitDto[]);

    await del.mutateAsync(expense.id);

    toast({
      message: `Deleted "${expense.description}"`,
      actionLabel: 'Undo',
      onAction: async () => {
        const created = await create.mutateAsync({
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          customCategoryKey: expense.customCategoryKey,
          imageUrl: expense.imageUrl,
          createdAt: expense.createdAt,
        });
        if (splits.length > 0) {
          await replace.mutateAsync({
            expenseId: created.id,
            totalAmount: splits[0]!.totalAmount,
            description: expense.description,
            category: expense.category,
            customCategoryKey: expense.customCategoryKey,
            splits: splits.map((s) => ({ personId: s.personId, splitAmount: s.splitAmount })),
          });
        }
      },
    });
  }

  return (
    <div className="flex flex-col">
      {expenses.map((expense) => (
        <ExpenseTile
          key={expense.id}
          expense={expense}
          custom={custom}
          onEdit={(e) => {
            setEditing(e);
            setEditOpen(true);
          }}
          onDelete={handleDelete}
        />
      ))}
      <EditExpenseDialog expense={editing} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
