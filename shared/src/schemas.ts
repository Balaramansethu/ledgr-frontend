import { z } from 'zod';
import { CATEGORY_KEYS } from './categories';
import { CURRENCIES } from './currency';

const CATEGORY_ENUM = z.enum(CATEGORY_KEYS as [string, ...string[]]);
const CURRENCY_ENUM = z.enum(CURRENCIES.map((c) => c.code) as [string, ...string[]]);

// ── Auth ────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  name: z.string().trim().min(1).max(80),
});

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

// ── User settings ───────────────────────────────────────────────────────
export const themeModeSchema = z.enum(['system', 'light', 'dark']);

export const settingsSchema = z.object({
  currencyCode: CURRENCY_ENUM.optional(),
  themeMode: themeModeSchema.optional(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:mm')
    .optional(),
  timezone: z.string().max(64).optional(),
  name: z.string().trim().min(1).max(80).optional(),
});

// ── Expense ─────────────────────────────────────────────────────────────
export const expenseInputSchema = z.object({
  amount: z.number().positive().max(1e12),
  description: z.string().trim().min(1).max(200),
  category: CATEGORY_ENUM,
  customCategoryKey: z.string().max(120).nullish(),
  createdAt: z.string().datetime().optional(),
  imageUrl: z.string().url().max(500).nullish(),
});

export const expenseUpdateSchema = expenseInputSchema.partial();

// ── Person ──────────────────────────────────────────────────────────────
export const personInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

// ── Splits (replace-set for an expense) ─────────────────────────────────
export const splitEntryInputSchema = z.object({
  personId: z.string().min(1),
  splitAmount: z.number().positive(),
});

export const replaceSplitsSchema = z.object({
  totalAmount: z.number().positive(),
  description: z.string().trim().min(1).max(200),
  category: CATEGORY_ENUM,
  customCategoryKey: z.string().max(120).nullish(),
  splits: z.array(splitEntryInputSchema).max(50),
});

// ── Budget ──────────────────────────────────────────────────────────────
export const budgetInputSchema = z.object({
  amount: z.number().positive().max(1e12),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// ── Recurring ───────────────────────────────────────────────────────────
export const recurringInputSchema = z.object({
  amount: z.number().positive().max(1e12),
  description: z.string().trim().min(1).max(200),
  category: CATEGORY_ENUM,
  customCategoryKey: z.string().max(120).nullish(),
  dayOfMonth: z.number().int().min(1).max(28),
  isActive: z.boolean().optional(),
});

export const recurringUpdateSchema = recurringInputSchema.partial();

// ── Custom category ─────────────────────────────────────────────────────
export const customCategoryInputSchema = z.object({
  name: z.string().trim().min(1).max(60),
  icon: z.string().min(1).max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Expected #RRGGBB'),
});

// ── Push subscription ───────────────────────────────────────────────────
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

// ── Backup (import) — mirrors the Ledgr export JSON schema exactly ───────
export const backupSchema = z.object({
  app: z.literal('ledgr'),
  version: z.number(),
  exported_at: z.string().optional(),
  data: z.object({
    expenses: z.array(z.record(z.unknown())).optional(),
    splits: z.array(z.record(z.unknown())).optional(),
    people: z.array(z.record(z.unknown())).optional(),
    budgets: z.array(z.record(z.unknown())).optional(),
    recurring_expenses: z.array(z.record(z.unknown())).optional(),
  }),
});

// ── Inferred input types ────────────────────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ThemeMode = z.infer<typeof themeModeSchema>;
export type ExpenseInput = z.infer<typeof expenseInputSchema>;
export type ExpenseUpdate = z.infer<typeof expenseUpdateSchema>;
export type PersonInput = z.infer<typeof personInputSchema>;
export type ReplaceSplitsInput = z.infer<typeof replaceSplitsSchema>;
export type BudgetInput = z.infer<typeof budgetInputSchema>;
export type RecurringInput = z.infer<typeof recurringInputSchema>;
export type RecurringUpdate = z.infer<typeof recurringUpdateSchema>;
export type CustomCategoryInput = z.infer<typeof customCategoryInputSchema>;
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
export type BackupPayload = z.infer<typeof backupSchema>;
