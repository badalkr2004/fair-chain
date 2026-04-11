'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useMyProducts } from '@/hooks/use-products';
import { useMyBids } from '@/hooks/use-bids';
import { useFarmerOrders } from '@/hooks/use-orders';
import StatsCard from '@/components/dashboard/StatsCard';
import ProductCard from '@/components/products/ProductCard';
import BidCard from '@/components/bids/BidCard';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { useRespondToBid } from '@/hooks/use-bids';
import { useUIStore } from '@/stores/ui.store';
import Link from 'next/link';
import { Package, Gavel, ShoppingCart, TrendingUp, Plus, ArrowRight } from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useAuthStore();
  const { data: productsData, isLoading: productsLoading } = useMyProducts();
  const { data: ordersData, isLoading: ordersLoading } = useFarmerOrders();
  const respondBid = useRespondToBid();
  const { addToast } = useUIStore();

  const products = productsData?.products || [];
  const orders = ordersData?.orders || [];

  const handleAccept = (id: string) => {
    respondBid.mutate({ id, data: { action: 'ACCEPT' } }, {
      onSuccess: () => addToast({ type: 'success', message: 'Bid accepted!' }),
      onError: () => addToast({ type: 'error', message: 'Failed to accept bid.' }),
    });
  };

  const handleReject = (id: string) => {
    respondBid.mutate({ id, data: { action: 'REJECT' } }, {
      onSuccess: () => addToast({ type: 'success', message: 'Bid rejected.' }),
      onError: () => addToast({ type: 'error', message: 'Failed to reject bid.' }),
    });
  };

  if (productsLoading) return <PageSpinner />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name} 🌾</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Products" value={products.length} icon={<Package className="w-5 h-5" />} color="green" />
        <StatsCard title="Listed" value={products.filter((p) => p.status === 'LISTED').length} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        <StatsCard title="Orders" value={orders.length} icon={<ShoppingCart className="w-5 h-5" />} color="amber" />
        <StatsCard title="Sold" value={products.filter((p) => p.status === 'SOLD').length} icon={<Gavel className="w-5 h-5" />} color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/farmer/products/new">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-green-200 transition-all text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">Add Product</p>
          </div>
        </Link>
        <Link href="/dashboard/farmer/bids">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all text-center">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Gavel className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">View Bids</p>
          </div>
        </Link>
        <Link href="/dashboard/traceability">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all text-center">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">Traceability</p>
          </div>
        </Link>
        <Link href="/dashboard/forecast">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">Market Trends</p>
          </div>
        </Link>
      </div>

      {/* My Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
          <Link href="/dashboard/farmer/products" className="text-sm text-green-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-12 h-12" />}
            title="No products yet"
            description="Start listing your produce to receive bids from intermediaries."
            action={<Link href="/dashboard/farmer/products/new"><Button>Add Your First Product</Button></Link>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
