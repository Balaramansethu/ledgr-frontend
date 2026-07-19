import type { ExpenseDto } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export interface ExpenseGroup {
  label: string;
  items: ExpenseDto[];
}

/**
 * Group expenses under Today / Yesterday / "Mon D" headings — ported from
 * `ExpenseController.groupedExpenses`. Input is assumed newest-first, and the
 * output preserves that order.
 */
export function groupExpensesByDay(expenses: ExpenseDto[], now: Date = new Date()): ExpenseGroup[] {
  const today = startOfDay(now);
  const yesterday = today - 24 * 60 * 60 * 1000;

  const order: string[] = [];
  const byLabel = new Map<string, ExpenseDto[]>();

  for (const expense of expenses) {
    const created = new Date(expense.createdAt);
    const day = startOfDay(created);

    let label: string;
    if (day === today) label = 'Today';
    else if (day === yesterday) label = 'Yesterday';
    else label = `${MONTHS[created.getMonth()]} ${created.getDate()}`;

    if (!byLabel.has(label)) {
      byLabel.set(label, []);
      order.push(label);
    }
    byLabel.get(label)!.push(expense);
  }

  return order.map((label) => ({ label, items: byLabel.get(label)! }));
}
