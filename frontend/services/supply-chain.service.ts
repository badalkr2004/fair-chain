import apiClient from '@/lib/api-client';
import type { SupplyChain, SupplyChainLink, Pagination } from '@/types';

export async function getAllSupplyChains(params?: { productId?: string; isComplete?: boolean; limit?: number; page?: number }): Promise<{ data: { supplyChains: SupplyChain[]; pagination: Pagination } }> {
  const res = await apiClient.get('/supply-chain', { params });
  return res.data;
}

export async function getSupplyChainById(id: string): Promise<{ data: SupplyChain }> {
  const res = await apiClient.get(`/supply-chain/${id}`);
  return res.data;
}

export async function createSupplyChain(data: { name: string; description?: string; productId: string; startDate: string; endDate?: string }): Promise<{ data: SupplyChain }> {
  const res = await apiClient.post('/supply-chain', data);
  return res.data;
}

export async function updateSupplyChain(id: string, data: Partial<SupplyChain>): Promise<{ data: SupplyChain }> {
  const res = await apiClient.put(`/supply-chain/${id}`, data);
  return res.data;
}

export async function deleteSupplyChain(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete(`/supply-chain/${id}`);
  return res.data;
}

export async function addSupplyChainLink(id: string, data: Record<string, unknown>): Promise<{ data: SupplyChainLink }> {
  const res = await apiClient.post(`/supply-chain/${id}/links`, data);
  return res.data;
}

export async function getProductSupplyChain(productId: string): Promise<{ data: SupplyChain }> {
  const res = await apiClient.get(`/supply-chain/product/${productId}`);
  return res.data;
}
