"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, IndianRupee, Users } from "lucide-react";
import Image from "next/image";
import { getCropImage } from "@/utils/cropImages";

interface ListingCardProps {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  price: number;
  status: "Available" | "In Transit" | "Sold";
  location: string;
  date: string;
  interestedBuyers: number;
}

export function ListingCard({
  id,
  crop,
  quantity,
  unit,
  price,
  status,
  location,
  date,
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
          src={getCropImage(crop)}
          alt={crop}
          fill
          className="object-cover"
        />
        <div className="absolute right-2 top-2">
          <Badge className={statusColors[status]}>
            {status}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold text-gray-900">{crop}</CardTitle>
        <CardDescription className="text-gray-600">
          {quantity} {unit} available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <IndianRupee className="h-4 w-4" />
          <span className="font-medium text-gray-900">₹{price}/{unit}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Listed on {new Date(date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{interestedBuyers} interested buyers</span>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50">
            View Details
          </Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            Contact Buyers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
