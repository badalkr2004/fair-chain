"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Info, Search, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CropsData {
  status: string;
  crops: string[];
  count: number;
}

interface CropsChartProps {
  data: CropsData;
  isFullPage?: boolean;
}

const CropsChart: React.FC<CropsChartProps> = ({ data, isFullPage = false }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format the data for the chart with random values for visualization
  const chartData = data.crops
    .filter(crop => 
      crop.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((crop) => ({
      name: crop,
      yield: Math.floor(Math.random() * 100) + 50, // Random value between 50-150
      price: Math.floor(Math.random() * 100) + 30, // Random value between 30-130
    }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!mounted) return null;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-green-100 transition-all duration-300">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <div className="space-y-1">
            <p className="text-green-600 font-bold">
              Yield Index: {payload[0].value}
            </p>
            <p className="text-amber-600 font-bold">
              Price Index: {payload[1].value}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle crop selection
  const handleCropClick = (crop: string) => {
    setSelectedCrop(crop === selectedCrop ? null : crop);
  };

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    if (isFullPage) {
      router.back();
    } else {
      router.push('/forecasting/crops');
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
        isFullPage ? "fixed inset-0 z-50 bg-white p-8" : "relative"
      )}
    >
      <Card className={cn(
        "w-full overflow-hidden border-green-100 shadow-lg",
        isFullPage ? "h-[calc(100vh-4rem)]" : ""
      )}>
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                Crops Analysis
              </CardTitle>
              <CardDescription className="text-green-700">
                Total Crops: {data.count}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white px-3 py-1">
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
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
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-2 bg-green-50 p-3 rounded-md">
            <Info className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">
              Click on a crop to view details
            </p>
          </div>

          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search crops..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={cn(
            "w-full",
            isFullPage ? "h-[calc(100vh-16rem)]" : "h-[500px]"
          )}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                layout="vertical"
                barGap={0}
                barCategoryGap={10}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{ fill: '#166534', fontSize: 12 }}
                  axisLine={{ stroke: '#dcfce7' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="yield"
                  name="Yield Index"
                  fill="#4ade80"
                  radius={[0, 4, 4, 0]}
                  onClick={(data) => handleCropClick(data.name)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={selectedCrop === entry.name ? '#16a34a' : '#4ade80'}
                      className="cursor-pointer transition-colors duration-200"
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="price"
                  name="Price Index"
                  fill="#f59e0b"
                  radius={[0, 4, 4, 0]}
                  onClick={(data) => handleCropClick(data.name)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-price-${index}`}
                      fill={selectedCrop === entry.name ? '#d97706' : '#f59e0b'}
                      className="cursor-pointer transition-colors duration-200"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {selectedCrop && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Selected Crop
              </h3>
              <p className="text-green-700">{selectedCrop}</p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-green-100">
                  <p className="text-sm text-gray-600">Yield Index</p>
                  <p className="text-lg font-semibold text-green-600">
                    {chartData.find(d => d.name === selectedCrop)?.yield}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-100">
                  <p className="text-sm text-gray-600">Price Index</p>
                  <p className="text-lg font-semibold text-amber-600">
                    {chartData.find(d => d.name === selectedCrop)?.price}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CropsChart; 