'use client';

import { useMyProducts } from '@/hooks/use-products';
import { useRespondToBid } from '@/hooks/use-bids';
import { useUIStore } from '@/stores/ui.store';
import BidCard from '@/components/bids/BidCard';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { Gavel } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import * as bidService from '@/services/bid.service';
import type { Bid } from '@/types';

export default function FarmerBidsPage() {
  const { data: productsData, isLoading: productsLoading } = useMyProducts();
  const products = productsData?.products || [];
  const respondBid = useRespondToBid();
  const { addToast } = useUIStore();

  // Fetch bids for all farmer products
  const { data: allBids, isLoading: bidsLoading } = useQuery({
    queryKey: ['farmer-received-bids', products.map((p) => p.id)],
    queryFn: async () => {
      const results: Bid[] = [];
      for (const product of products) {
        try {
          const res = await bidService.getProductBids(product.id);
          const bids = res.data?.bids || [];
          results.push(...bids.map((b: any) => ({ ...b, product: { id: product.id, name: product.name, category: product.category, quantity: product.quantity, unit: product.unit, basePrice: product.basePrice, status: product.status, images: product.images } })));
        } catch { /* skip */ }
      }
      return results;
    },
    enabled: products.length > 0,
  });

  const bids = allBids || [];
  const pendingBids = bids.filter((b) => b.status === 'PENDING');
  const otherBids = bids.filter((b) => b.status !== 'PENDING');

  const handleAccept = (id: string) => {
    respondBid.mutate({ id, data: { action: 'ACCEPT' } }, {
      onSuccess: () => addToast({ type: 'success', message: 'Bid accepted successfully!' }),
      onError: () => addToast({ type: 'error', message: 'Failed to accept bid.' }),
    });
  };

  const handleReject = (id: string) => {
    respondBid.mutate({ id, data: { action: 'REJECT' } }, {
      onSuccess: () => addToast({ type: 'success', message: 'Bid rejected.' }),
      onError: () => addToast({ type: 'error', message: 'Failed to reject bid.' }),
    });
  };

  if (productsLoading || bidsLoading) return <PageSpinner />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Received Bids</h1>
        <p className="text-gray-500 mt-1">{pendingBids.length} pending, {bids.length} total</p>
      </div>

      {/* Pending */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Bids</h2>
        {pendingBids.length === 0 ? (
          <EmptyState icon={<Gavel className="w-12 h-12" />} title="No pending bids" description="Intermediaries will place bids on your listed products." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingBids.map((bid) => (
              <BidCard key={bid.id} bid={bid} mode="farmer" onAccept={handleAccept} onReject={handleReject} loading={respondBid.isPending} />
            ))}
          </div>
        )}
      </div>

      {/* Past Bids */}
      {otherBids.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Past Bids</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {otherBids.map((bid) => (
              <BidCard key={bid.id} bid={bid} mode="farmer" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
