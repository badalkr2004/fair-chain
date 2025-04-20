"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, TrendingUp, CreditCard } from "lucide-react";
import { ConsumerStatCard } from "@/components/consumer/ConsumerStatCard";
import { OrderCard } from "@/components/consumer/OrderCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const mockOrders = [
  {
    id: "ORD-2024-001",
    date: "April 20, 2024",
    items: [
      { quantity: 2, name: "Fresh Tomatoes" },
      { quantity: 1, name: "Organic Potatoes" },
    ],
    expectedDelivery: "4/23/2024",
    subtotal: 15.99,
    tax: 1.20,
    total: 17.19,
    status: "Processing" as const,
  },
  {
    id: "ORD-2024-002",
    date: "April 19, 2024",
    items: [
      { quantity: 3, name: "Organic Onions" },
      { quantity: 2, name: "Fresh Carrots" },
    ],
    expectedDelivery: "4/22/2024",
    subtotal: 12.50,
    tax: 0.94,
    total: 13.44,
    status: "Confirmed" as const,
  },
];

const stats = [
  {
    title: "Active Orders",
    value: "3",
    icon: Package,
    description: "In progress",
  },
  {
    title: "Order History",
    value: "12",
    icon: Clock,
    description: "Last 30 days",
    trend: { value: 8, positive: true },
  },
  {
    title: "Total Savings",
    value: "₹450",
    icon: TrendingUp,
    description: "vs. Market Price",
    trend: { value: 15, positive: true },
  },
  {
    title: "Total Spent",
    value: "₹2,850",
    icon: CreditCard,
    description: "Last 30 days",
  },
];

export default function ConsumerDashboard() {
  const [selectedTab, setSelectedTab] = useState("all");

  const handleTrackOrder = (orderId: string) => {
    console.log("Tracking order:", orderId);
  };

  const handleViewDetails = (orderId: string) => {
    console.log("Viewing details for order:", orderId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Welcome back, John!</h1>
          <p className="text-gray-600">Track your orders and discover fresh produce directly from farmers.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <ConsumerStatCard
              key={stat.title}
              {...stat}
            />
          ))}
        </div>

        {/* Recent Orders Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-blue-900">Recent Orders</h2>
          </div>

          <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
            <TabsList className="bg-blue-50 text-blue-600">
              <TabsTrigger value="all" className="data-[state=active]:bg-white">All Orders</TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white">Active</TabsTrigger>
              <TabsTrigger value="delivered" className="data-[state=active]:bg-white">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled" className="data-[state=active]:bg-white">Cancelled</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              {mockOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  {...order}
                  onTrack={() => handleTrackOrder(order.id)}
                  onViewDetails={() => handleViewDetails(order.id)}
                />
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
