import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

interface DeliveryStep {
  title: string;
  description: string;
  status: "completed" | "current" | "pending";
  icon: typeof Package | typeof Truck | typeof CheckCircle | typeof Clock;
  timestamp?: string;
}

interface DeliveryTrackerProps {
  orderId: string;
  steps: DeliveryStep[];
}

export function DeliveryTracker({ orderId, steps }: DeliveryTrackerProps) {
  const getStepStyles = (status: DeliveryStep["status"]) => {
    switch (status) {
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "current":
        return "text-blue-700 bg-blue-100 border-blue-300";
      default:
        return "text-gray-400 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-900">Order Tracking - {orderId}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line connecting steps */}
          <div className="absolute left-6 top-0 h-full w-px bg-blue-100" />
          
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex gap-4">
                  <div className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${getStepStyles(step.status)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col pt-1">
                    <h4 className="font-medium text-blue-900">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.timestamp && (
                      <span className="mt-1 text-xs text-gray-400">{step.timestamp}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 