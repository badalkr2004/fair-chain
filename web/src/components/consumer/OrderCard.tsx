import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OrderItem {
  quantity: number;
  name: string;
}

interface OrderCardProps {
  id: string;
  date: string;
  items: OrderItem[];
  expectedDelivery: string;
  subtotal: number;
  tax: number;
  total: number;
  status: "Confirmed" | "Processing" | "Delivered" | "Cancelled";
  onTrack: () => void;
  onViewDetails: () => void;
}

export function OrderCard({
  id,
  date,
  items,
  expectedDelivery,
  subtotal,
  tax,
  total,
  status,
  onTrack,
  onViewDetails,
}: OrderCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-blue-50 text-blue-600";
      case "Delivered":
        return "bg-blue-200 text-blue-900";
      case "Cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-900">{id}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(status)}`}>
                {status}
              </span>
            </div>
            <p className="text-gray-600 mb-4">Ordered on {date}</p>
            
            <div className="grid grid-cols-3 gap-8">
              <div>
                <h4 className="font-medium mb-2 text-blue-900">Items</h4>
                {items.map((item, index) => (
                  <p key={index} className="text-gray-600">
                    {item.quantity} × {item.name}
                  </p>
                ))}
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-blue-900">Delivery Information</h4>
                <p className="text-gray-600">Expected by {expectedDelivery}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-blue-900">Order Summary</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-blue-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-blue-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-blue-900">Total:</span>
                    <span className="text-blue-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <Button 
            variant="outline" 
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={onViewDetails}
          >
            View Details
          </Button>
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={onTrack}
          >
            Track Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 