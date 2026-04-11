import apiClient from '@/lib/api-client';
import type { Product, Pagination } from '@/types';

interface ProduceFilters {
  category?: string;
  status?: string;
  sort?: string;
  order?: string;
  limit?: number;
  page?: number;
}

export async function getAllProduce(filters?: ProduceFilters): Promise<{ data: { produce: Product[]; pagination: Pagination } }> {
  const res = await apiClient.get('/produce', { params: filters });
  return res.data;
}

export async function getProduceById(id: string): Promise<{ data: Product }> {
  const res = await apiClient.get(`/produce/${id}`);
  return res.data;
}

export async function createProduce(data: Record<string, unknown>): Promise<{ data: Product }> {
  const res = await apiClient.post('/produce', data);
  return res.data;
}

export async function updateProduce(id: string, data: Record<string, unknown>): Promise<{ data: Product }> {
  const res = await apiClient.put(`/produce/${id}`, data);
  return res.data;
}

export async function deleteProduce(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete(`/produce/${id}`);
  return res.data;
}

export async function getMyProduce(filters?: ProduceFilters): Promise<{ data: { produce: Product[]; pagination: Pagination } }> {
  const res = await apiClient.get('/produce/farmer/me', { params: filters });
  return res.data;
}

export async function getProduceByFarmer(farmerId: string, filters?: ProduceFilters): Promise<{ data: { produce: Product[]; pagination: Pagination } }> {
  const res = await apiClient.get(`/produce/farmer/${farmerId}`, { params: filters });
  return res.data;
}
