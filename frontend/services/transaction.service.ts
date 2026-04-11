import apiClient from '@/lib/api-client';
import type { Transaction, Pagination } from '@/types';

interface TransactionFilters {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export async function getAllTransactions(filters?: TransactionFilters): Promise<{ data: { transactions: Transaction[]; pagination: Pagination } }> {
  const res = await apiClient.get('/transactions', { params: filters });
  return res.data;
}

export async function getTransactionById(id: string): Promise<{ data: Transaction }> {
  const res = await apiClient.get(`/transactions/${id}`);
  return res.data;
}

export async function createTransaction(data: Record<string, unknown>): Promise<{ data: Transaction }> {
  const res = await apiClient.post('/transactions', data);
  return res.data;
}

export async function updateTransaction(id: string, data: Record<string, unknown>): Promise<{ data: Transaction }> {
  const res = await apiClient.put(`/transactions/${id}`, data);
  return res.data;
}

export async function getUserTransactions(userId: string, filters?: TransactionFilters): Promise<{ data: { transactions: Transaction[]; pagination: Pagination } }> {
  const res = await apiClient.get(`/transactions/user/${userId}`, { params: filters });
  return res.data;
}

export async function getProductTransactions(productId: string, filters?: TransactionFilters): Promise<{ data: { transactions: Transaction[]; pagination: Pagination } }> {
  const res = await apiClient.get(`/transactions/product/${productId}`, { params: filters });
  return res.data;
}

export async function processPayment(id: string, data: { paymentMethod: string; paymentReference: string; amount: number }): Promise<{ data: Transaction }> {
  const res = await apiClient.post(`/transactions/${id}/process-payment`, data);
  return res.data;
}

export async function recordDelivery(id: string, data: Record<string, unknown>): Promise<{ data: Transaction }> {
  const res = await apiClient.post(`/transactions/${id}/record-delivery`, data);
  return res.data;
}
