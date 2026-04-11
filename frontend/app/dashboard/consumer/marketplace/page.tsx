'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/use-products';
import { useCreateOrder } from '@/hooks/use-orders';
import ProductCard from '@/components/products/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { useUIStore } from '@/stores/ui.store';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Store, X, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

export default function ConsumerMarketplacePage() {
  const [category, setCategory] = useState('');
  const { data, isLoading } = useProducts(category ? { category, status: 'LISTED' } : { status: 'LISTED' });
  const createOrder = useCreateOrder();
  const { addToast } = useUIStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState({ quantity: 1, street: '', city: '', state: '', pincode: '', notes: '' });

  const products = data?.products || [];

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    // In a real app, this might go to a cart first or create an order via a payment gateway
    createOrder.mutate({
      items: [{ productId: selectedProduct.id, quantity: Number(orderForm.quantity) }],
      deliveryAddress: { street: orderForm.street, city: orderForm.city, state: orderForm.state, pincode: orderForm.pincode },
      notes: orderForm.notes
    }, {
      onSuccess: () => {
        addToast({ type: 'success', message: 'Order placed successfully!' });
        setSelectedProduct(null);
        setOrderForm({ quantity: 1, street: '', city: '', state: '', pincode: '', notes: '' });
      },
      onError: (err: any) => addToast({ type: 'error', message: err.response?.data?.message || 'Failed to place order.' }),
    });
  };

  const totalPrice = selectedProduct ? (selectedProduct.finalPrice || selectedProduct.basePrice) * orderForm.quantity : 0;

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-500 mt-1">Buy directly from verified farmers</p>
        </div>
        <Select
          options={[{ value: '', label: 'All Categories' }, ...PRODUCT_CATEGORIES]}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Order Modal */}
      {selectedProduct && (
        <Card className="border-blue-200 bg-blue-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Buy {selectedProduct.name}</h3>
            <button onClick={() => setSelectedProduct(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
               <span className="font-medium text-gray-700">{formatCurrency(selectedProduct.finalPrice || selectedProduct.basePrice)} / {selectedProduct.unit}</span>
               <div className="flex items-center gap-2">
                 <Button type="button" variant="outline" size="sm" onClick={() => setOrderForm(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}>-</Button>
                 <span className="w-8 text-center font-semibold">{orderForm.quantity}</span>
                 <Button type="button" variant="outline" size="sm" onClick={() => setOrderForm(p => ({ ...p, quantity: Math.min(selectedProduct.quantity, p.quantity + 1) }))}>+</Button>
               </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Address</h4>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Street Address" value={orderForm.street} onChange={(e) => setOrderForm(p => ({...p, street: e.target.value}))} className="col-span-2" required />
                <Input placeholder="City" value={orderForm.city} onChange={(e) => setOrderForm(p => ({...p, city: e.target.value}))} required />
                <Input placeholder="State" value={orderForm.state} onChange={(e) => setOrderForm(p => ({...p, state: e.target.value}))} required />
                <Input placeholder="PIN Code" value={orderForm.pincode} onChange={(e) => setOrderForm(p => ({...p, pincode: e.target.value}))} required />
              </div>
            </div>

            <Input placeholder="Delivery Notes (Optional)" value={orderForm.notes} onChange={(e) => setOrderForm(p => ({...p, notes: e.target.value}))} />
            
            <div className="flex items-center justify-between pt-4 border-t border-blue-100">
              <span className="text-sm text-gray-500">Total Amount:</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(totalPrice)}</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setSelectedProduct(null)}>Cancel</Button>
              <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" loading={createOrder.isPending}>
                Pay & Place Order
              </Button>
            </div>
          </form>
        </Card>
      )}

      {products.length === 0 ? (
        <EmptyState icon={<Store className="w-12 h-12" />} title="No products available" description="Check back later for fresh produce." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showFarmer
              actionSlot={
                <Button size="sm" variant="primary" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setSelectedProduct(product)}>
                  <ShoppingCart className="w-4 h-4 mr-2"/> Buy Now
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
