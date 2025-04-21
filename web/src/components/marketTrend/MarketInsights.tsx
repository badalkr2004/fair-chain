import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegionalDemand } from "@/lib/api/fairchain";

interface MarketInsightsProps {
  insights: RegionalDemand[];
}

export default function MarketInsights({ insights }: MarketInsightsProps) {
  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No market insights available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.crop} className="space-y-2">
              <h3 className="font-medium">{insight.crop}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Demand</p>
                  <p>{insight.demand.toLocaleString()} units</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Supply</p>
                  <p>{insight.supply.toLocaleString()} units</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p>₹{insight.price.toLocaleString()}/quintal</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{new Date(insight.last_updated).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 