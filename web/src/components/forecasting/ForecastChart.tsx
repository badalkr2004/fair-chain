"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartLine, TrendingUp, TrendingDown, Info, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

interface CropPriceChartProps {
  data: CropPriceData;
  isFullPage?: boolean;
}

const CropPriceChart: React.FC<CropPriceChartProps> = ({ data, isFullPage = false }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format the data for the chart
  const chartData = data.price_forecast.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
    if (!mounted) return null;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-green-100 transition-all duration-300">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-amber-600 font-bold text-lg">
            {formatPrice(payload[0].value)}
          </p>
          <p className="text-xs text-gray-500">
            {payload[0].payload.originalDate}
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle mouse enter/leave for data points
  const handleMouseEnter = (index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    if (isFullPage) {
      router.back();
    } else {
      router.push('/forecasting/crop-price');
    }
  };

  if (!mounted) {
    return (
      <Card className="w-full overflow-hidden border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-green-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-green-200 rounded"></div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-[400px] w-full bg-green-50 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.6,
            ease: "easeOut"
          }
        }
      }}
      className={cn(
        "w-full transition-all duration-300",
        isFullPage ? "fixed inset-0 z-50 bg-white" : "relative"
      )}
    >
      <Card className={cn(
        "w-full overflow-hidden border-green-100 shadow-lg",
        isFullPage ? "h-screen" : ""
      )}>
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                <ChartLine className="h-6 w-6 text-green-600" />
                {data.crop} Price Forecast
              </CardTitle>
              <CardDescription className="text-green-700">
                Last updated: {new Date(data.last_updated).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn(
                "text-white px-3 py-1",
                data.price_trend === "increasing" 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-amber-500 hover:bg-amber-600"
              )}>
                {data.price_trend === "increasing" ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )} 
                {data.price_trend.charAt(0).toUpperCase() + data.price_trend.slice(1)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreenToggle}
                className="text-green-600 hover:text-green-700"
              >
                {isFullPage ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={cn(
          "p-4",
          isFullPage ? "h-[calc(100vh-8rem)]" : ""
        )}>
          <div className="mb-4 flex items-center gap-2 bg-amber-50 p-3 rounded-md">
            <Info className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              Current price: <span className="font-bold">{formatPrice(data.current_price)}</span>
            </p>
          </div>
          
          <div className={cn(
            "w-full",
            isFullPage ? "h-[calc(100vh-16rem)]" : "h-[400px]"
          )}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#166534' }} 
                  axisLine={{ stroke: '#dcfce7' }}
                />
                <YAxis 
                  domain={[minPrice, maxPrice]} 
                  tick={{ fill: '#166534' }}
                  axisLine={{ stroke: '#dcfce7' }}
                  tickFormatter={(value) => value.toFixed(0)}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={data.current_price} 
                  stroke="#f59e0b" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: 'Current Price', 
                    position: 'insideBottomRight',
                    fill: '#d97706',
                    fontSize: 12
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#16a34a"
                  strokeWidth={3}
                  fill="url(#colorPrice)"
                  activeDot={{
                    r: 6,
                    stroke: "#f59e0b",
                    strokeWidth: 2,
                    fill: "#4ade80",
                    onMouseEnter: (data: any) => handleMouseEnter(data.index),
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 md:grid-cols-5">
            {chartData.map((item, index) => (
              <motion.div
                key={index}
                className={cn(
                  "rounded-lg border p-2 text-center transition-all",
                  activeIndex === index 
                    ? "border-amber-400 bg-amber-50 shadow-md" 
                    : "border-green-100 bg-green-50"
                )}
                whileHover={{ scale: 1.05 }}
                onHoverStart={() => handleMouseEnter(index)}
                onHoverEnd={handleMouseLeave}
              >
                <p className="text-xs text-green-700">{item.date}</p>
                <p className={cn(
                  "font-semibold transition-colors",
                  activeIndex === index ? "text-amber-600" : "text-green-700"
                )}>
                  {formatPrice(item.price)}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CropPriceChart;
