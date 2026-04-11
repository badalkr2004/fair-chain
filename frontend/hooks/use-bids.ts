import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as bidService from '@/services/bid.service';
import type { CreateBidInput, RespondBidInput } from '@/schemas/bid.schema';

export function useProductBids(productId: string, params?: { status?: string }) {
  return useQuery({
    queryKey: ['product-bids', productId, params],
    queryFn: () => bidService.getProductBids(productId, params),
    enabled: !!productId,
  });
}

export function useMyBids(params?: { status?: string; limit?: number; page?: number }) {
  return useQuery({
    queryKey: ['my-bids', params],
    queryFn: () => bidService.getMyBids(params),
  });
}

export function useCreateBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBidInput) => bidService.createBid(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bids'] });
      qc.invalidateQueries({ queryKey: ['product-bids'] });
    },
  });
}

export function useRespondToBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RespondBidInput }) => bidService.respondToBid(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-bids'] });
      qc.invalidateQueries({ queryKey: ['my-bids'] });
      qc.invalidateQueries({ queryKey: ['my-products'] });
    },
  });
}

export function useCancelBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bidService.cancelBid,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bids'] }),
  });
}
