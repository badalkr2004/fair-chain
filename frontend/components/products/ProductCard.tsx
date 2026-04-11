import Link from 'next/link';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Product } from '@/types';
import { formatCurrency, getCategoryIcon } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  showFarmer?: boolean;
  actionSlot?: React.ReactNode;
}

export default function ProductCard({ product, showFarmer = false, actionSlot }: ProductCardProps) {
  return (
    <Link href={`/dashboard/products/${product.id}`}>
      <Card hover className="overflow-hidden p-0">
        <div className="aspect-[4/3] bg-gray-100 relative">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {getCategoryIcon(product.category)}
            </div>
          )}
          {product.organicCertified && (
            <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              🌿 Organic
            </span>
          )}
          <div className="absolute top-3 right-3">
            <StatusBadge status={product.status} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
            <span className="text-xs text-gray-500 shrink-0 ml-2">{getCategoryIcon(product.category)} {product.category}</span>
          </div>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description || 'No description'}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-green-700">{formatCurrency(product.finalPrice || product.basePrice)}</p>
              <p className="text-xs text-gray-500">per {product.unit}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{product.quantity} {product.unit}</p>
              <p className="text-xs text-gray-500">available</p>
            </div>
          </div>
          {showFarmer && product.farmer && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-700">
                {product.farmer.name?.charAt(0)}
              </div>
              <span className="text-sm text-gray-600">{product.farmer.name}</span>
            </div>
          )}
          {actionSlot && (
            <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.preventDefault()}>
              {actionSlot}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
