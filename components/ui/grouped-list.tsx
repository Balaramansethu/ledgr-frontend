'use client';

import { Children, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Icon } from './icon';
import { cn } from '@/lib/cn';

/** iOS-style grouped list card — ports GroupedList. */
export function GroupedList({ children, className }: { children: ReactNode; className?: string }) {
  const rows = Children.toArray(children);
  return (
    <div className={cn('overflow-hidden rounded-card border border-stroke bg-paper', className)}>
      {rows.map((row, i) => (
        <div key={i}>
          {row}
          {i < rows.length - 1 ? <div className="ml-[52px] h-px bg-stroke" /> : null}
        </div>
      ))}
    </div>
  );
}

/** A single row inside a GroupedList — ports GroupedRow. */
export function GroupedRow({
  icon,
  label,
  trailing,
  onClick,
  iconColor,
}: {
  icon: string;
  label: string;
  trailing?: ReactNode;
  onClick?: () => void;
  iconColor?: string;
}) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={cn(
        'flex min-h-[52px] w-full items-center gap-4 px-4 py-3 text-left',
        onClick && 'transition-colors hover:bg-paper-warm',
      )}
    >
      <Icon name={icon} size={20} style={iconColor ? { color: iconColor } : undefined} className="text-ink" />
      <span className="flex-1 font-medium text-ink">{label}</span>
      {trailing}
      {!trailing && onClick ? <ChevronRight size={20} className="text-ink-soft" /> : null}
    </Wrapper>
  );
}
