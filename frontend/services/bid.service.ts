import apiClient from '@/lib/api-client';
import type { Bid, Pagination } from '@/types';
import type { CreateBidInput, RespondBidInput } from '@/schemas/bid.schema';

export async function createBid(data: CreateBidInput): Promise<{ data: Bid }> {
  const res = await apiClient.post('/bids', data);
  return res.data;
}

export async function getProductBids(productId: string, params?: { status?: string; limit?: number; page?: number }): Promise<{ data: { bids: Bid[]; pagination: Pagination } }> {
  const res = await apiClient.get(`/bids/product/${productId}`, { params });
  return res.data;
}

export async function getMyBids(params?: { status?: string; limit?: number; page?: number }): Promise<{ data: { bids: Bid[]; pagination: Pagination } }> {
  const res = await apiClient.get('/bids/my-bids', { params });
  return res.data;
}

export async function updateBid(id: string, data: Partial<CreateBidInput>): Promise<{ data: Bid }> {
  const res = await apiClient.put(`/bids/${id}`, data);
  return res.data;
}

export async function cancelBid(id: string): Promise<{ data: Bid }> {
  const res = await apiClient.post(`/bids/${id}/cancel`);
  return res.data;
}

export async function respondToBid(id: string, data: RespondBidInput): Promise<{ data: Bid }> {
  const res = await apiClient.post(`/bids/${id}/respond`, data);
  return res.data;
}
