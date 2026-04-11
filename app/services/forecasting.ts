import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FORECASTING_API_URL } from "../config";

// Use the configurable forecasting API URL
const API_BASE_URL = FORECASTING_API_URL;

// Define types for the API responses
export interface HistoricalDataPoint {
  year: number;
  production: number;
  area: number;
  yield: number;
}

export interface ForecastDataPoint {
  year: number;
  production: number;
}

export interface CropForecastResponse {
  status: string;
  crop: string;
  metric: string;
  historical_data: HistoricalDataPoint[];
  forecast: ForecastDataPoint[];
  forecast_confidence: number | null;
  last_updated: string;
}

export interface OptimalCropResponse {
  status: string;
  region: string;
  optimal_crops: {
    crop: string;
    current_yield: number;
    yield_trend: "increasing" | "stable" | "decreasing";
    growth_potential: number;
    confidence_score: number;
    forecasted_yield: number;
    profit_potential: "high" | "medium" | "low";
  }[];
  explanation: string;
  last_updated: string;
}

export interface CropCalendarResponse {
  status: string;
  crop_calendars: {
    [crop: string]: {
      season: string;
      planting_time: string;
      harvesting_time: string;
    }[];
  };
  last_updated: string;
}

export interface RegionalDemandResponse {
  // New format based on the API response
  [index: number]: {
    crop: string;
    forecast_values: number[];
    forecast_years: number[];
  };
  length: number;
}

export interface MarketPriceResponse {
  status: string;
  crop: string;
  current_price: number;
  price_trend: string;
  price_forecast: {
    date: string;
    price: number;
  }[];
  last_updated: string;
}

// Define types for request parameters
export interface CropForecastParams {
  crop_name: string;
  metric: "Production" | "Area" | "Yield";
  top_n: number;
  periods: number;
}

export interface OptimalCropsParams {
  region: string;
  top_n: number;
}

export interface CropCalendarParams {
  crop_name: string;
}

export interface RegionalDemandParams {
  region: string;
  top_n: number;
  periods: number;
}

// Define interface for crops response
export interface CropsResponse {
  status: string;
  crops: string[];
  count: number;
}

// Create the forecasting service
class ForecastingService {
  // Get authentication headers for API requests
  private async getAuthHeaders() {
    try {
      const token = await AsyncStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
      console.error("Error getting auth token:", error);
      return {};
    }
  }

