import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <Link href={`/dashboard/orders/${order.id}`}>
      <Card hover>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{order.orderId}</h3>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {order.items && order.items.length > 0 && (
          <div className="space-y-2 mb-3">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.product?.name || 'Product'}</span>
                <span className="text-gray-500">{item.quantity} × {formatCurrency(item.unitPrice)}</span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
        </div>
      </Card>
    </Link>
  );
}
