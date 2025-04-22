import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ConsumerStatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
}

export function ConsumerStatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: ConsumerStatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-blue-700">{value}</p>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.positive ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {trend.positive ? "+" : "-"}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 