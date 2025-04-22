"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface PriceForecast {
  date: string;
  price: number;
}

interface CropPriceData {
  crop: string;
  current_price: number;
  price_trend: string;
  price_forecast: PriceForecast[];
  last_updated: string;
}

interface ForecastPriceChartProps {
  data: CropPriceData;
}

export function ForecastPriceChart({ data }: ForecastPriceChartProps) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  
  // Format the data for the chart
  const chartData = data.price_forecast.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    originalDate: item.date,
    price: item.price,
  }));

  // Add current price as the first data point
  chartData.unshift({
    date: "Current",
    originalDate: data.last_updated,
    price: data.current_price,
  });

  // Determine min and max for chart y-axis
  const allPrices = chartData.map(item => item.price);
  const minPrice = Math.min(...allPrices) * 0.99;
  const maxPrice = Math.max(...allPrices) * 1.01;

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
          <p className="text-amber-600 font-bold text-lg">
            ₹{formatPrice(payload[0].value)}
          </p>
          <p className="text-xs text-gray-500">
            {payload[0].payload.originalDate}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {data.crop} Price Forecast
          </CardTitle>
          {data.price_trend === "increasing" ? (
            <TrendingUp className="h-5 w-5 text-green-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
        </div>
        <Tabs defaultValue="monthly" className="w-[200px]" onValueChange={(v) => setPeriod(v as "weekly" | "monthly")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#6B7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "#6B7280" }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `₹${value}`}
                tick={{ fill: "#6B7280" }}
                width={60}
                domain={[minPrice, maxPrice]}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{
                  paddingTop: '10px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                name="Price" 
                stroke="#10B981" 
                fillOpacity={1}
                fill="url(#colorPrice)" 
              />
              <ReferenceLine 
                y={data.current_price} 
                stroke="#6B7280" 
                strokeDasharray="3 3" 
                label={{ 
                  value: 'Current Price', 
                  position: 'right',
                  fill: '#6B7280',
                  fontSize: 12
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 