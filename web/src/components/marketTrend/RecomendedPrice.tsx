import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

const recommendedPrices = [
  {
    crop: "Tomatoes",
    price: 48,
    trend: "up",
    reason: "High seasonal demand",
  },
  {
    crop: "Potatoes",
    price: 28,
    trend: "down",
    reason: "Increased supply in nearby mandis",
  },
  {
    crop: "Onions",
    price: 35,
    trend: "up",
    reason: "Limited availability",
  },
];

export function RecommendedPrice() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {recommendedPrices.map((item) => (
        <div
          key={item.crop}
          className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{item.crop}</h3>
            {item.trend === "up" ? (
              <Badge className="bg-green-500">
                <TrendingUp className="mr-1 h-4 w-4" />
                Rising
              </Badge>
            ) : (
              <Badge variant="secondary">
                <TrendingDown className="mr-1 h-4 w-4" />
                Falling
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold mb-2">₹{item.price}/kg</p>
          <p className="text-sm text-gray-500">{item.reason}</p>
        </div>
      ))}
    </div>
  );
}
