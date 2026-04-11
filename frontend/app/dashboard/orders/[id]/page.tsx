'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder, useUpdateOrderStatus } from '@/hooks/use-orders';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { PageSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, ShoppingCart, MapPin, Truck } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const { data: orderData, isLoading } = useOrder(resolvedParams.id);
  const updateStatus = useUpdateOrderStatus();

  const order = orderData?.order;

  if (isLoading) return <PageSpinner />;
  if (!order) return <EmptyState title="Order not found" />;

  const isFarmer = user?.role === 'FARMER';
  const canUpdateStatus = isFarmer && ['PENDING', 'CONFIRMED', 'IN_TRANSIT'].includes(order.status);

  const handleUpdateStatus = (status: string) => {
    updateStatus.mutate({ id: order.id, data: { status } }, {
      onSuccess: () => addToast({ type: 'success', message: `Order marked as ${status}` }),
      onError: () => addToast({ type: 'error', message: 'Failed to update order status.' }),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderId}</h1>
          <p className="text-gray-500 text-sm">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-gray-500"/> Order Items</h3>
              <StatusBadge status={order.status} />
            </div>
            
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      {item.product?.images?.[0] && <img src={item.product?.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.product?.name || 'Product deleted'}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.unitPrice)} × {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(item.unitPrice * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-50">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500"/> Delivery Details</h3>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
              {typeof order.deliveryAddress === 'object' && order.deliveryAddress ? (
                <>
                  <p>{(order.deliveryAddress as any).street}</p>
                  <p>{(order.deliveryAddress as any).city}, {(order.deliveryAddress as any).state} {(order.deliveryAddress as any).pincode}</p>
                </>
              ) : (
                <p>No address provided.</p>
              )}
            </div>
            {order.notes && (
              <div className="mt-4 text-sm">
                <p className="font-medium text-gray-700 mb-1">Notes</p>
                <p className="text-gray-600 bg-amber-50 p-2 rounded line-clamp-3">{order.notes}</p>
              </div>
            )}
          </Card>

          {isFarmer && canUpdateStatus && (
            <Card className="border-green-200 bg-green-50/30">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-green-600"/> Update Status</h3>
              <div className="space-y-2">
                {order.status === 'PENDING' && (
                  <Button className="w-full text-justify justify-center" onClick={() => handleUpdateStatus('CONFIRMED')} loading={updateStatus.isPending}>
                    Mark as Confirmed
                  </Button>
                )}
                {order.status === 'CONFIRMED' && (
                  <Button className="w-full text-justify justify-center" onClick={() => handleUpdateStatus('IN_TRANSIT')} loading={updateStatus.isPending}>
                    Mark as In Transit
                  </Button>
                )}
                {order.status === 'IN_TRANSIT' && (
                  <Button className="w-full text-justify justify-center" onClick={() => handleUpdateStatus('DELIVERED')} loading={updateStatus.isPending}>
                    Confirm Delivery
                  </Button>
                )}
              </div>
            </Card>
          )}

          {!isFarmer && order.status === 'IN_TRANSIT' && (
            <Card className="border-blue-200 bg-blue-50/30">
              <h3 className="font-semibold text-gray-900 mb-3">Order Received?</h3>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-center" onClick={() => handleUpdateStatus('DELIVERED')} loading={updateStatus.isPending}>
                Confirm Delivery
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
