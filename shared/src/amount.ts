/**
 * Amount input helpers — ported from `lib/ui/widgets/amount_input_formatter.dart`.
 * Thousand separators as you type, one decimal point, max 2 decimals.
 */

const GROUP = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** Format keystrokes into a grouped display string ("1,250.5"). */
export function formatAmountInput(raw: string): string {
  if (!raw) return '';

  // Keep only digits and the decimal point.
  let cleaned = raw.replace(/[^0-9.]/g, '');

  // Allow only one decimal point.
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
  }

  // Trim to 2 decimal places.
  if (firstDot !== -1 && cleaned.length - firstDot - 1 > 2) {
    cleaned = cleaned.slice(0, firstDot + 3);
  }

  const parts = cleaned.split('.');
  let intPart = (parts[0] ?? '').replace(/^0+(?=\d)/, '');
  const hasDecimals = parts.length > 1;
  const decimals = parts[1] ?? '';

  if (intPart === '') {
    // Nothing before the dot: preserve a bare ".5" while the user types.
    return hasDecimals ? `.${decimals}` : '';
  }
  if (intPart === '0') {
    return hasDecimals ? `0.${decimals}` : '0';
  }

  const intNum = Number.parseInt(intPart, 10);
  const intFormatted = Number.isNaN(intNum) ? intPart : GROUP.format(intNum);
  return hasDecimals ? `${intFormatted}.${decimals}` : intFormatted;
}

/** Parse a formatted string ("1,250.50") back to a number for saving. */
export function parseAmount(s: string): number | null {
  const cleaned = s.replace(/,/g, '').trim();
  if (cleaned === '') return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/** Format a number back to display form for pre-filling an edit field. */
export function formatAmount(v: number): string {
  if (v === Math.trunc(v)) return GROUP.format(v);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}
