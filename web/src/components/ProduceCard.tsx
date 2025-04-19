import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProduceCardProps {
  image: string;
  name: string;
  quantity: string;
  price: string;
  status: "Available" | "In Transit" | "Sold";
  date: string;
  className?: string;
}

export default function ProduceCard({ image, name, quantity, price, status, date, className }: ProduceCardProps) {
  const getStatusClass = () => {
    switch (status) {
      case "Available":
        return "status-available";
      case "In Transit":
        return "status-inTransit";
      case "Sold":
        return "status-sold";
      default:
        return "";
    }
  };
  
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <div className="relative h-40 w-full">
        <img 
          src={image} 
          alt={name}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={cn("status-badge", getStatusClass())}>
            {status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-1 text-lg font-semibold">{name}</div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">{quantity}</div>
          <div className="font-bold text-farm-green">{price}</div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-4 py-3 text-xs text-muted-foreground">
        Harvest date: {date}
      </CardFooter>
    </Card>
  );
}