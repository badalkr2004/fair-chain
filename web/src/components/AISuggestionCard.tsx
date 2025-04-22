import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface AISuggestionCardProps {
  title: string;
  description: string;
  type: "crop" | "market" | "weather";
  className?: string;
}

export default function AISuggestionCard({ title, description, type, className }: AISuggestionCardProps) {
  // Select icon color based on suggestion type
  const getIconColor = () => {
    switch (type) {
      case "crop":
        return "bg-farm-green-light text-farm-green";
      case "market":
        return "bg-farm-gold-light text-farm-gold-dark";
      case "weather":
        return "bg-farm-sky-light text-farm-sky";
      default:
        return "bg-primary/10 text-primary";
    }
  };
  
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className={cn("rounded-full p-2", getIconColor())}>
          <Lightbulb className="h-4 w-4" />
        </div>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
