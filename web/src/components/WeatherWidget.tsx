import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, CloudRain, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  location: string;
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy";
  humidity: number;
  className?: string;
}

export default function WeatherWidget({ location, temperature, condition, humidity, className }: WeatherWidgetProps) {
  const getWeatherIcon = () => {
    switch (condition) {
      case "sunny":
        return <CloudSun className="h-8 w-8 text-farm-gold" />;
      case "rainy":
        return <CloudRain className="h-8 w-8 text-farm-sky" />;
      case "cloudy":
        return <CloudSun className="h-8 w-8 text-muted-foreground" />;
      default:
        return <CloudSun className="h-8 w-8 text-farm-gold" />;
    }
  };
  
  const getConditionText = () => {
    switch (condition) {
      case "sunny":
        return "Sunny";
      case "rainy":
        return "Rainy";
      case "cloudy":
        return "Cloudy";
      default:
        return "Unknown";
    }
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Weather - {location}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center">
              <Thermometer className="h-5 w-5 mr-2 text-destructive/70" />
              <span className="text-3xl font-bold">{temperature}°C</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Humidity: {humidity}%
            </div>
          </div>
          <div className="flex flex-col items-center">
            {getWeatherIcon()}
            <span className="mt-1 text-sm">{getConditionText()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}