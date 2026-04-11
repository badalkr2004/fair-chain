import apiClient from '@/lib/api-client';
import type { Prediction } from '@/types';

export async function getDemandForecasts(params?: { category?: string; region?: string }): Promise<{ forecasts: Prediction[] }> {
  const res = await apiClient.get('/forecast/demand', { params });
  return res.data;
}

export async function getMarketTrends(params?: { category?: string; location?: string; days?: number }): Promise<{ trends: Record<string, Array<{ date: string; minPrice: number; maxPrice: number; averagePrice: number }>> }> {
  const res = await apiClient.get('/forecast/market-trends', { params });
  return res.data;
}
