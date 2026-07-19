/** Local-time date helpers for building month ranges the API filters on. */

export interface MonthRange {
  from: string; // ISO
  to: string; // ISO
}

/** [firstOfMonth, firstOfNextMonth) in local time, as ISO instants. */
export function monthRange(year: number, month0: number): MonthRange {
  return {
    from: new Date(year, month0, 1).toISOString(),
    to: new Date(year, month0 + 1, 1).toISOString(),
  };
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** "July 2026" */
export function monthLabel(year: number, month0: number): string {
  return `${MONTH_NAMES[month0]} ${year}`;
}

/** Whether (year, month0) is the current calendar month. */
export function isCurrentMonth(year: number, month0: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month0;
}

export function prevMonth(year: number, month0: number): { year: number; month0: number } {
  return month0 === 0 ? { year: year - 1, month0: 11 } : { year, month0: month0 - 1 };
}

export function nextMonth(year: number, month0: number): { year: number; month0: number } {
  return month0 === 11 ? { year: year + 1, month0: 0 } : { year, month0: month0 + 1 };
}
