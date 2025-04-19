"use client";

import { useState } from "react";
import { MarketPriceChart } from "@/components/marketTrend/MarketPriceChart";
import { CropRecommendations } from "@/components/market/CropRecommendations";
import { MarketInsights } from "@/components/market/MarketInsights";
import { PriceComparison } from "@/components/marketTrend/PriceComparison";
import { RecommendedPrice } from "@/components/marketTrend/RecomendedPrice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - In a real app, this would come from an API
const mockTrendData = [
  { date: "2024-03-15", tomatoes: 40, potatoes: 25, onions: 30 },
  { date: "2024-03-22", tomatoes: 45, potatoes: 22, onions: 35 },
  { date: "2024-03-29", tomatoes: 42, potatoes: 28, onions: 32 },
  { date: "2024-04-05", tomatoes: 48, potatoes: 30, onions: 28 },
  { date: "2024-04-12", tomatoes: 50, potatoes: 27, onions: 33 },
  { date: "2024-04-19", tomatoes: 47, potatoes: 29, onions: 36 },
];

const nearbyMandis = [
  { name: "Central Mandi", tomatoes: 45, potatoes: 28, onions: 34 },
  { name: "East Mandi", tomatoes: 43, potatoes: 26, onions: 35 },
  { name: "West Mandi", tomatoes: 46, potatoes: 29, onions: 33 },
];

const mockCropRecommendations = [
  {
    crop: "Tomatoes",
    recommendation: "High demand expected in next 2 weeks",
    confidence: "85%",
    trend: "upward" as const,
  },
  {
    crop: "Potatoes",
    recommendation: "Stable market, good time to harvest",
    confidence: "75%",
    trend: "stable" as const,
  },
  {
    crop: "Onions",
    recommendation: "Slight price increase expected",
    confidence: "65%",
    trend: "upward" as const,
  },
];

const mockMarketInsights = [
  {
    title: "Weather Impact on Crop Yields",
    description: "Recent weather patterns suggest a potential increase in tomato yields by 15% in the next quarter.",
    impact: "high" as const,
    source: "Agricultural Weather Service",
  },
  {
    title: "Market Demand Shift",
    description: "Consumer preference for organic produce is increasing, creating new market opportunities.",
    impact: "medium" as const,
    source: "Market Research Report",
  },
  {
    title: "Supply Chain Optimization",
    description: "New logistics routes have reduced transportation costs by 8% for perishable goods.",
    impact: "low" as const,
    source: "Logistics Update",
  },
];

export default function Suggestions() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Market Suggestions</h1>
        <p className="mt-2 text-gray-600">
          Get AI-powered insights and recommendations for your farming decisions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Price Trends (Last 6 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <MarketPriceChart data={mockTrendData} />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Nearby Mandi Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceComparison data={nearbyMandis} />
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle>Recommended Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <RecommendedPrice />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2">
          <CropRecommendations recommendations={mockCropRecommendations} />
        </div>
        <div className="space-y-4">
          <MarketInsights insights={mockMarketInsights} />
        </div>
      </div>
    </div>
  );
}

