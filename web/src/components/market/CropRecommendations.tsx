"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OptimalCrop {
  crop: string;
  current_yield: number;
  yield_trend: string;
  growth_potential: number;
  confidence_score: number;
  forecasted_yield: number;
  profit_potential: string;
}

interface CropRecommendation {
  crop: string;
  score: number;
  reason: string;
}

interface CropRecommendationsProps {
  recommendations: (OptimalCrop | CropRecommendation)[];
}

export default function CropRecommendations({ recommendations }: CropRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crop Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recommendations available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crop Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{rec.crop}</h4>
                {'reason' in rec ? (
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Yield trend: {rec.yield_trend}, Profit potential: {rec.profit_potential}
                  </p>
                )}
              </div>
              <Badge variant="secondary">
                {'score' in rec ? `${rec.score}%` : `${rec.confidence_score}%`}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 