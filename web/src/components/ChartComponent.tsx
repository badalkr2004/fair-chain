"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { useState, useEffect } from "react";
import { Product } from "@/lib/api/types";

interface ChartComponentProps {
  title: string;
  className?: string;
  products: Product[];
}

export default function ChartComponent({ title, className, products }: ChartComponentProps) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Get unique categories
    const categories = Array.from(new Set(products.map(p => p.category)));
    
    // Generate more data points for smoother waves
    const generateWaveData = (baseValue: number, date: Date, index: number) => {
      const waveFactor = Math.sin(index * 0.5) * 0.2; // Creates wave effect
      const trendFactor = Math.sin(index * 0.1) * 0.1; // Creates overall trend
      return baseValue * (1 + waveFactor + trendFactor);
    };

    // Group products by date and category
    const groupedProducts = products.reduce((acc: { [key: string]: { [key: string]: { total: number; count: number } } }, product) => {
      const date = new Date(product.harvestDate || new Date());
      const baseDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!acc[baseDate]) {
        acc[baseDate] = {};
        categories.forEach(cat => {
          acc[baseDate][cat] = { total: 0, count: 0 };
        });
      }
      
      acc[baseDate][product.category].total += product.basePrice || 0;
      acc[baseDate][product.category].count += 1;
      return acc;
    }, {});

    // Create chart data with wave effect
    const data = Object.entries(groupedProducts)
      .map(([date, categoryData], index) => {
        const entry: any = { name: date };
        categories.forEach(category => {
          const stats = categoryData[category];
          const basePrice = stats.count > 0 ? stats.total / stats.count : 0;
          entry[category] = generateWaveData(basePrice, new Date(date), index);
        });
        return entry;
      })
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    // Add more data points for smoother waves
    const smoothedData = [];
    for (let i = 0; i < data.length - 1; i++) {
      smoothedData.push(data[i]);
      // Add intermediate points
      const currentDate = new Date(data[i].name);
      const nextDate = new Date(data[i + 1].name);
      const timeDiff = nextDate.getTime() - currentDate.getTime();
      
      // Add 2 intermediate points
      for (let j = 1; j <= 2; j++) {
        const intermediateDate = new Date(currentDate.getTime() + (timeDiff * j) / 3);
        const intermediateEntry: any = {
          name: intermediateDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        };
        categories.forEach(category => {
          const currentValue = data[i][category];
          const nextValue = data[i + 1][category];
          const progress = j / 3;
          intermediateEntry[category] = currentValue + (nextValue - currentValue) * progress;
        });
        smoothedData.push(intermediateEntry);
      }
    }
    smoothedData.push(data[data.length - 1]);

    setChartData(smoothedData);
  }, [products]);
  
  // Get unique categories for the chart
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <Tabs defaultValue="monthly" className="w-[200px]" onValueChange={(v) => setPeriod(v as "weekly" | "monthly")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {categories.map((category, index) => {
                const colors = ['#52B788', '#F9CB54', '#0EA5E9', '#EF4444', '#8B5CF6'];
                return (
                  <linearGradient key={category} id={`color${category}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `₹${value}`} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip 
              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            {categories.map((category, index) => {
              const colors = ['#52B788', '#F9CB54', '#0EA5E9', '#EF4444', '#8B5CF6'];
              return (
                <Area 
                  key={category}
                  type="monotone" 
                  dataKey={category} 
                  stroke={colors[index % colors.length]}
                  fillOpacity={1}
                  fill={`url(#color${category})`}
                  name={category}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
