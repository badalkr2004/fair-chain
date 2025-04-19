"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface PriceTrendsChartProps {
  data: {
    date: string;
    tomatoes: number;
    potatoes: number;
    onions: number;
  }[];
}

export function PriceTrendsChart({ data }: PriceTrendsChartProps) {
  return (
    <div className="transition-transform duration-200 hover:scale-[1.01]">
      <Card>
        <CardHeader>
          <CardTitle>Price Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
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
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 