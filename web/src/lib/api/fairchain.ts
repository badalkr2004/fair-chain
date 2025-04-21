import { PriceData, ForecastData, MandiPrice } from "@/types/market";

const FAIRCHAIN_API_URL = "https://3s955r5p-8000.inc1.devtunnels.ms";

export interface RegionalDemand {
  crop: string;
  demand: number;
  supply: number;
  price: number;
  last_updated: string;
}

interface FairChainResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface RegionData {
  status: string;
  regions: string[];
  count: number;
}

interface CropData {
  status: string;
  crops: string[];
  count: number;
}

export interface OptimalCrop {
  crop: string;
  current_yield: number;
  yield_trend: string;
  growth_potential: number;
  confidence_score: number;
  forecasted_yield: number;
  profit_potential: string;
}

interface OptimalCropsResponse {
  status: string;
  region: string;
  optimal_crops: OptimalCrop[];
  explanation: string;
  last_updated: string;
}

export class FairChainClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = FAIRCHAIN_API_URL;
  }

  private async fetchWithErrorHandling<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<FairChainResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData?.message || response.statusText}`
        );
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      
      // Return mock data for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock data in development mode');
        return {
          success: true,
          data: this.getMockDataForEndpoint(endpoint) as T
        };
      }

      return { 
        success: false, 
        data: null as T,
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private getMockDataForEndpoint(endpoint: string): any {
    if (endpoint.includes('/market-prices/')) {
      return this.getMockPriceTrends();
    } else if (endpoint.includes('/forecast/crop')) {
      return this.getMockForecastData();
    } else if (endpoint.includes('/regional_demand')) {
      return this.getMockRegionalDemand();
    } else if (endpoint.includes('/optimal-crops')) {
      return this.getMockOptimalCrops();
    }
    return null;
  }

  private getMockRegionalDemand(): RegionalDemand[] {
    return [
      {
        crop: "wheat",
        demand: 1000,
        supply: 800,
        price: 2500,
        last_updated: new Date().toISOString()
      },
      {
        crop: "rice",
        demand: 1200,
        supply: 1000,
        price: 3000,
        last_updated: new Date().toISOString()
      }
    ];
  }

  private getMockOptimalCrops(): OptimalCropsResponse {
    return {
      status: "success",
      region: "default",
      optimal_crops: [
        {
          crop: "wheat",
          current_yield: 80,
          yield_trend: "increasing",
          growth_potential: 0.15,
          confidence_score: 0.85,
          forecasted_yield: 92,
          profit_potential: "high"
        }
      ],
      explanation: "Based on current market conditions and historical data",
      last_updated: new Date().toISOString()
    };
  }

  async getRegions(): Promise<FairChainResponse<RegionData>> {
    return this.fetchWithErrorHandling<RegionData>('/regions');
  }

  async getCrops(): Promise<FairChainResponse<CropData>> {
    return this.fetchWithErrorHandling<CropData>('/crops');
  }

  async getPriceTrends(crop: string): Promise<FairChainResponse<PriceData[]>> {
    return this.fetchWithErrorHandling<PriceData[]>(`/market-prices/${crop}`);
  }

  async getMandiPrices(crop: string): Promise<FairChainResponse<MandiPrice[]>> {
    // Since there's no direct mandi prices endpoint, we'll use the market prices endpoint
    // and transform the data to match the MandiPrice interface
    const response = await this.fetchWithErrorHandling<any>(`/market-prices/${crop}`);
    
    if (response.success && response.data) {
      // Transform the data to match MandiPrice interface
      const mandiPrices: MandiPrice[] = [
        {
          mandi: "Local Market",
          price: response.data.current_price || 0,
          distance: 0,
          last_updated: response.data.last_updated || new Date().toISOString(),
        },
      ];
      return { ...response, data: mandiPrices };
    }
    
    return { ...response, data: [] };
  }

  async getPriceForecast(crop: string, region: string): Promise<FairChainResponse<ForecastData>> {
    try {
      const response = await this.fetchWithErrorHandling<ForecastData>(
        `/forecast/crop`,
        {
          method: 'POST',
          body: JSON.stringify({
            crop_name: crop,
            metric: "Price",
            top_n: 5,
            periods: 5
          }),
        }
      );

      if (!response.success) {
        return {
          success: true,
          data: {
            crop,
            current_price: 0,
            price_trend: 'stable',
            price_forecast: [],
            last_updated: new Date().toISOString(),
          },
        };
      }

      return response;
    } catch (error) {
      console.error('Error fetching price forecast:', error);
      return {
        success: false,
        message: 'Failed to fetch price forecast',
      };
    }
  }

  async getCropRecommendations(region: string): Promise<FairChainResponse<any[]>> {
    return this.fetchWithErrorHandling<any[]>(`/recommend/optimal-crops`, {
      method: 'POST',
      body: JSON.stringify({ region }),
    });
  }

  async getRegionalDemand(region: string): Promise<FairChainResponse<RegionalDemand[]>> {
    try {
      const response = await this.fetchWithErrorHandling<RegionalDemand[]>(
        `/api/forecast/regional_demand`,
        {
          method: 'POST',
          body: JSON.stringify({
            region,
            top_n: 5,
            periods: 5
          }),
        }
      );

      if (!response.success) {
        return {
          success: true,
          data: [],
        };
      }

      return response;
    } catch (error) {
      console.error('Error fetching regional demand:', error);
      return {
        success: false,
        message: 'Failed to fetch regional demand',
      };
    }
  }

  async getOptimalCrops(region: string, topN: number = 5): Promise<FairChainResponse<OptimalCropsResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/recommend/optimal-crops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region,
          top_n: topN
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching optimal crops:', error);
      return {
        success: false,
        data: {
          status: "error",
          region: region,
          optimal_crops: [],
          explanation: "Failed to fetch optimal crops",
          last_updated: new Date().toISOString()
        }
      };
    }
  }

  // Mock data for development
  private getMockPriceTrends(): PriceData[] {
    return [
      { date: "2024-01", potatoes: 25, apples: 45, bananas: 30, wheat: 1200, rice: 1800 },
      { date: "2024-02", potatoes: 28, apples: 42, bananas: 32, wheat: 1250, rice: 1850 },
      { date: "2024-03", potatoes: 30, apples: 40, bananas: 35, wheat: 1300, rice: 1900 },
      { date: "2024-04", potatoes: 32, apples: 38, bananas: 38, wheat: 1350, rice: 1950 },
      { date: "2024-05", potatoes: 35, apples: 35, bananas: 40, wheat: 1400, rice: 2000 },
    ];
  }

  private getMockMandiPrices(): MandiPrice[] {
    return [
      { mandi: "Delhi", price: 30, distance: 50, last_updated: "2024-03-20" },
      { mandi: "Mumbai", price: 32, distance: 100, last_updated: "2024-03-20" },
      { mandi: "Kolkata", price: 28, distance: 75, last_updated: "2024-03-20" },
    ];
  }

  private getMockForecastData(): ForecastData {
    return {
      crop: "potatoes",
      current_price: 35,
      price_trend: "increasing",
      price_forecast: [
        { date: "2024-06", price: 38 },
        { date: "2024-07", price: 40 },
        { date: "2024-08", price: 42 },
      ],
      last_updated: "2024-03-20",
    };
  }

  private getMockRecommendations(): any[] {
    return [
      {
        crop: "potatoes",
        score: 0.85,
        reason: "High demand and good market price"
      },
      {
        crop: "wheat",
        score: 0.75,
        reason: "Stable market and good yield potential"
      }
    ];
  }

  private getMockMarketInsights(): any[] {
    return [
      {
        region: "north",
        demand: "high",
        supply: "medium",
        price_trend: "increasing",
        recommendation: "Consider increasing production",
      },
    ];
  }
}

export const fairChainClient = new FairChainClient(); 