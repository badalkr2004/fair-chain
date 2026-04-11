import apiClient from '@/lib/api-client';
import type { Order } from '@/types';
import type { CreateOrderInput } from '@/schemas/order.schema';

export async function createOrder(data: CreateOrderInput): Promise<{ order: Order; transaction: unknown }> {
  const res = await apiClient.post('/orders', data);
  return res.data;
}

export async function getOrderById(id: string): Promise<{ order: Order }> {
  const res = await apiClient.get(`/orders/${id}`);
  return res.data;
}

export async function updateOrderStatus(id: string, data: { status: string; reason?: string }): Promise<{ order: Order }> {
  const res = await apiClient.patch(`/orders/${id}/status`, data);
  return res.data;
}

export async function getMyOrders(status?: string): Promise<{ orders: Order[] }> {
  const res = await apiClient.get('/orders/my/orders', { params: status ? { status } : undefined });
  return res.data;
}

export async function getFarmerOrders(status?: string): Promise<{ orders: Order[] }> {
  const res = await apiClient.get('/orders/farmer/orders', { params: status ? { status } : undefined });
  return res.data;
}

export async function getAllOrders(status?: string): Promise<{ orders: Order[] }> {
  const res = await apiClient.get('/orders', { params: status ? { status } : undefined });
  return res.data;
}
