import pyApiClient from '@/lib/py-api-client';

export interface MarketPriceResponse {
  status: string;
  crop: string;
  current_price: number;
  price_trend: string;
  price_forecast: Array<{ date: string; price: number }>;
  data_source: string;
  last_updated: string;
}

export interface CropForecastResponse {
  status: string;
  crop: string;
  metric: string;
  historical_data: Array<{ year: number; value: number }>;
  forecast: Array<{ year: number; forecast: number }>;
  forecast_confidence: number | null;
  last_updated: string;
}

export interface OptimalCropsResponse {
  status: string;
  region: string;
  optimal_crops: Array<{
    crop: string;
    current_yield: number;
    yield_trend: string;
    profit_potential: string;
    growth_potential?: number;
    forecasted_yield?: number;
  }>;
  explanation: string;
  last_updated: string;
}

export async function getMarketPrices(cropName: string): Promise<MarketPriceResponse> {
  const { data } = await pyApiClient.get(`/market-prices/${cropName}`);
  return data;
}

export async function getCropForecast(params: { crop_name: string; region: string; metric?: string; periods?: number }): Promise<CropForecastResponse> {
  const { data } = await pyApiClient.post('/forecast/crop', {
    crop_name: params.crop_name,
    region: params.region,
    metric: params.metric || 'Production',
    periods: params.periods || 5,
    top_n: 5
  });
  return data;
}

export async function getOptimalCrops(region: string): Promise<OptimalCropsResponse> {
  const { data } = await pyApiClient.post('/recommend/optimal-crops', {
    region,
    top_n: 6
  });
  return data;
}

export async function getAvailableCrops(): Promise<{ crops: string[] }> {
  const { data } = await pyApiClient.get('/crops');
  return data;
}

export async function getAvailableRegions(): Promise<{ regions: string[] }> {
  const { data } = await pyApiClient.get('/regions');
  return data;
}
