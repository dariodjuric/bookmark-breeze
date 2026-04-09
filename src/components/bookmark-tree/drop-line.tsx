import { getDepthPadding } from '@/lib/depth-calculation';
import { cn } from '@/lib/tailwind';

interface DropLineProps {
  depth: number;
  side: 'top' | 'bottom';
}

export default function DropLine({ depth, side }: DropLineProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute right-2 z-10 h-0.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]',
        side === 'top' ? '-top-px' : '-bottom-px'
      )}
      style={{ left: getDepthPadding(depth) }}
    >
      <div className="absolute -left-1 -top-0.75 h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_var(--color-primary)]" />
    </div>
  );
}
