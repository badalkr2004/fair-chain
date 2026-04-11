'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useMyOrders } from '@/hooks/use-orders';
import StatsCard from '@/components/dashboard/StatsCard';
import OrderCard from '@/components/orders/OrderCard';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import Link from 'next/link';
import { ShoppingCart, Store, ArrowRight, PackageCheck, Search } from 'lucide-react';

export default function ConsumerDashboard() {
  const { user } = useAuthStore();
  const { data: ordersData, isLoading: ordersLoading } = useMyOrders();

  const orders = ordersData?.orders || [];

  if (ordersLoading) return <PageSpinner />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consumer Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name} 🛒</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Orders" value={orders.length} icon={<ShoppingCart className="w-5 h-5" />} color="blue" />
        <StatsCard title="In Transit" value={orders.filter((o) => o.status === 'IN_TRANSIT').length} icon={<PackageCheck className="w-5 h-5" />} color="purple" />
        <StatsCard title="Delivered" value={orders.filter((o) => o.status === 'DELIVERED').length} icon={<PackageCheck className="w-5 h-5" />} color="green" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard/consumer/marketplace">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">Browse Marketplace</p>
          </div>
        </Link>
        <Link href="/dashboard/consumer/orders">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-green-200 transition-all text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">My Orders</p>
          </div>
        </Link>
        <Link href="/dashboard/traceability">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all text-center">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">Trace Product</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/consumer/orders" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <EmptyState icon={<ShoppingCart className="w-12 h-12" />} title="No orders yet" description="Explore the marketplace to find fresh produce directly from farmers." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {orders.slice(0, 4).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