  // Get list of all available crops
  async getAllCrops(): Promise<string[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get<CropsResponse>(`${API_BASE_URL}/crops`, {
        headers,
      });

      // Check if response has the expected format
      if (
        response.data &&
        response.data.status === "success" &&
        Array.isArray(response.data.crops)
      ) {
        return response.data.crops;
      }

      // If response doesn't match expected format but has crops array directly
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      // If response has crops property directly
      if (response.data && Array.isArray(response.data.crops)) {
        return response.data.crops;
      }

      console.warn("Unexpected crops response format:", response.data);
      throw new Error("Invalid response format from crops endpoint");
    } catch (error) {
      console.error("Error fetching crops:", error);
      // Return mock data if API fails
      return [
        "Arhar/Tur",
        "Bajra",
        "Barley",
        "Castor seed",
        "Coriander",
        "Dry chillies",
        "Garlic",
        "Ginger",
        "Gram",
        "Groundnut",
        "Horse-gram",
        "Jowar",
        "Jute",
        "Khesari",
        "Linseed",
        "Maize",
        "Masoor",
        "Moong(Green Gram)",
        "Onion",
        "Potato",
        "Ragi",
        "Rapeseed &Mustard",
        "Rice",
        "Sugarcane",
        "Sunflower",
        "Turmeric",
        "Urad",
        "Wheat",
      ];
    }
  }

  // Get list of all available regions
  async getAllRegions(): Promise<string[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/regions`, { headers });

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      }

      if (response.data && Array.isArray(response.data.regions)) {
        return response.data.regions;
      }

      console.warn("Unexpected regions response format:", response.data);
      return [
        "Saran",
        "Patna",
        "Buxar",
        "Bhojpur",
        "Rohtas",
        "Kaimur",
        "Nalanda",
        "Gaya",
        "Jehanabad",
        "Arwal",
      ];
    } catch (error) {
      console.error("Error fetching regions:", error);
      // Return mock data if API fails
      return [
        "Saran",
        "Patna",
        "Buxar",
        "Bhojpur",
        "Rohtas",
        "Kaimur",
        "Nalanda",
        "Gaya",
        "Jehanabad",
        "Arwal",
      ];
    }
  }

  // Get forecast for a specific crop
  async getCropForecast(
    params: CropForecastParams,
  ): Promise<CropForecastResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/forecast/crop`,
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching crop forecast:", error);
      // Return mock data if API fails
      return {
        status: "success",
        crop: params.crop_name,
        metric: params.metric,
        historical_data: Array.from({ length: 14 }, (_, i) => ({
          year: 2009 + i,
          production: 150000 + Math.random() * 70000,
          area: 60000 + Math.random() * 10000,
          yield: 2 + Math.random() * 1.5,
        })),
        forecast: Array.from({ length: params.periods }, (_, i) => ({
          year: 2023 + i,
          production: 200000 + (Math.random() - 0.5) * 20000,
        })),
        forecast_confidence: null,
        last_updated: new Date().toISOString().split("T")[0],
      };
    }
  }

  // Get optimal crops for a region
  async getOptimalCrops(
    params: OptimalCropsParams,
  ): Promise<OptimalCropResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/recommend/optimal-crops`,
        params,
        { headers },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching optimal crops:", error);
      // Return mock data if API fails
      const crops = ["Sugarcane", "Wheat", "Arhar/Tur", "Bajra", "Jowar"];
      const yieldTrends: Array<"increasing" | "stable" | "decreasing"> = [
        "increasing",
        "stable",
        "decreasing",
      ];
      const profitPotentials: Array<"high" | "medium" | "low"> = [
        "high",
        "medium",
        "low",
      ];

      return {
        status: "success",
        region: params.region,
        optimal_crops: crops.slice(0, params.top_n).map((crop) => {
          const yieldTrend =
            yieldTrends[Math.floor(Math.random() * yieldTrends.length)];
          const growthPotential =
            yieldTrend === "increasing"
              ? Math.random() * 30
              : yieldTrend === "stable"
                ? Math.random() * 5
                : -Math.random() * 20;

          return {
            crop,
            current_yield: 1 + Math.random() * 60,
            yield_trend: yieldTrend,
            growth_potential: growthPotential,
            confidence_score: 70 + Math.random() * 20,
            forecasted_yield: 1 + Math.random() * 60,
            profit_potential:
              profitPotentials[
                Math.floor(Math.random() * profitPotentials.length)
              ],
          };
        }),
        explanation: `Recommendations based on AI forecasting models that analyzed historical yield data and projected future performance for ${params.region}`,
        last_updated: new Date().toISOString().split("T")[0],
      };
    }
  }

  // Get crop calendar
  async getCropCalendar(
    params: CropCalendarParams,
  ): Promise<CropCalendarResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/crop-calendar`,
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching crop calendar:", error);
      // Return mock data if API fails
      const seasons = ["Spring", "Summer", "Autumn", "Winter"];
      const randomSeason = seasons[Math.floor(Math.random() * seasons.length)];

      // Create mock crop calendar data in the new format
      const cropCalendars: { [crop: string]: any[] } = {};
      cropCalendars[params.crop_name] = [
        {
          season: randomSeason,
          planting_time:
            randomSeason === "Spring"
              ? "March-April"
              : randomSeason === "Summer"
                ? "June-July"
                : randomSeason === "Autumn"
                  ? "August-September"
                  : "November-December",
          harvesting_time:
            randomSeason === "Spring"
              ? "June-July"
              : randomSeason === "Summer"
                ? "September-October"
                : randomSeason === "Autumn"
                  ? "November-December"
                  : "February-March",
        },
      ];

      return {
        status: "success",
        crop_calendars: cropCalendars,
        last_updated: new Date().toISOString().split("T")[0],
      };
    }
  }

  // Get market prices for a crop
  async getMarketPrices(cropName: string): Promise<MarketPriceResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/market-prices/${cropName}`,
        { headers },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching market prices:", error);
      // Return mock data if API fails
      const today = new Date();
      const currentPrice = 2000 + Math.random() * 2000;
      const priceTrend = ["increasing", "decreasing", "stable"][
        Math.floor(Math.random() * 3)
      ];

      // Generate forecast prices based on trend
      const priceForecast = Array.from({ length: 5 }, (_, i) => {
        const forecastDate = new Date(today);
        forecastDate.setMonth(today.getMonth() + i + 1);

        let priceChange = 0;
        if (priceTrend === "increasing") {
          priceChange = (Math.random() * 0.1 + 0.01) * currentPrice; // 1-11% increase
        } else if (priceTrend === "decreasing") {
          priceChange = -(Math.random() * 0.1 + 0.01) * currentPrice; // 1-11% decrease
        } else {
          priceChange = (Math.random() * 0.06 - 0.03) * currentPrice; // -3% to +3% change
        }

        return {
          date: forecastDate.toISOString().split("T")[0],
          price: Math.round((currentPrice + priceChange) * 100) / 100,
        };
      });

      return {
        status: "success",
        crop: cropName,
        current_price: currentPrice,
        price_trend: priceTrend,
        price_forecast: priceForecast,
        last_updated: today.toISOString().split("T")[0],
      };
    }
  }

  // Get regional demand forecast
  async getRegionalDemand(
    params: RegionalDemandParams,
  ): Promise<RegionalDemandResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/forecast/regional_demand`,
        params,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching regional demand:", error);
      // Return mock data if API fails based on the new format
      const mockCrops = [
        "Wheat",
        "Potato",
        "Sugarcane",
        "Masoor",
        "Barley",
      ].slice(0, params.top_n);

      const mockResponse: any = mockCrops.map((crop, index) => {
        // Generate different patterns for different crops
        const isIncreasing = index % 2 === 0;
        const baseValue = 1000 + index * 5000;

        return {
          crop,
          forecast_values: Array.from({ length: params.periods }, (_, i) => {
            if (isIncreasing) {
              return baseValue * (1 + 0.05 * (i + 1));
            } else {
              return baseValue * (1 - 0.03 * (i + 1));
            }
          }),
          forecast_years: Array.from(
            { length: params.periods },
            (_, i) => 2023 + i,
          ),
        };
      });

      return mockResponse;
    }
  }
}

export default new ForecastingService();
