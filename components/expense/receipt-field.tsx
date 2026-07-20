'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { useImageViewer } from '@/components/ui/image-viewer';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';

/**
 * Receipt attach control with a live thumbnail preview, an uploading state,
 * and a remove button. `value` is the hosted URL once uploaded; while a file
 * is uploading a local object-URL preview is shown.
 */
export function ReceiptField({
  value,
  onChange,
  className,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { view } = useImageViewer();
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Revoke the object URL when it changes/unmounts to avoid leaks.
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const preview = localPreview ?? value;

  async function handleFile(file: File) {
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const { url } = await api.upload<{ url: string }>('/uploads/receipt', form);
      onChange(url);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 503
          ? 'Receipt uploads are not configured on this server.'
          : 'Could not upload the receipt.',
      );
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function remove() {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
    onChange(null);
    setError(null);
  }

  return (
    <div className={cn('w-full', className)}>
      {preview ? (
        <div className="flex items-center gap-3 rounded-card border border-stroke bg-paper p-2">
          <button
            type="button"
            onClick={() => !uploading && preview && view(preview, 'Receipt')}
            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-canvas-alt"
            aria-label="View receipt"
            title="View receipt"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Receipt preview" className="h-full w-full object-cover" />
            {uploading ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/45">
                <Loader2 size={18} className="animate-spin text-white" />
              </span>
            ) : null}
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-ink">
              {uploading ? 'Uploading…' : 'Receipt attached'}
            </div>
            <div className="truncate text-xs text-ink-soft">
              {uploading ? 'Hang tight' : 'Tap image to view'}
            </div>
          </div>
          {!uploading ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-sm px-2 py-1 text-xs font-semibold text-terracotta transition-colors hover:bg-orange-pale"
            >
              Replace
            </button>
          ) : null}
          <button
            type="button"
            onClick={remove}
            disabled={uploading}
            aria-label="Remove receipt"
            className="rounded-sm p-2 text-ink-soft transition-colors hover:bg-canvas-alt hover:text-negative disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full border border-stroke bg-paper px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-warm"
        >
          <Camera size={14} /> Attach receipt
        </button>
      )}

      {error ? <p className="mt-1.5 text-sm text-negative">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
