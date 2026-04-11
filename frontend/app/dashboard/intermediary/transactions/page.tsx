'use client';

import { useTransactions } from '@/hooks/use-transactions';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt } from 'lucide-react';

export default function IntermediaryTransactionsPage() {
  const { data, isLoading } = useTransactions();
  const transactions = data?.data?.transactions || [];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 mt-1">{transactions.length} transactions</p>
      </div>

      {transactions.length === 0 ? (
        <EmptyState icon={<Receipt className="w-12 h-12" />} title="No transactions" description="Transactions are created when bids are accepted or orders placed." />
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <Card key={tx.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{tx.product?.name || tx.type}</h3>
                  <p className="text-sm text-gray-500">{tx.sender?.name} → {tx.receiver?.name}</p>
                </div>
                <StatusBadge status={tx.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{formatDate(tx.createdAt)}</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(tx.amount)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
