"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, IndianRupee } from "lucide-react";
import Image from "next/image";

interface ListingCardProps {
  name: string;
  quantity: string;
  price: number;
  harvestDate: Date;
  status: "Available" | "In Transit" | "Sold";
  image: string;
  interestedBuyers: number;
}

export function ListingCard({
  name,
  quantity,
  price,
  harvestDate,
  status,
  image,
  interestedBuyers,
}: ListingCardProps) {
  const statusColors = {
    Available: "bg-emerald-100 text-emerald-800",
    "In Transit": "bg-amber-100 text-amber-800",
    Sold: "bg-gray-100 text-gray-800",
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-gray-200">
      <div className="relative h-48 w-full overflow-hidden bg-gray-50">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
        <Badge className={`absolute right-2 top-2 ${statusColors[status]}`}>
          {status}
        </Badge>
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold text-gray-900">{name}</CardTitle>
        <CardDescription className="text-gray-600">
          Harvested on{" "}
          {harvestDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 p-4 pt-0">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium text-gray-900">{quantity}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Price:</span>
          <span className="font-medium text-gray-900">₹{price}/kg</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Interested Buyers:</span>
          <span className="font-medium text-gray-900">{interestedBuyers}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50">
            View Details
          </Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            Contact Buyer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
