import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as orderService from '@/services/order.service';

export function useMyOrders(status?: string) {
  return useQuery({
    queryKey: ['my-orders', status],
    queryFn: () => orderService.getMyOrders(status),
  });
}

export function useFarmerOrders(status?: string) {
  return useQuery({
    queryKey: ['farmer-orders', status],
    queryFn: () => orderService.getFarmerOrders(status),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; reason?: string } }) =>
      orderService.updateOrderStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      qc.invalidateQueries({ queryKey: ['farmer-orders'] });
    },
  });
}
