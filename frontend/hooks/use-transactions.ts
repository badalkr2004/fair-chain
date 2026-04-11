import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as txService from '@/services/transaction.service';

export function useTransactions(filters?: Parameters<typeof txService.getAllTransactions>[0]) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => txService.getAllTransactions(filters),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => txService.getTransactionById(id),
    enabled: !!id,
  });
}

export function useProcessPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { paymentMethod: string; paymentReference: string; amount: number } }) =>
      txService.processPayment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}
