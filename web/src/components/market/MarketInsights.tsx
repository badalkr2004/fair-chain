"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegionalDemand } from "@/lib/api/fairchain";

interface MarketInsightsProps {
  insights: RegionalDemand[];
}

export function MarketInsights({ insights }: MarketInsightsProps) {
  if (!insights || insights.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">No market insights available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="transition-transform duration-200 hover:scale-[1.01]">
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.crop}
                className="p-4 rounded-lg border border-gray-200 bg-white cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{insight.crop}</h3>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>Demand: {insight.demand.toLocaleString()} units</p>
                      <p>Supply: {insight.supply.toLocaleString()} units</p>
                      <p>Price: ₹{insight.price.toLocaleString()}/quintal</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Last Updated: {new Date(insight.last_updated).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.demand > insight.supply
                      ? "bg-red-100 text-red-800"
                      : insight.demand === insight.supply
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {insight.demand > insight.supply ? "High Demand" : insight.demand === insight.supply ? "Balanced" : "High Supply"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 