"use client";

import { useEffect, useState } from "react";
import { MarketPriceChart } from "@/components/marketTrend/MarketPriceChart";
import CropRecommendations from "@/components/market/CropRecommendations";
import { MarketInsights } from "@/components/market/MarketInsights";
import PriceComparison from "@/components/marketTrend/PriceComparison";
import RecommendedPrice from "@/components/marketTrend/RecomendedPrice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fairChainClient } from "@/lib/api/fairchain";
import { PriceData, MandiPrice, ForecastData } from "@/types/market";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OptimalCrop {
  crop: string;
  current_yield: number;
  yield_trend: string;
  growth_potential: number;
  confidence_score: number;
  forecasted_yield: number;
  profit_potential: string;
}

interface CropRecommendation {
  crop: string;
  score: number;
  reason: string;
}

export default function MarketPriceTrends() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [priceTrends, setPriceTrends] = useState<PriceData[]>([]);
  const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [marketInsights, setMarketInsights] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [selectedRegion, setSelectedRegion] = useState("patna");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch price trends for selected crop
        const trendsResponse = await fairChainClient.getPriceTrends(selectedCrop);
        if (trendsResponse.success) {
          setPriceTrends(trendsResponse.data || []);
        }

        // Fetch mandi prices for selected crop
        const mandiResponse = await fairChainClient.getMandiPrices(selectedCrop);
        if (mandiResponse.success) {
          setMandiPrices(mandiResponse.data || []);
        }

        // Fetch price forecast for selected crop
        const forecastResponse = await fairChainClient.getPriceForecast(selectedCrop, selectedRegion);
        if (forecastResponse.success) {
          setForecastData(forecastResponse.data || null);
        }

        // Fetch optimal crops for selected region
        const recommendationsResponse = await fairChainClient.getOptimalCrops(selectedRegion);
        if (recommendationsResponse.success && recommendationsResponse.data) {
          setRecommendations(recommendationsResponse.data.optimal_crops.map(crop => ({
            crop: crop.crop,
            score: crop.confidence_score,
            reason: `Yield trend: ${crop.yield_trend}, Profit potential: ${crop.profit_potential}`
          })));
        }

        // Fetch market insights for selected region
        const insightsResponse = await fairChainClient.getRegionalDemand(selectedRegion);
        if (insightsResponse.success) {
          setMarketInsights(insightsResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch market data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, selectedCrop, selectedRegion]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Market Price Trends</h1>
        <p className="mt-2 text-gray-600">
          Track real-time mandi prices and market trends
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select crop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wheat">Wheat</SelectItem>
            <SelectItem value="rice">Rice</SelectItem>
            <SelectItem value="potatoes">Potatoes</SelectItem>
            <SelectItem value="apples">Apples</SelectItem>
            <SelectItem value="bananas">Bananas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="patna">Patna</SelectItem>
            <SelectItem value="delhi">Delhi</SelectItem>
            <SelectItem value="mumbai">Mumbai</SelectItem>
            <SelectItem value="kolkata">Kolkata</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Price Trends & Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketPriceChart priceData={priceTrends} forecastData={forecastData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nearby Mandi Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceComparison data={mandiPrices} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <RecommendedPrice forecastData={forecastData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2">
          <CropRecommendations recommendations={recommendations} />
        </div>
        <div className="space-y-4">
          <MarketInsights insights={marketInsights} />
        </div>
      </div>
    </div>
  );
}
