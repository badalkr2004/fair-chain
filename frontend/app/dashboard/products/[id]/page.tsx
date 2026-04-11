'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/use-products';
import { useProductBids, useRespondToBid } from '@/hooks/use-bids';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import BidCard from '@/components/bids/BidCard';
import { PageSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, getCategoryIcon } from '@/lib/utils';
import { ArrowLeft, MapPin, Package, Calendar } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const { data: productData, isLoading: productLoading } = useProduct(resolvedParams.id);
  const { data: bidsData, isLoading: bidsLoading } = useProductBids(resolvedParams.id);
  const respondBid = useRespondToBid();

  const product = productData?.product;
  const bids = bidsData?.data?.bids || [];

  if (productLoading || bidsLoading) return <PageSpinner />;
  if (!product) return <EmptyState title="Product not found" />;

  const isOwner = user?.id === product.farmerId;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card padding={false} className="overflow-hidden bg-white">
            <div className="relative aspect-video bg-gray-100 border-b border-gray-100">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-300" />
                </div>
              )}
              {product.organicCertified && (
                <span className="absolute top-4 left-4 bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  🌿 Organic Certified
                </span>
              )}
              <div className="absolute top-4 right-4">
                <StatusBadge status={product.status} className="shadow-sm" />
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">{getCategoryIcon(product.category)} {product.category}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {product.farmer?.farmerProfile?.farmLocation || 'Location unverified'}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> Harvested: {product.harvestDate ? formatDate(product.harvestDate) : 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Base Price</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(product.basePrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Final Price</p>
                  <p className="text-lg font-bold text-green-700">{product.finalPrice ? formatCurrency(product.finalPrice) : 'TBD'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available Qty</p>
                  <p className="text-lg font-semibold text-gray-900">{product.quantity} {product.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Listed On</p>
                  <p className="text-sm font-medium text-gray-900 leading-snug pt-1">{formatDate(product.createdAt)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description || 'No description provided for this product.'}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Farmer Info</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                {product.farmer?.name?.charAt(0) || 'F'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{product.farmer?.name || 'Unknown Farmer'}</p>
                <p className="text-xs text-gray-500">Verified Seller</p>
              </div>
            </div>
            {product.farmer?.farmerProfile?.farmSize && (
              <div className="text-sm text-gray-600 space-y-2">
                <p>Farm Size: {product.farmer.farmerProfile.farmSize} acres</p>
                {product.farmer.farmerProfile.certifications && (
                  <p>Certs: {product.farmer.farmerProfile.certifications.join(', ')}</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {isOwner && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Bids ({bids.length})</h3>
          {bids.length === 0 ? (
            <Card className="text-center py-8 text-gray-500">No bids received yet.</Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  mode="farmer"
                  onAccept={(id) => respondBid.mutate({ id, data: { action: 'ACCEPT' } }, { onSuccess: () => addToast({ type: 'success', message: 'Bid accepted!' }) })}
                  onReject={(id) => respondBid.mutate({ id, data: { action: 'REJECT' } }, { onSuccess: () => addToast({ type: 'success', message: 'Bid rejected.' }) })}
                  loading={respondBid.isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
