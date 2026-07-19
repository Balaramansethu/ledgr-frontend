'use client';

import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Warm paper card — hairline border, no shadow (the Ledgr surface). */
export function PaperCard({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const base = 'rounded-card border border-stroke bg-paper';
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(base, 'w-full text-left transition-colors hover:bg-paper-warm', className)}
      >
        {children}
      </button>
    );
  }
  return <div className={cn(base, className)}>{children}</div>;
}

/** Small sentence-case section heading used between cards. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn('px-1 text-sm font-semibold tracking-tight text-ink-muted', className)}>
      {children}
    </h2>
  );
}

/** Large serif hero amount — the signature Ledgr number. */
export function SerifAmount({
  value,
  symbol,
  className,
  color,
}: {
  value: string;
  symbol?: string;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={cn('inline-flex items-baseline font-serif font-semibold leading-none tnum', className)}
      style={color ? { color } : undefined}
    >
      {symbol ? <span className="mr-[0.06em]">{symbol}</span> : null}
      <span>{value}</span>
    </span>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

/** Circular initials avatar in a warm terracotta tint. */
export function AvatarBubble({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-stroke bg-orange-soft font-bold text-terracotta-deep',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}

/** Trend pill — small green/red delta chip. */
export function TrendPill({ text, positive = true }: { text: string; positive?: boolean }) {
  const Arrow = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
        positive ? 'bg-positive/12 text-positive' : 'bg-negative/12 text-negative',
      )}
    >
      <Arrow size={12} />
      {text}
    </span>
  );
}

/** Thin, animated progress bar with a terracotta gradient fill. */
export function ProgressBar({
  fraction,
  className,
  fromColor,
  toColor,
}: {
  fraction: number;
  className?: string;
  fromColor?: string;
  toColor?: string;
}) {
  const pct = Math.max(0, Math.min(1, fraction)) * 100;
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-orange-pale', className)}>
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{
          width: `${pct}%`,
          backgroundImage: `linear-gradient(90deg, ${fromColor ?? '#FF9D5C'}, ${toColor ?? 'var(--terracotta)'})`,
        }}
      />
    </div>
  );
}
