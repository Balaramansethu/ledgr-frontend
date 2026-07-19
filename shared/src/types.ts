import type { CategoryKey } from './categories';
import type { ThemeMode } from './schemas';

/** API response DTOs. Ids are strings (Mongo ObjectId hex); dates are ISO strings. */

export interface UserSettings {
  currencyCode: string;
  themeMode: ThemeMode;
  reminderEnabled: boolean;
  reminderTime: string; // "HH:mm"
  timezone: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  onboarded: boolean;
  settings: UserSettings;
  createdAt: string;
}

export interface ExpenseDto {
  id: string;
  amount: number;
  description: string;
  category: CategoryKey;
  customCategoryKey: string | null;
  createdAt: string;
  imageUrl: string | null;
  recurringId: string | null;
  recurringPeriod: string | null;
}

export interface PersonDto {
  id: string;
  name: string;
  createdAt: string;
}

export interface SplitDto {
  id: string;
  expenseId: string;
  personId: string;
  personName: string;
  totalAmount: number;
  splitAmount: number;
  description: string;
  category: string;
  createdAt: string;
}

export interface BudgetDto {
  id: string;
  amount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface RecurringDto {
  id: string;
  amount: number;
  description: string;
  category: CategoryKey;
  customCategoryKey: string | null;
  dayOfMonth: number;
  isActive: boolean;
  createdAt: string;
  lastLoggedAt: string | null;
}

export interface CustomCategoryDto {
  key: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

/** Category totals for a month: `{ food: 1234, transport: 56 }`. */
export type CategorySummary = Partial<Record<string, number>>;

export interface MonthlyTotalPoint {
  /** first-of-month ISO date */
  month: string;
  total: number;
}

export interface InsightsResponse {
  tips: string[];
}

export interface PersonBalance {
  personId: string;
  total: number;
}
