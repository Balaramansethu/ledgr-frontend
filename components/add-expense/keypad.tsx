'use client';

import { Delete } from 'lucide-react';

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

/** Numeric keypad — ports the quick-tap sheet keypad. */
export function Keypad({ onPress }: { onPress: (key: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-2">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onPress(key)}
              className="flex h-14 flex-1 items-center justify-center rounded-md border border-stroke bg-paper text-xl font-semibold text-ink transition-colors hover:bg-paper-warm active:bg-canvas-alt"
              aria-label={key === '⌫' ? 'Delete' : key}
            >
              {key === '⌫' ? <Delete size={22} /> : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Apply a keypad press to the current amount string (ports _press logic). */
export function applyKey(input: string, key: string): string {
  if (key === '⌫') return input.slice(0, -1);
  if (key === '.') {
    if (input.includes('.')) return input;
    return input === '' ? '0.' : `${input}.`;
  }
  // digit
  if (input.includes('.')) {
    const decimals = input.split('.')[1] ?? '';
    if (decimals.length >= 2) return input;
  }
  if (input === '0') return key;
  return input + key;
}
