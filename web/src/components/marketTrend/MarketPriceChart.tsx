"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";
import { useState } from "react";

interface PriceData {
  date: string;
  tomatoes: number;
  potatoes: number;
  onions: number;
}

interface MarketPriceChartProps {
  data: PriceData[];
}

export function MarketPriceChart({ data }: MarketPriceChartProps) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  
  // Transform data based on period
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  const config = {
    tomatoes: {
      theme: {
        light: "#10B981", // emerald-500
        dark: "#10B981",
      },
    },
    potatoes: {
      theme: {
        light: "#059669", // emerald-600
        dark: "#059669",
      },
    },
    onions: {
      theme: {
        light: "#047857", // emerald-700
        dark: "#047857",
      },
    },
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900">Market Price Trends</CardTitle>
        <Tabs defaultValue="monthly" className="w-[200px]" onValueChange={(v) => setPeriod(v as "weekly" | "monthly")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[300px]" config={config}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTomatoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPotatoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOnions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#047857" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#6B7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "#6B7280" }}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `₹${value}`}
                tick={{ fill: "#6B7280" }}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#374151', fontWeight: 500 }}
                itemStyle={{ color: '#374151' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="tomatoes" 
                stroke="#10B981" 
                fillOpacity={1}
                fill="url(#colorTomatoes)" 
              />
              <Area 
                type="monotone" 
                dataKey="potatoes" 
                stroke="#059669" 
                fillOpacity={1}
                fill="url(#colorPotatoes)" 
              />
              <Area 
                type="monotone" 
                dataKey="onions" 
                stroke="#047857" 
                fillOpacity={1}
                fill="url(#colorOnions)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
