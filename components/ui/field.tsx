'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, className, id, ...props },
  ref,
) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-muted">{label}</span>
      <input
        ref={ref}
        id={fieldId}
        className={cn(
          'h-11 w-full rounded-sm border border-stroke bg-paper px-3 text-ink outline-none transition-colors',
          'placeholder:text-ink-soft focus:border-terracotta focus:ring-2 focus:ring-terracotta/20',
          className,
        )}
        {...props}
      />
    </label>
  );
});
