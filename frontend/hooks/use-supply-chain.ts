import { useQuery } from '@tanstack/react-query';
import * as scService from '@/services/supply-chain.service';

export function useSupplyChains(params?: { productId?: string; isComplete?: boolean }) {
  return useQuery({
    queryKey: ['supply-chains', params],
    queryFn: () => scService.getAllSupplyChains(params),
  });
}

export function useSupplyChain(id: string) {
  return useQuery({
    queryKey: ['supply-chain', id],
    queryFn: () => scService.getSupplyChainById(id),
    enabled: !!id,
  });
}

export function useProductSupplyChain(productId: string) {
  return useQuery({
    queryKey: ['product-supply-chain', productId],
    queryFn: () => scService.getProductSupplyChain(productId),
    enabled: !!productId,
  });
}
