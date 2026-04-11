import apiClient from '@/lib/api-client';
import type { TraceabilityRecord, TraceabilityTimeline } from '@/types';

export async function getTraceabilityRecord(identifier: string): Promise<{ record: TraceabilityRecord }> {
  const res = await apiClient.get(`/trace/record/${identifier}`);
  return res.data;
}

export async function getProductTraceability(productId: string): Promise<{
  product: { id: string; name: string; farmer: { name: string; location?: string }; harvestDate?: string; organicCertified: boolean };
  timeline: TraceabilityTimeline[];
}> {
  const res = await apiClient.get(`/trace/product/${productId}`);
  return res.data;
}

export async function verifyTraceability(recordId: string): Promise<{
  record: TraceabilityRecord;
  verification: { isValid: boolean; previousRecord?: unknown; verifiedBy: string; verifiedAt: string };
}> {
  const res = await apiClient.get(`/trace/verify/${recordId}`);
  return res.data;
}

export async function addTraceabilityRecord(data: {
  productId: string;
  eventType: string;
  location?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<{ record: TraceabilityRecord }> {
  const res = await apiClient.post('/trace/record', data);
  return res.data;
}
