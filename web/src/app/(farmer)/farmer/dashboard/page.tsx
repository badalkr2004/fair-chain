"use client";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import ProduceCard from "@/components/ProduceCard";
import ChartComponent from "@/components/ChartComponent";
import AISuggestionCard from "@/components/AISuggestionCard";
import WeatherWidget from "@/components/WeatherWidget";
import PaymentHistoryCard from "@/components/PaymentHistoryCard";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBasket, TrendingUp, Truck, DollarSign, Star } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { Product, ProductsResponse } from "@/lib/api/types";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [produce, setProduce] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProduce: 0,
    marketPrice: 0,
    deliveries: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we have a token
        const token = localStorage.getItem('token');
        console.log('Current token:', token);
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        console.log('Fetching produce...');
        // Fetch farmer's produce
        const produceResponse = await apiClient.getProduce();
        console.log('Raw produce response:', produceResponse);

        if (produceResponse.success) {
          // Handle the API response structure
          const responseData = produceResponse.data as unknown as { data: { produce: Product[] } };
          console.log('Response data structure:', responseData);
          
          // Extract products from the nested structure
          const products = responseData?.data?.produce || [];
          console.log('Extracted products:', products);
          
          setProduce(products);
          
          // Calculate stats from produce
          const totalProduce = products.reduce((sum: number, item: Product) => sum + (item.quantity || 0), 0);
          const marketPrice = products.length > 0 
            ? products.reduce((sum: number, item: Product) => sum + (item.basePrice || 0), 0) / products.length 
            : 0;

          console.log('Calculated stats:', { totalProduce, marketPrice });

          setStats({
            totalProduce,
            marketPrice,
            deliveries: 0, // TODO: Fetch from orders API
            monthlyRevenue: 0 // TODO: Fetch from transactions API
          });
        } else {
          console.error('API response was not successful:', produceResponse);
          throw new Error(produceResponse.message || 'Failed to fetch produce');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Debug render
  console.log('Current state:', { isLoading, error, produce, stats });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard 
          title="Total Produce" 
          value={`${stats.totalProduce} kg`} 
          icon={<ShoppingBasket className="h-full w-full" />} 
          description={`Across ${produce.length} active listings`}
          trend={{ value: 12, positive: true }}
        />
        <StatCard 
          title="Market Price" 
          value={`₹${stats.marketPrice.toFixed(2)}/kg`} 
          icon={<TrendingUp className="h-full w-full" />} 
          description="Avg. for your crops"
          trend={{ value: 5, positive: true }}
        />
        <StatCard 
          title="Deliveries" 
          value={stats.deliveries.toString()} 
          icon={<Truck className="h-full w-full" />} 
          description="0 pending, 0 completed"
        />
        <StatCard 
          title="Monthly Revenue" 
          value={`₹${stats.monthlyRevenue.toLocaleString()}`} 
          icon={<DollarSign className="h-full w-full" />} 
          description="Last month: ₹0"
          trend={{ value: 0, positive: true }}
        />
      </div>
      
      {/* Main content layout */}
      <div className="grid gap-6 md:grid-cols-6">
        {/* Left column - Market trends & produce listings */}
        <div className="md:col-span-4 space-y-6">
          <ChartComponent title="Market Price Trends" products={produce} />
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Produce Listings</h2>
            <Button variant="ghost" size="sm" className="text-farm-green">
              View All
            </Button>
          </div>
          
          {produce.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No produce listings found</p>
              <Button className="mt-4" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add New Listing
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {produce.map((item) => (
                <ProduceCard 
                  key={item.id}
                  image={item.images?.[0] || "/sabji.jpg"}
                  name={item.name}
                  quantity={`${item.quantity || 0} ${item.unit || 'kg'}`}
                  price={`₹${item.basePrice || 0}/${item.unit || 'kg'}`}
                  status={item.status === "LISTED" ? "Available" : item.status === "SOLD" ? "Sold" : "In Transit"}
                  date={item.harvestDate || "N/A"}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Right column - Weather, AI suggestions, payments */}
        <div className="md:col-span-2 space-y-6">
          <WeatherWidget 
            location="Kanpur"
            temperature={28}
            condition="sunny"
            humidity={65}
          />
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">AI Suggestions</h2>
            <AISuggestionCard 
              type="market"
              title="Market Opportunity"
              description="High demand for tomatoes expected next month. Consider planting more."
            />
            <AISuggestionCard 
              type="weather"
              title="Weather Alert"
              description="Prepare for heavy rainfall next week. Consider harvesting earlier."
            />
          </div>
          
          <PaymentHistoryCard payments={[]} />
          
          <div className="p-4 border rounded-lg bg-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-farm-gold" />
              <h3 className="font-medium">Rating Overview</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">4.8/5</div>
              <span className="text-xs text-muted-foreground">Based on 26 reviews</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;