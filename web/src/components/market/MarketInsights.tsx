"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MarketInsight {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  source: string;
}

interface MarketInsightsProps {
  insights: MarketInsight[];
}

export function MarketInsights({ insights }: MarketInsightsProps) {
  return (
    <div className="transition-transform duration-200 hover:scale-[1.01]">
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 bg-white cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {insight.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Source: {insight.source}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.impact === "high"
                      ? "bg-red-100 text-red-800"
                      : insight.impact === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {insight.impact} impact
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