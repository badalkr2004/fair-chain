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
        light: "#EF4444", // red-500
        dark: "#EF4444",
      },
    },
    potatoes: {
      theme: {
        light: "#3B82F6", // blue-500
        dark: "#3B82F6",
      },
    },
    onions: {
      theme: {
        light: "#10B981", // emerald-500
        dark: "#10B981",
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
      <CardContent className="p-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTomatoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPotatoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOnions" x1="0" y1="0" x2="0" y2="1">
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
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{
                  paddingTop: '10px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="tomatoes" 
                name="Tomatoes" 
                stroke="#EF4444" 
                fillOpacity={1}
                fill="url(#colorTomatoes)" 
              />
              <Area 
                type="monotone" 
                dataKey="potatoes" 
                name="Potatoes" 
                stroke="#3B82F6" 
                fillOpacity={1}
                fill="url(#colorPotatoes)" 
              />
              <Area 
                type="monotone" 
                dataKey="onions" 
                name="Onions" 
                stroke="#10B981" 
                fillOpacity={1}
                fill="url(#colorOnions)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
