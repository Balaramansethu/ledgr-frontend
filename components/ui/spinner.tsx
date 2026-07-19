import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cn('animate-spin text-terracotta', className)} />;
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <Spinner size={28} />
    </div>
  );
}
