import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ForecastChart } from './ForecastChart';
import { forecastClient } from '@/lib/api/forecastClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface MarketTrendsProps {
  crops: string[];
}

export function MarketTrends({ crops }: MarketTrendsProps) {
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCropSelect = async (crop: string) => {
    setSelectedCrop(crop);
    setLoading(true);
    try {
      const response = await forecastClient.getMarketPrices(crop);
      if (response.success && response.data) {
        setForecastData(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch market prices",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Market Trends</h2>
        <Select
          value={selectedCrop}
          onValueChange={handleCropSelect}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a crop" />
          </SelectTrigger>
          <SelectContent>
            {crops.map((crop) => (
              <SelectItem key={crop} value={crop}>
                {crop}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : forecastData ? (
        <ForecastChart data={forecastData} />
      ) : (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          Select a crop to view market trends
        </div>
      )}
    </Card>
  );
} 