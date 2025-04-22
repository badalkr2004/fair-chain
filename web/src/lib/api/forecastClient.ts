import type { ApiResponse } from './types';

// Update to use local development server
const FORECAST_BASE_URL = 'http://localhost:8000';

const FORECAST_ENDPOINTS = {
  MARKET_PRICES: (crop: string) => `/market-prices/${crop}`,
  CROP_FORECAST: '/forecast/crop',
  OPTIMAL_CROPS: '/recommend/optimal-crops',
  CROP_CALENDAR: '/crop-calendar',
  REGIONAL_DEMAND: '/api/forecast/regional_demand',
  CROPS: '/crops',
  REGIONS: '/regions'
};

interface ForecastRequest {
  crop_name?: string;
  region?: string;
  metric?: string;
  top_n?: number;
  periods?: number;
}

interface MarketPriceResponse {
  status: string;
  crop: string;
  current_price: number;
  price_trend: string;
  price_forecast: Array<{
    date: string;
    price: number;
  }>;
  last_updated: string;
}

interface CropForecastResponse {
  status: string;
  crop: string;
  forecast: Array<{
    date: string;
    value: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
  }>;
}

interface OptimalCropsResponse {
  status: string;
  region: string;
  crops: Array<{
    crop: string;
    score: number;
    reasons: string[];
  }>;
}

class ForecastClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = FORECAST_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        message: 'Success',
        success: true
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: undefined as T,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false
      };
    }
  }

  async getMarketPrices(crop: string): Promise<ApiResponse<MarketPriceResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}${FORECAST_ENDPOINTS.MARKET_PRICES(crop)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.status || !data.crop || !data.current_price || !data.price_forecast) {
        throw new Error('Invalid response structure from market prices endpoint');
      }

      return {
        data,
        message: 'Success',
        success: true
      };
    } catch (error) {
      console.error('Error fetching market prices:', error);
      return {
        data: undefined as any,
        message: error instanceof Error ? error.message : 'Failed to fetch market prices',
        success: false
      };
    }
  }

  async getCropForecast(params: { crop_name: string; periods?: number }): Promise<ApiResponse<CropForecastResponse>> {
    return this.request<CropForecastResponse>(FORECAST_ENDPOINTS.CROP_FORECAST, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getOptimalCrops(params: { region: string; top_n: number }): Promise<ApiResponse<OptimalCropsResponse>> {
    return this.request<OptimalCropsResponse>(FORECAST_ENDPOINTS.OPTIMAL_CROPS, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getCropCalendar(params: { crop_name: string }): Promise<ApiResponse<any>> {
    return this.request(FORECAST_ENDPOINTS.CROP_CALENDAR, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getRegionalDemand(params: { region: string; top_n: number; periods: number }): Promise<ApiResponse<any>> {
    return this.request(FORECAST_ENDPOINTS.REGIONAL_DEMAND, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getAllCrops(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>(FORECAST_ENDPOINTS.CROPS);
  }

  async getRegions(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>(FORECAST_ENDPOINTS.REGIONS);
  }
}

export const forecastClient = new ForecastClient(); 