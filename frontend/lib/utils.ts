import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getStatusColor(status: string): { bg: string; text: string; dot: string } {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    IN_TRANSIT: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    FAILED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    ACCEPTED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    REJECTED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    EXPIRED: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
    LISTED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    DRAFT: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
    SOLD: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    PROCESSING: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
    PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  };
  return map[status] || { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    GRAINS: '🌾',
    VEGETABLES: '🥬',
    FRUITS: '🍎',
    DAIRY: '🥛',
    MEAT: '🥩',
    POULTRY: '🍗',
    OTHER: '📦',
  };
  return map[category] || '📦';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}
