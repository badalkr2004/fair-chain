
import { MarketPriceChart } from "@/components/marketTrend/MarketPriceChart";
import { PriceComparison } from "@/components/marketTrend/PriceComparison";
import { RecommendedPrice } from "@/components/marketTrend/RecomendedPrice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - In a real app, this would come from an API
const mockTrendData = [
  { date: "2024-03-15", tomatoes: 40, potatoes: 25, onions: 30 },
  { date: "2024-03-22", tomatoes: 45, potatoes: 22, onions: 35 },
  { date: "2024-03-29", tomatoes: 42, potatoes: 28, onions: 32 },
  { date: "2024-04-05", tomatoes: 48, potatoes: 30, onions: 28 },
  { date: "2024-04-12", tomatoes: 50, potatoes: 27, onions: 33 },
  { date: "2024-04-19", tomatoes: 47, potatoes: 29, onions: 36 },
];

const nearbyMandis = [
  { name: "Central Mandi", tomatoes: 45, potatoes: 28, onions: 34 },
  { name: "East Mandi", tomatoes: 43, potatoes: 26, onions: 35 },
  { name: "West Mandi", tomatoes: 46, potatoes: 29, onions: 33 },
];

export default function MarketPriceTrends() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Market Price Trends</h1>
        <p className="mt-2 text-gray-600">
          Track real-time mandi prices and market trends
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Price Trends (Last 6 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketPriceChart data={mockTrendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nearby Mandi Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceComparison data={nearbyMandis} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recommended Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <RecommendedPrice />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
