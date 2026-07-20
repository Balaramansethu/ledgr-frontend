'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ExternalLink, X } from 'lucide-react';

interface ImageViewerContextValue {
  /** Open the lightbox for an image URL. */
  view: (src: string, alt?: string) => void;
}

const ImageViewerContext = createContext<ImageViewerContextValue | null>(null);

/**
 * App-wide image lightbox. Any component can call `useImageViewer().view(url)`
 * to open a sleek, responsive modal that scales the image to the viewport
 * (contained), closes on backdrop click / Escape, and offers open-in-new-tab.
 */
export function ImageViewerProvider({ children }: { children: ReactNode }) {
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState('Image');

  const view = useCallback((nextSrc: string, nextAlt = 'Image') => {
    setSrc(nextSrc);
    setAlt(nextAlt);
  }, []);

  const close = useCallback(() => setSrc(null), []);

  return (
    <ImageViewerContext.Provider value={{ view }}>
      {children}

      <Dialog.Root open={src !== null} onOpenChange={(o) => !o && close()}>
        <Dialog.Portal>
          <Dialog.Overlay className="animate-fade-in fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 focus:outline-none sm:p-8"
            onClick={close}
          >
            <VisuallyHidden asChild>
              <Dialog.Title>{alt}</Dialog.Title>
            </VisuallyHidden>

            <div className="absolute right-3 top-3 flex items-center gap-2">
              {src ? (
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Open original in a new tab"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <ExternalLink size={18} />
                </a>
              ) : null}
              <Dialog.Close
                aria-label="Close image"
                onClick={(e) => e.stopPropagation()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <X size={18} />
              </Dialog.Close>
            </div>

            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt}
                onClick={(e) => e.stopPropagation()}
                className="animate-zoom-in max-h-[86vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              />
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ImageViewerContext.Provider>
  );
}

export function useImageViewer(): ImageViewerContextValue {
  const ctx = useContext(ImageViewerContext);
  if (!ctx) throw new Error('useImageViewer must be used within ImageViewerProvider');
  return ctx;
}
