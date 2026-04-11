import { useQuery } from '@tanstack/react-query';
import * as forecastService from '@/services/forecast.service';

export function useDemandForecasts(params?: { category?: string; region?: string }) {
  return useQuery({
    queryKey: ['demand-forecasts', params],
    queryFn: () => forecastService.getDemandForecasts(params),
  });
}

export function useMarketTrends(params?: { category?: string; location?: string; days?: number }) {
  return useQuery({
    queryKey: ['market-trends', params],
    queryFn: () => forecastService.getMarketTrends(params),
  });
}
