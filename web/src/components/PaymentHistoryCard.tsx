
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  date: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  buyer: string;
}

interface PaymentHistoryCardProps {
  payments: Payment[];
  className?: string;
}

export default function PaymentHistoryCard({ payments, className }: PaymentHistoryCardProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-farm-green/20 text-farm-green";
      case "pending":
        return "bg-farm-gold/20 text-farm-gold-dark";
      case "failed":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Recent Payments</CardTitle>
        <Button variant="ghost" className="h-8 text-xs">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{payment.buyer}</p>
                <p className="text-xs text-muted-foreground">{payment.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{payment.amount}</span>
                <span className={cn("text-xs px-1.5 py-0.5 rounded-full", getStatusBadgeClass(payment.status))}>
                  {payment.status}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
