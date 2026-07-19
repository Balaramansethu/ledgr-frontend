'use client';

import { icons, type LucideProps } from 'lucide-react';

function toPascal(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

interface IconProps extends LucideProps {
  /** lucide icon name in kebab-case, e.g. "shopping-bag". */
  name: string;
}

/** Render a lucide icon by (kebab-case) name, with a safe fallback. */
export function Icon({ name, ...props }: IconProps) {
  const Cmp = icons[toPascal(name) as keyof typeof icons] ?? icons.Circle;
  return <Cmp {...props} />;
}

/** Curated icon set offered when creating a custom category. */
export const CATEGORY_ICON_CHOICES = [
  'utensils', 'coffee', 'car', 'bus', 'plane', 'shopping-bag', 'shopping-cart', 'gift',
  'receipt-text', 'zap', 'wifi', 'phone', 'heart', 'pill', 'dumbbell', 'film',
  'music', 'gamepad-2', 'book', 'graduation-cap', 'home', 'dog', 'baby', 'shirt',
  'fuel', 'plug', 'briefcase', 'piggy-bank', 'landmark', 'hand-coins', 'sparkles', 'ellipsis',
];
