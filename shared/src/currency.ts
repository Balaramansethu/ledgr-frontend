/**
 * Currency definitions + formatter — ported from `lib/services/settings_service.dart`.
 * Enum-driven (not free text) to avoid locale drift and make the picker trivial.
 */
export interface CurrencyDef {
  code: string;
  symbol: string;
  displayName: string;
}

export const CURRENCIES: CurrencyDef[] = [
  { code: 'USD', symbol: '$', displayName: 'US Dollar' },
  { code: 'EUR', symbol: '€', displayName: 'Euro' },
  { code: 'GBP', symbol: '£', displayName: 'British Pound' },
  { code: 'INR', symbol: '₹', displayName: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', displayName: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', displayName: 'Chinese Yuan' },
  { code: 'CAD', symbol: 'C$', displayName: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', displayName: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', displayName: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', displayName: 'UAE Dirham' },
  { code: 'BRL', symbol: 'R$', displayName: 'Brazilian Real' },
  { code: 'MXN', symbol: 'Mex$', displayName: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', displayName: 'South African Rand' },
  { code: 'CHF', symbol: 'CHF', displayName: 'Swiss Franc' },
  { code: 'KRW', symbol: '₩', displayName: 'South Korean Won' },
];

export const DEFAULT_CURRENCY_CODE = 'INR';

const BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export function currencyFromCode(code: string | null | undefined): CurrencyDef {
  if (!code) return BY_CODE.get(DEFAULT_CURRENCY_CODE)!;
  return BY_CODE.get(code) ?? BY_CODE.get(DEFAULT_CURRENCY_CODE)!;
}

export function currencySymbol(code: string | null | undefined): string {
  return currencyFromCode(code).symbol;
}

/** Compact Indian-style suffixes — ported from `SettingsService._compact`. */
function compact(n: number): string {
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toFixed(0);
}

export interface FormatOptions {
  showSign?: boolean;
  compact?: boolean;
}

/**
 * Format an amount with the given currency symbol — ported from
 * `SettingsService.format`. JPY/KRW render with no decimals.
 */
export function formatCurrency(
  amount: number,
  code: string | null | undefined,
  options: FormatOptions = {},
): string {
  const currency = currencyFromCode(code);
  const noDecimals = currency.code === 'JPY' || currency.code === 'KRW';
  const magnitude = Math.abs(amount);
  const formatted = options.compact
    ? compact(magnitude)
    : noDecimals
      ? magnitude.toFixed(0)
      : magnitude.toFixed(2);
  const sign = amount < 0 ? '-' : options.showSign && amount > 0 ? '+' : '';
  return `${sign}${currency.symbol}${formatted}`;
}
