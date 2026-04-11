import { useQuery } from '@tanstack/react-query';
import * as traceService from '@/services/traceability.service';

export function useProductTraceability(productId: string) {
  return useQuery({
    queryKey: ['traceability', productId],
    queryFn: () => traceService.getProductTraceability(productId),
    enabled: !!productId,
  });
}

export function useTraceabilityRecord(identifier: string) {
  return useQuery({
    queryKey: ['traceability-record', identifier],
    queryFn: () => traceService.getTraceabilityRecord(identifier),
    enabled: !!identifier,
  });
}

export function useVerifyTraceability(recordId: string) {
  return useQuery({
    queryKey: ['verify-traceability', recordId],
    queryFn: () => traceService.verifyTraceability(recordId),
    enabled: !!recordId,
  });
}
