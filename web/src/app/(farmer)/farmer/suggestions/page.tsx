"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MarketPriceChart } from "@/components/marketTrend/MarketPriceChart";
import PriceComparison from "@/components/marketTrend/PriceComparison";
import RecommendedPrice from "@/components/marketTrend/RecomendedPrice";
import CropRecommendations from "@/components/market/CropRecommendations";
import { MarketInsights } from "@/components/market/MarketInsights";
import { fairChainClient } from "@/lib/api/fairchain";
import { PriceData, ForecastData, MandiPrice } from "@/types/market";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CropRecommendation {
  crop: string;
  score: number;
  reason: string;
}

export default function SuggestionsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [priceTrends, setPriceTrends] = useState<PriceData[]>([]);
  const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [marketInsights, setMarketInsights] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState("potato");
  const [selectedRegion, setSelectedRegion] = useState("patna");

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch price trends
        const trendsResponse = await fairChainClient.getPriceTrends(selectedCrop);
        if (trendsResponse.success) {
          setPriceTrends(trendsResponse.data || []);
        }

        // Fetch mandi prices
        const mandiResponse = await fairChainClient.getMandiPrices(selectedCrop);
        if (mandiResponse.success) {
          setMandiPrices(mandiResponse.data || []);
        }

        // Fetch price forecast
        const forecastResponse = await fairChainClient.getPriceForecast(selectedCrop, selectedRegion);
        if (forecastResponse.success) {
          setForecastData(forecastResponse.data || null);
        }

        // Fetch optimal crops
        const recommendationsResponse = await fairChainClient.getOptimalCrops(selectedRegion);
        if (recommendationsResponse.success && recommendationsResponse.data) {
          setRecommendations(recommendationsResponse.data.optimal_crops.map(crop => ({
            crop: crop.crop,
            score: crop.confidence_score,
            reason: `Yield trend: ${crop.yield_trend}, Profit potential: ${crop.profit_potential}`
          })));
        }

        // Fetch market insights
        const insightsResponse = await fairChainClient.getRegionalDemand(selectedRegion);
        if (insightsResponse.success) {
          setMarketInsights(insightsResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch market data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedCrop, selectedRegion, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Market Suggestions</h1>
        <div className="flex gap-4">
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="potato">Potatoes</SelectItem>
              <SelectItem value="apple">Apples</SelectItem>
              <SelectItem value="banana">Bananas</SelectItem>
              <SelectItem value="wheat">Wheat</SelectItem>
              <SelectItem value="rice">Rice</SelectItem>
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
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
        </div>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <RecommendedPrice forecastData={forecastData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Crop Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <CropRecommendations recommendations={recommendations} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <MarketInsights insights={marketInsights} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

