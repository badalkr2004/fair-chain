'use client';

import { useMyBids, useCancelBid } from '@/hooks/use-bids';
import BidCard from '@/components/bids/BidCard';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/stores/ui.store';
import { Gavel } from 'lucide-react';

export default function IntermediaryBidsPage() {
  const { data, isLoading } = useMyBids();
  const cancelBid = useCancelBid();
  const { addToast } = useUIStore();

  const bids = data?.data?.bids || [];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
        <p className="text-gray-500 mt-1">{bids.length} total bids</p>
      </div>

      {bids.length === 0 ? (
        <EmptyState icon={<Gavel className="w-12 h-12" />} title="No bids yet" description="Browse the marketplace to place bids on products." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bids.map((bid) => (
            <BidCard key={bid.id} bid={bid} mode="intermediary"
              onCancel={(id) => cancelBid.mutate(id, {
                onSuccess: () => addToast({ type: 'success', message: 'Bid cancelled.' }),
                onError: () => addToast({ type: 'error', message: 'Failed to cancel bid.' }),
              })}
              loading={cancelBid.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
