'use client';

import { useSupplyChains } from '@/hooks/use-supply-chain';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';
import { Link2 } from 'lucide-react';

export default function IntermediarySupplyChainsPage() {
  const { data, isLoading } = useSupplyChains();
  const supplyChains = data?.data?.supplyChains || [];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Supply Chains</h1>
        <p className="text-gray-500 mt-1">{supplyChains.length} supply chains</p>
      </div>

      {supplyChains.length === 0 ? (
        <EmptyState icon={<Link2 className="w-12 h-12" />} title="No supply chains" description="Supply chains are created when bids are accepted." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {supplyChains.map((sc) => (
            <Card key={sc.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{sc.name || sc.product?.name || 'Supply Chain'}</h3>
                  <p className="text-sm text-gray-500">{sc.product?.category} • {sc.product?.farmer?.name}</p>
                </div>
                <StatusBadge status={sc.isComplete ? 'COMPLETED' : 'IN_TRANSIT'} />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Started: {formatDate(sc.startDate)}</span>
                <span>{sc.links?.length || 0} links</span>
              </div>
              {sc.links && sc.links.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    {sc.links.map((link, i) => (
                      <div key={link.id} className="flex items-center">
                        <div className="h-2 w-8 bg-green-500 rounded-full" />
                        {i < sc.links!.length - 1 && <div className="h-0.5 w-4 bg-gray-300" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
