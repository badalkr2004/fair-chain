import StatCard from "@/components/StatCard";
import ProduceCard from "@/components/ProduceCard";
import ChartComponent from "@/components/ChartComponent";
import AISuggestionCard from "@/components/AISuggestionCard";
import WeatherWidget from "@/components/WeatherWidget";
import PaymentHistoryCard from "@/components/PaymentHistoryCard";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBasket, TrendingUp, Truck, DollarSign, Star } from "lucide-react";

// Mock data for the dashboard
const recentPayments = [
  {
    id: "1",
    date: "Today, 2:30 PM",
    amount: "₹5,200",
    status: "completed" as const,
    buyer: "Fresh Mart"
  },
  {
    id: "2",
    date: "Yesterday, 1:15 PM",
    amount: "₹3,800",
    status: "completed" as const,
    buyer: "Green Grocers"
  },
  {
    id: "3",
    date: "Jan 18, 2025",
    amount: "₹7,500",
    status: "pending" as const,
    buyer: "Farm2Table Co"
  }
];

const produceList = [
  {
    image: "https://images.unsplash.com/photo-1594057687713-5fd14eed1c17?q=80&auto=format",
    name: "Organic Tomatoes",
    quantity: "200 kg",
    price: "₹40/kg",
    status: "Available" as const,
    date: "Jan 15, 2025"
  },
  {
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&auto=format",
    name: "Fresh Potatoes",
    quantity: "350 kg",
    price: "₹25/kg",
    status: "In Transit" as const,
    date: "Jan 10, 2025"
  },
  {
    image: "/sabji.jpg",
    name: "Premium Wheat",
    quantity: "500 kg",
    price: "₹30/kg",
    status: "Sold" as const,
    date: "Jan 5, 2025"
  }
];

const Index = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Farm Dashboard</h1>
        <Button className="bg-farm-green hover:bg-farm-green-dark">
          <Plus className="mr-1 h-4 w-4" /> Add New Produce
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard 
          title="Total Produce" 
          value="1,050 kg" 
          icon={<ShoppingBasket className="h-full w-full" />} 
          description="Across 3 active listings"
          trend={{ value: 12, positive: true }}
        />
        <StatCard 
          title="Market Price" 
          value="₹32/kg" 
          icon={<TrendingUp className="h-full w-full" />} 
          description="Avg. for your crops"
          trend={{ value: 5, positive: true }}
        />
        <StatCard 
          title="Deliveries" 
          value="8" 
          icon={<Truck className="h-full w-full" />} 
          description="2 pending, 6 completed"
        />
        <StatCard 
          title="Monthly Revenue" 
          value="₹42,500" 
          icon={<DollarSign className="h-full w-full" />} 
          description="Last month: ₹38,200"
          trend={{ value: 11, positive: true }}
        />
      </div>
      
      {/* Main content layout */}
      <div className="grid gap-6 md:grid-cols-6">
        {/* Left column - Market trends & produce listings */}
        <div className="md:col-span-4 space-y-6">
          <ChartComponent title="Market Price Trends" />
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Produce Listings</h2>
            <Button variant="ghost" size="sm" className="text-farm-green">
              View All
            </Button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {produceList.map((produce, index) => (
              <ProduceCard key={index} {...produce} />
            ))}
          </div>
        </div>
        
        {/* Right column - Weather, AI suggestions, payments */}
        <div className="md:col-span-2 space-y-6">
          <WeatherWidget 
            location="Kanpur"
            temperature={28}
            condition="sunny"
            humidity={65}
          />
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">AI Suggestions</h2>
            <AISuggestionCard 
              type="market"
              title="Market Opportunity"
              description="High demand for tomatoes expected next month. Consider planting more."
            />
            <AISuggestionCard 
              type="weather"
              title="Weather Alert"
              description="Prepare for heavy rainfall next week. Consider harvesting earlier."
            />
          </div>
          
          <PaymentHistoryCard payments={recentPayments} />
          
          <div className="p-4 border rounded-lg bg-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-farm-gold" />
              <h3 className="font-medium">Rating Overview</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">4.8/5</div>
              <span className="text-xs text-muted-foreground">Based on 26 reviews</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;