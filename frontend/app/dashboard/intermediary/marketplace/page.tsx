'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/use-products';
import { useCreateBid } from '@/hooks/use-bids';
import ProductCard from '@/components/products/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { useUIStore } from '@/stores/ui.store';
import { PRODUCT_CATEGORIES, SERVICE_TYPES } from '@/lib/constants';
import { Store, X } from 'lucide-react';
import type { Product } from '@/types';

export default function IntermediaryMarketplacePage() {
  const [category, setCategory] = useState('');
  const { data, isLoading } = useProducts(category ? { category, status: 'LISTED' } : { status: 'LISTED' });
  const createBid = useCreateBid();
  const { addToast } = useUIStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bidForm, setBidForm] = useState({ price: '', quantity: '', serviceType: 'LOGISTICS', description: '', validUntil: '' });

  const products = data?.products || [];

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    createBid.mutate({
      productId: selectedProduct.id,
      price: Number(bidForm.price),
      quantity: Number(bidForm.quantity),
      serviceType: bidForm.serviceType,
      description: bidForm.description,
      validUntil: bidForm.validUntil,
    }, {
      onSuccess: () => {
        addToast({ type: 'success', message: 'Bid placed successfully!' });
        setSelectedProduct(null);
        setBidForm({ price: '', quantity: '', serviceType: 'LOGISTICS', description: '', validUntil: '' });
      },
      onError: (err: any) => addToast({ type: 'error', message: err.response?.data?.message || 'Failed to place bid.' }),
    });
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-500 mt-1">Browse and bid on farmer products</p>
        </div>
        <Select
          options={[{ value: '', label: 'All Categories' }, ...PRODUCT_CATEGORIES]}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Bid Modal */}
      {selectedProduct && (
        <Card className="border-amber-200 bg-amber-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Place Bid on {selectedProduct.name}</h3>
            <button onClick={() => setSelectedProduct(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handlePlaceBid} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price per unit (₹)" type="number" value={bidForm.price} onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })} />
              <Input label="Quantity" type="number" value={bidForm.quantity} onChange={(e) => setBidForm({ ...bidForm, quantity: e.target.value })} />
            </div>
            <Select label="Service Type" options={[...SERVICE_TYPES]} value={bidForm.serviceType} onChange={(e) => setBidForm({ ...bidForm, serviceType: e.target.value })} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" rows={3} placeholder="Describe your bid..." value={bidForm.description} onChange={(e) => setBidForm({ ...bidForm, description: e.target.value })} />
            </div>
            <Input label="Valid Until" type="date" value={bidForm.validUntil} onChange={(e) => setBidForm({ ...bidForm, validUntil: e.target.value })} />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setSelectedProduct(null)}>Cancel</Button>
              <Button type="submit" variant="secondary" loading={createBid.isPending}>Place Bid</Button>
            </div>
          </form>
        </Card>
      )}

      {products.length === 0 ? (
        <EmptyState icon={<Store className="w-12 h-12" />} title="No products available" description="Check back later for new listings from farmers." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showFarmer
              actionSlot={
                <Button size="sm" variant="secondary" className="w-full" onClick={() => setSelectedProduct(product)}>
                  Place Bid
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
