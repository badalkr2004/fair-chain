"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fairChainClient } from "@/lib/api/fairchain";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface RegionData {
  status: string;
  regions: string[];
  count: number;
}

interface CropData {
  status: string;
  crops: string[];
  count: number;
}

export function RegionsAndCropsChart() {
  const { toast } = useToast();
  const [regionData, setRegionData] = useState<RegionData | null>(null);
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch regions data using the public method
        const regionsResponse = await fairChainClient.getRegions();
        if (regionsResponse.success) {
          setRegionData(regionsResponse.data || null);
        }

        // Fetch crops data using the public method
        const cropsResponse = await fairChainClient.getCrops();
        if (cropsResponse.success) {
          setCropData(cropsResponse.data || null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch regions and crops data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredRegions = regionData?.regions.filter(region => 
    region.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredCrops = cropData?.crops.filter(crop => 
    crop.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-farm-green" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regions and Crops</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="regions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="crops">Crops</TabsTrigger>
          </TabsList>
          <TabsContent value="regions">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {filteredRegions.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span>{region}</span>
                    <Badge variant="outline">{regionData?.count || 0}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="crops">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {filteredCrops.map((crop, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span>{crop}</span>
                    <Badge variant="outline">{cropData?.count || 0}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 