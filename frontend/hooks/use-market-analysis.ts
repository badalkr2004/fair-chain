import { useQuery } from '@tanstack/react-query';
import * as marketService from '@/services/market-analysis.service';

export function useMarketPrices(cropName: string) {
  return useQuery({
    queryKey: ['market-prices', cropName],
    queryFn: () => marketService.getMarketPrices(cropName),
    enabled: !!cropName,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCropForecast(params: { crop_name: string; region: string; metric?: string; periods?: number }) {
  return useQuery({
    queryKey: ['crop-forecast', params],
    queryFn: () => marketService.getCropForecast(params),
    enabled: !!params.crop_name && !!params.region,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useOptimalCrops(region: string) {
  return useQuery({
    queryKey: ['optimal-crops', region],
    queryFn: () => marketService.getOptimalCrops(region),
    enabled: !!region,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useAvailableCrops() {
  return useQuery({
    queryKey: ['available-crops'],
    queryFn: () => marketService.getAvailableCrops(),
    staleTime: Infinity,
  });
}

export function useAvailableRegions() {
  return useQuery({
    queryKey: ['available-regions'],
    queryFn: () => marketService.getAvailableRegions(),
    staleTime: Infinity,
  });
}
