"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CropRecommendation {
  crop: string;
  recommendation: string;
  confidence: string;
  trend: "upward" | "stable" | "downward";
}

interface CropRecommendationsProps {
  recommendations: CropRecommendation[];
}

export function CropRecommendations({ recommendations }: CropRecommendationsProps) {
  return (
    <div className="transition-transform duration-200 hover:scale-[1.01]">
      <Card>
        <CardHeader>
          <CardTitle>Crop Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((crop, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 bg-white cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{crop.crop}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {crop.recommendation}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-emerald-600">
                      {crop.confidence} confidence
                    </span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      crop.trend === "upward"
                        ? "bg-emerald-100 text-emerald-800"
                        : crop.trend === "stable"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {crop.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 