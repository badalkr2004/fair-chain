import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Bid } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface BidCardProps {
  bid: Bid;
  mode: 'farmer' | 'intermediary';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  loading?: boolean;
}

export default function BidCard({ bid, mode, onAccept, onReject, onCancel, loading }: BidCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{bid.product?.name || 'Product'}</h3>
          <p className="text-sm text-gray-500">
            {mode === 'farmer'
              ? `By ${bid.intermediary?.name || 'Intermediary'}`
              : `For ${bid.product?.farmer?.name || 'Farmer'}'s product`}
          </p>
        </div>
        <StatusBadge status={bid.status} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500">Bid Price</p>
          <p className="text-sm font-semibold text-green-700">{formatCurrency(bid.price)}/unit</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Quantity</p>
          <p className="text-sm font-medium text-gray-800">{bid.quantity}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Service</p>
          <p className="text-sm font-medium text-gray-800">{bid.serviceType}</p>
        </div>
      </div>

      {bid.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{bid.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Valid until {formatDate(bid.validUntil)}</span>
        <span>Total: {formatCurrency(bid.price * bid.quantity)}</span>
      </div>

      {bid.status === 'PENDING' && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
          {mode === 'farmer' && (
            <>
              <Button size="sm" onClick={() => onAccept?.(bid.id)} loading={loading} className="flex-1">Accept</Button>
              <Button size="sm" variant="danger" onClick={() => onReject?.(bid.id)} loading={loading} className="flex-1">Reject</Button>
            </>
          )}
          {mode === 'intermediary' && (
            <Button size="sm" variant="outline" onClick={() => onCancel?.(bid.id)} loading={loading} className="flex-1">Cancel Bid</Button>
          )}
        </div>
      )}

      {bid.responseReason && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Response: {bid.responseReason}</p>
        </div>
      )}
    </Card>
  );
}
