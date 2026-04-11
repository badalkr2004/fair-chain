'use client';

import { useMyProducts, useDeleteProduct } from '@/hooks/use-products';
import ProductCard from '@/components/products/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';

export default function FarmerProductsPage() {
  const { data, isLoading } = useMyProducts();
  const deleteProduct = useDeleteProduct();
  const { addToast } = useUIStore();

  const products = data?.products || [];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 mt-1">{products.length} products listed</p>
        </div>
        <Link href="/dashboard/farmer/products/new">
          <Button><Plus className="w-4 h-4" /> Add Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="w-12 h-12" />}
          title="No products yet"
          description="List your first produce to start receiving bids."
          action={<Link href="/dashboard/farmer/products/new"><Button>Add Product</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
