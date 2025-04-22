"use client";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import ProduceCard from "@/components/ProduceCard";
import ChartComponent from "@/components/ChartComponent";
import AISuggestionCard from "@/components/AISuggestionCard";
import WeatherWidget from "@/components/WeatherWidget";
import PaymentHistoryCard from "@/components/PaymentHistoryCard";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ShoppingBasket,
  TrendingUp,
  Truck,
  DollarSign,
  Star,
  User,
  MapPin,
  Leaf,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { Product } from "@/lib/api/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [produce, setProduce] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProduce: 0,
    marketPrice: 0,
    deliveries: 0,
    monthlyRevenue: 0,
  });
  const [farmerProfile, setFarmerProfile] = useState<any>(null);

  const user = useAuthStore((state) => state.user);
  const initialFarmerProfile = user?.farmerProfile;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch farmer's profile
        const profileResponse = await apiClient.getFarmerProfile();
        if (profileResponse.success) {
          setFarmerProfile(profileResponse.data);
        }

        // Fetch farmer's produce
        const produceResponse = await apiClient.getMyProduce();
        console.log("Raw API Response:", produceResponse);

        if (produceResponse.success) {
          // Handle different possible response structures
          let products: Product[] = [];

          if (Array.isArray(produceResponse.data)) {
            products = produceResponse.data;
          } else if (
            produceResponse.data &&
            typeof produceResponse.data === "object"
          ) {
            const responseData = produceResponse.data as Record<string, any>;
            // Handle nested data structure
            if (Array.isArray(responseData.data)) {
              products = responseData.data;
            } else if (Array.isArray(responseData.produce)) {
              products = responseData.produce;
            }
          }

          console.log("Processed Products:", products);

          setProduce(products);

          // Calculate stats from produce
          const totalProduce = products.reduce((sum, item) => {
            const quantity = Number(item?.quantity) || 0;
            return sum + quantity;
          }, 0);

          const marketPrice =
            products.length > 0
              ? products.reduce((sum, item) => {
                  const price = Number(item?.basePrice) || 0;
                  return sum + price;
                }, 0) / products.length
              : 0;

          // Calculate deliveries (products in transit or sold)
          const deliveries = products.filter(
            (p) => p?.status === "PROCESSING" || p?.status === "SOLD"
          ).length;

          // Calculate monthly revenue (from sold products)
          const monthlyRevenue = products
            .filter((p) => p?.status === "SOLD")
            .reduce((sum, item) => {
              const price = Number(item?.finalPrice || item?.basePrice) || 0;
              const quantity = Number(item?.quantity) || 0;
              return sum + price * quantity;
            }, 0);

          setStats({
            totalProduce,
            marketPrice,
            deliveries,
            monthlyRevenue,
          });
        } else {
          throw new Error(produceResponse.message || "Failed to fetch produce");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

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
    <div className="space-y-6">
      {/* Welcome Section with Profile */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's your farming dashboard overview
          </p>
        </div>
        <Card className="w-64">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">
                  {user?.name}
                </CardTitle>
                <CardDescription className="text-xs">Farmer</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                {farmerProfile?.farmLocation ||
                  initialFarmerProfile?.location ||
                  "Location not set"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Leaf className="h-4 w-4" />
              <span>
                {farmerProfile?.farmSize || initialFarmerProfile?.farmSize || 0}{" "}
                acres
              </span>
            </div>
            {(farmerProfile?.certifications ||
              initialFarmerProfile?.certifications) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(
                  farmerProfile?.certifications ||
                  initialFarmerProfile?.certifications ||
                  []
                ).map((cert: string) => (
                  <Badge key={cert} variant="secondary" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
          description={`${
            produce.filter((p) => p?.status === "PROCESSING").length
          } pending, ${
            produce.filter((p) => p?.status === "SOLD").length
          } completed`}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-full w-full" />}
          description="From sold produce"
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
                  quantity={`${item.quantity || 0} ${item.unit || "kg"}`}
                  price={`₹${item.basePrice || 0}/${item.unit || "kg"}`}
                  status={
                    item.status === "LISTED"
                      ? "Available"
                      : item.status === "SOLD"
                      ? "Sold"
                      : "In Transit"
                  }
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
              <span className="text-xs text-muted-foreground">
                Based on 26 reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
