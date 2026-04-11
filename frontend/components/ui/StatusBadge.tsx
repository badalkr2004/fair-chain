import { cn, getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = getStatusColor(status);
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', colors.bg, colors.text, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
