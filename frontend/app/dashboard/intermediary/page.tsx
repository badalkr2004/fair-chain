'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useMyBids } from '@/hooks/use-bids';
import { useSupplyChains } from '@/hooks/use-supply-chain';
import { useTransactions } from '@/hooks/use-transactions';
import StatsCard from '@/components/dashboard/StatsCard';
import BidCard from '@/components/bids/BidCard';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { useCancelBid } from '@/hooks/use-bids';
import { useUIStore } from '@/stores/ui.store';
import Link from 'next/link';
import { Gavel, Link2, Receipt, Store, ArrowRight } from 'lucide-react';

export default function IntermediaryDashboard() {
  const { user } = useAuthStore();
  const { data: bidsData, isLoading: bidsLoading } = useMyBids();
  const { data: scData } = useSupplyChains();
  const { data: txData } = useTransactions();
  const cancelBid = useCancelBid();
  const { addToast } = useUIStore();

  const bids = bidsData?.data?.bids || [];
  const supplyChains = scData?.data?.supplyChains || [];
  const transactions = txData?.data?.transactions || [];

  if (bidsLoading) return <PageSpinner />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Intermediary Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name} 📊</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Bids" value={bids.filter((b) => b.status === 'PENDING').length} icon={<Gavel className="w-5 h-5" />} color="amber" />
        <StatsCard title="Accepted Bids" value={bids.filter((b) => b.status === 'ACCEPTED').length} icon={<Gavel className="w-5 h-5" />} color="green" />
        <StatsCard title="Supply Chains" value={supplyChains.length} icon={<Link2 className="w-5 h-5" />} color="blue" />
        <StatsCard title="Transactions" value={transactions.length} icon={<Receipt className="w-5 h-5" />} color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/intermediary/marketplace">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all text-center">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Store className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">Browse Products</p>
          </div>
        </Link>
        <Link href="/dashboard/intermediary/bids">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-green-200 transition-all text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Gavel className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">My Bids</p>
          </div>
        </Link>
        <Link href="/dashboard/intermediary/supply-chains">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Link2 className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">Supply Chains</p>
          </div>
        </Link>
        <Link href="/dashboard/intermediary/transactions">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all text-center">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-800">Transactions</p>
          </div>
        </Link>
      </div>

      {/* Recent Bids */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Bids</h2>
          <Link href="/dashboard/intermediary/bids" className="text-sm text-amber-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {bids.length === 0 ? (
          <EmptyState icon={<Gavel className="w-12 h-12" />} title="No bids yet" description="Browse marketplace to place bids on farmer products." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bids.slice(0, 4).map((bid) => (
              <BidCard key={bid.id} bid={bid} mode="intermediary"
                onCancel={(id) => cancelBid.mutate(id, {
                  onSuccess: () => addToast({ type: 'success', message: 'Bid cancelled.' }),
                  onError: () => addToast({ type: 'error', message: 'Failed to cancel bid.' }),
                })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
