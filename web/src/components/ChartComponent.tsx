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
import { useState } from "react";

// Sample data for the chart
const monthlyData = [
  { name: "Jan", Tomato: 150, Potato: 180, Wheat: 120 },
  { name: "Feb", Tomato: 170, Potato: 190, Wheat: 110 },
  { name: "Mar", Tomato: 200, Potato: 170, Wheat: 125 },
  { name: "Apr", Tomato: 220, Potato: 160, Wheat: 140 },
  { name: "May", Tomato: 190, Potato: 150, Wheat: 130 },
  { name: "Jun", Tomato: 210, Potato: 180, Wheat: 150 },
];

const weeklyData = [
  { name: "Mon", Tomato: 180, Potato: 150, Wheat: 120 },
  { name: "Tue", Tomato: 200, Potato: 160, Wheat: 125 },
  { name: "Wed", Tomato: 210, Potato: 170, Wheat: 130 },
  { name: "Thu", Tomato: 190, Potato: 165, Wheat: 128 },
  { name: "Fri", Tomato: 220, Potato: 180, Wheat: 135 },
  { name: "Sat", Tomato: 215, Potato: 175, Wheat: 137 },
  { name: "Sun", Tomato: 230, Potato: 185, Wheat: 140 },
];

interface ChartComponentProps {
  title: string;
  className?: string;
}

export default function ChartComponent({ title, className }: ChartComponentProps) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  
  const data = period === "monthly" ? monthlyData : weeklyData;
  
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
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTomato" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#52B788" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#52B788" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPotato" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F9CB54" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F9CB54" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="Tomato" 
              stroke="#52B788" 
              fillOpacity={1}
              fill="url(#colorTomato)" 
            />
            <Area 
              type="monotone" 
              dataKey="Potato" 
              stroke="#F9CB54" 
              fillOpacity={1}
              fill="url(#colorPotato)" 
            />
            <Area 
              type="monotone" 
              dataKey="Wheat" 
              stroke="#0EA5E9" 
              fillOpacity={1}
              fill="url(#colorWheat)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
