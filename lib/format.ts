'use client';

import { currencySymbol, formatCurrency, type FormatOptions } from '@ledgr/shared';
import { useAuth } from './auth';

/** Currency formatting bound to the signed-in user's chosen currency. */
export function useCurrency() {
  const { user } = useAuth();
  const code = user?.settings.currencyCode ?? 'INR';
  return {
    code,
    symbol: currencySymbol(code),
    fmt: (amount: number, options?: FormatOptions) => formatCurrency(amount, code, options),
    /** amount without the symbol (for the SerifAmount which renders the symbol separately) */
    plain: (amount: number, options?: FormatOptions) =>
      formatCurrency(amount, code, options).replace(currencySymbol(code), ''),
  };
}
