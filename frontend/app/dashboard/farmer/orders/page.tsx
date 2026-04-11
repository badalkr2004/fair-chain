'use client';

import { useFarmerOrders } from '@/hooks/use-orders';
import OrderCard from '@/components/orders/OrderCard';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { ShoppingCart } from 'lucide-react';

export default function FarmerOrdersPage() {
  const { data, isLoading } = useFarmerOrders();
  const orders = data?.orders || [];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} orders received</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={<ShoppingCart className="w-12 h-12" />} title="No orders yet" description="Orders will appear here when consumers purchase your products." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
