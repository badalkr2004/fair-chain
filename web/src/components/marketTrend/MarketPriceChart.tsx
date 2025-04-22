"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceLine
} from "recharts";
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PriceData, ForecastData } from "@/types/market";

interface MarketPriceChartProps {
  priceData: PriceData[] | null;
  forecastData: ForecastData | null;
}

export function MarketPriceChart({ priceData, forecastData }: MarketPriceChartProps) {
  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [showForecast, setShowForecast] = useState(false);
  
  // Format data for the chart
  const formattedData = priceData?.map((item) => ({
    date: item.date,
    potatoes: item.potatoes,
    apples: item.apples,
    bananas: item.bananas,
    wheat: item.wheat,
    rice: item.rice,
  })) || [];

  // Format forecast data if available
  const formattedForecastData = forecastData
    ? [
        {
          date: "Current",
          price: forecastData.current_price,
        },
        ...forecastData.price_forecast.map((forecast) => ({
          date: forecast.date,
          price: forecast.price,
        })),
      ]
    : [];

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-lg font-bold" style={{ color: entry.color }}>
              {entry.name}: ₹{formatPrice(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!priceData || priceData.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Market Price Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-gray-500">No price data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Market Price Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" onValueChange={(value) => setView(value as "weekly" | "monthly")}>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formattedData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="potatoes"
                    name="Potatoes"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area
                    type="monotone"
                    dataKey="apples"
                    name="Apples"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                  <Area
                    type="monotone"
                    dataKey="bananas"
                    name="Bananas"
                    stackId="1"
                    stroke="#ffc658"
                    fill="#ffc658"
                  />
                  <Area
                    type="monotone"
                    dataKey="wheat"
                    name="Wheat"
                    stackId="1"
                    stroke="#ff7300"
                    fill="#ff7300"
                  />
                  <Area
                    type="monotone"
                    dataKey="rice"
                    name="Rice"
                    stackId="1"
                    stroke="#0088fe"
                    fill="#0088fe"
                  />
                  {showForecast && forecastData && (
                    <ReferenceLine
                      x="Current"
                      stroke="#ff0000"
                      label={{
                        value: "Forecast Start",
                        position: "top",
                        fill: "#ff0000",
                      }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="monthly">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formattedData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="potatoes"
                    name="Potatoes"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area
                    type="monotone"
                    dataKey="apples"
                    name="Apples"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                  <Area
                    type="monotone"
                    dataKey="bananas"
                    name="Bananas"
                    stackId="1"
                    stroke="#ffc658"
                    fill="#ffc658"
                  />
                  <Area
                    type="monotone"
                    dataKey="wheat"
                    name="Wheat"
                    stackId="1"
                    stroke="#ff7300"
                    fill="#ff7300"
                  />
                  <Area
                    type="monotone"
                    dataKey="rice"
                    name="Rice"
                    stackId="1"
                    stroke="#0088fe"
                    fill="#0088fe"
                  />
                  {showForecast && forecastData && (
                    <ReferenceLine
                      x="Current"
                      stroke="#ff0000"
                      label={{
                        value: "Forecast Start",
                        position: "top",
                        fill: "#ff0000",
                      }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

