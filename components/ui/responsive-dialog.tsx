'use client';

import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';
import { useIsDesktop } from '@/lib/use-media-query';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  hideTitle?: boolean;
  children: ReactNode;
  /** Extra classes for the content panel. */
  className?: string;
}

/**
 * A modal that adapts to the viewport: a centered dialog on desktop, a bottom
 * drawer on mobile — the web translation of the Flutter bottom sheets.
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  hideTitle,
  children,
  className,
}: Props) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in" />
          <Dialog.Content
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
              'rounded-sheet border border-stroke bg-canvas p-5 focus:outline-none',
              'max-h-[85dvh] overflow-y-auto',
              className,
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              {hideTitle ? (
                <VisuallyHidden asChild>
                  <Dialog.Title>{title}</Dialog.Title>
                </VisuallyHidden>
              ) : (
                <Dialog.Title className="text-lg font-bold text-ink">{title}</Dialog.Title>
              )}
              <Dialog.Close
                aria-label="Close"
                className="-mr-1 -mt-1 rounded-sm p-1.5 text-ink-soft transition-colors hover:bg-canvas-alt hover:text-ink"
              >
                <X size={18} />
              </Dialog.Close>
            </div>
            {description ? (
              <Dialog.Description className="sr-only">{description}</Dialog.Description>
            ) : null}
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[92dvh] flex-col rounded-t-sheet border-t border-stroke bg-canvas',
            className,
          )}
        >
          <div className="mx-auto mt-3 h-1 w-11 shrink-0 rounded-full bg-ink-soft/35" />
          <div className="overflow-y-auto px-4 pb-8 pt-3">
            {hideTitle ? (
              <VisuallyHidden asChild>
                <Drawer.Title>{title}</Drawer.Title>
              </VisuallyHidden>
            ) : (
              <Drawer.Title className="mb-3 text-center text-base font-bold text-ink">
                {title}
              </Drawer.Title>
            )}
            {description ? <Drawer.Description className="sr-only">{description}</Drawer.Description> : null}
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
