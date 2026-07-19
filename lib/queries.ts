'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import type {
  BudgetDto,
  CategorySummary,
  CustomCategoryDto,
  ExpenseDto,
  ExpenseInput,
  MonthlyTotalPoint,
  PersonBalance,
  PersonDto,
  RecurringDto,
  RecurringInput,
  SettingsInput,
  SplitDto,
  UserDto,
} from '@ledgr/shared';
import { api } from './api';

export const qk = {
  expenses: (from?: string, to?: string) => ['expenses', from ?? null, to ?? null] as const,
  allExpenses: ['expenses', 'all'] as const,
  summary: (from: string, to: string) => ['summary', from, to] as const,
  people: ['people'] as const,
  balances: ['balances'] as const,
  personSplits: (id: string) => ['personSplits', id] as const,
  expenseSplits: (id: string) => ['expenseSplits', id] as const,
  budget: ['budget'] as const,
  daily: (from: string, to: string) => ['daily', from, to] as const,
  recurring: ['recurring'] as const,
  categories: ['categories'] as const,
  insights: ['insights'] as const,
  monthlyTotals: (months: number) => ['monthlyTotals', months] as const,
};

/** Invalidate everything that a new/changed expense can affect. */
function invalidateExpenseViews(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ['expenses'] });
  qc.invalidateQueries({ queryKey: ['summary'] });
  qc.invalidateQueries({ queryKey: ['daily'] });
  qc.invalidateQueries({ queryKey: ['insights'] });
  qc.invalidateQueries({ queryKey: ['monthlyTotals'] });
  qc.invalidateQueries({ queryKey: ['balances'] });
}

// ── Queries ───────────────────────────────────────────────────────────────

export function useExpenses(from?: string, to?: string) {
  const q = from && to ? `?from=${from}&to=${to}` : '';
  return useQuery({
    queryKey: qk.expenses(from, to),
    queryFn: () => api.get<{ expenses: ExpenseDto[] }>(`/expenses${q}`).then((r) => r.expenses),
  });
}

export function useAllExpenses() {
  return useQuery({
    queryKey: qk.allExpenses,
    queryFn: () => api.get<{ expenses: ExpenseDto[] }>('/expenses/all').then((r) => r.expenses),
  });
}

export function useSummary(from: string, to: string) {
  return useQuery({
    queryKey: qk.summary(from, to),
    queryFn: () =>
      api.get<{ summary: CategorySummary }>(`/expenses/summary?from=${from}&to=${to}`).then((r) => r.summary),
  });
}

export function usePeople() {
  return useQuery({
    queryKey: qk.people,
    queryFn: () => api.get<{ people: PersonDto[] }>('/people').then((r) => r.people),
  });
}

export function useBalances() {
  return useQuery({
    queryKey: qk.balances,
    queryFn: () => api.get<{ balances: PersonBalance[] }>('/people/balances').then((r) => r.balances),
  });
}

export function usePersonSplits(id: string) {
  return useQuery({
    queryKey: qk.personSplits(id),
    queryFn: () => api.get<{ splits: SplitDto[] }>(`/people/${id}/splits`).then((r) => r.splits),
    enabled: Boolean(id),
  });
}

export function useExpenseSplits(id: string | null) {
  return useQuery({
    queryKey: qk.expenseSplits(id ?? ''),
    queryFn: () => api.get<{ splits: SplitDto[] }>(`/expenses/${id}/splits`).then((r) => r.splits),
    enabled: Boolean(id),
  });
}

export function useBudget() {
  return useQuery({
    queryKey: qk.budget,
    queryFn: () => api.get<{ budget: BudgetDto | null }>('/budget').then((r) => r.budget),
  });
}

export function useDaily(from: string, to: string) {
  return useQuery({
    queryKey: qk.daily(from, to),
    queryFn: () =>
      api.get<{ daily: Record<string, number> }>(`/budget/daily?from=${from}&to=${to}`).then((r) => r.daily),
  });
}

export function useRecurring() {
  return useQuery({
    queryKey: qk.recurring,
    queryFn: () => api.get<{ recurring: RecurringDto[] }>('/recurring').then((r) => r.recurring),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: qk.categories,
    queryFn: () => api.get<{ categories: CustomCategoryDto[] }>('/categories').then((r) => r.categories),
  });
}

export function useInsights() {
  return useQuery({
    queryKey: qk.insights,
    queryFn: () => api.get<{ tips: string[] }>('/insights').then((r) => r.tips),
  });
}

export function useMonthlyTotals(months = 6) {
  return useQuery({
    queryKey: qk.monthlyTotals(months),
    queryFn: () =>
      api.get<{ points: MonthlyTotalPoint[] }>(`/insights/monthly-totals?months=${months}`).then((r) => r.points),
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExpenseInput & { createdAt?: string }) =>
      api.post<{ expense: ExpenseDto }>('/expenses', input).then((r) => r.expense),
    onSuccess: () => invalidateExpenseViews(qc),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<ExpenseInput>) =>
      api.patch<{ expense: ExpenseDto }>(`/expenses/${id}`, input).then((r) => r.expense),
    onSuccess: () => invalidateExpenseViews(qc),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/expenses/${id}`),
    onSuccess: () => invalidateExpenseViews(qc),
  });
}

export interface ReplaceSplitsArgs {
  expenseId: string;
  totalAmount: number;
  description: string;
  category: string;
  customCategoryKey?: string | null;
  splits: { personId: string; splitAmount: number }[];
}

export function useReplaceSplits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, ...body }: ReplaceSplitsArgs) =>
      api.put<{ splits: SplitDto[] }>(`/expenses/${expenseId}/splits`, body).then((r) => r.splits),
    onSuccess: (_data, vars) => {
      invalidateExpenseViews(qc);
      qc.invalidateQueries({ queryKey: qk.expenseSplits(vars.expenseId) });
    },
  });
}

export function useAddPerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post<{ person: PersonDto }>('/people', { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.people }),
  });
}

export function useDeletePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/people/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.people });
      qc.invalidateQueries({ queryKey: qk.balances });
    },
  });
}

export function useClearPerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/people/${id}/clear`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['personSplits'] });
      qc.invalidateQueries({ queryKey: qk.balances });
    },
  });
}

export function useSetBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { amount: number; startDate: string; endDate: string }) =>
      api.put<{ budget: BudgetDto }>('/budget', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.budget });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.del('/budget'),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.budget }),
  });
}

export function useAddRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecurringInput) => api.post<{ recurring: RecurringDto }>('/recurring', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.recurring }),
  });
}

export function useUpdateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<RecurringInput>) =>
      api.patch<{ recurring: RecurringDto }>(`/recurring/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.recurring }),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/recurring/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.recurring }),
  });
}

export function useAddCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; icon: string; color: string }) =>
      api.post<{ category: CustomCategoryDto }>('/categories', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => api.del(`/categories/${key}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SettingsInput) => api.patch<{ user: UserDto }>('/users/me', input),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useImportBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (backup: unknown) =>
      api.post<{ count: number }>('/data/import/backup', backup as Record<string, unknown>),
    onSuccess: () => qc.invalidateQueries(),
  });
}
