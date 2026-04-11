import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; label: string };
  color?: 'green' | 'amber' | 'blue' | 'purple';
}

const colorMap = {
  green: { bg: 'bg-green-50', icon: 'text-green-600', trend: 'text-green-600' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', trend: 'text-amber-600' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', trend: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', trend: 'text-purple-600' },
};

export default function StatsCard({ title, value, icon, trend, color = 'green' }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn('text-xs mt-1', trend.value >= 0 ? c.trend : 'text-red-500')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', c.bg)}>
          <div className={c.icon}>{icon}</div>
        </div>
      </div>
    </Card>
  );
}
