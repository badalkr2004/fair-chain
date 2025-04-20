"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, IndianRupee, CheckCircle } from "lucide-react";
import Image from "next/image";

interface ListingCardProps {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  basePrice: number;
  finalPrice?: number;
  images?: string[];
  harvestDate?: Date;
  availableUntil?: Date;
  status: "DRAFT" | "AVAILABLE" | "SOLD";
  location?: string;
  organicCertified: boolean;
}

// Dummy data for testing
const dummyData: ListingCardProps = {
  id: "1",
  name: "Fresh Organic Tomatoes",
  description: "Freshly harvested organic tomatoes from our farm",
  category: "vegetables",
  quantity: 100,
  unit: "kg",
  basePrice: 50,
  finalPrice: 45,
  images: ["/tomatoes.jpg"],
  harvestDate: new Date(),
  availableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  status: "AVAILABLE",
  location: "Mumbai, Maharashtra",
  organicCertified: true
};

export function ListingCard({
  id = dummyData.id,
  name = dummyData.name,
  description = dummyData.description,
  category = dummyData.category,
  quantity = dummyData.quantity,
  unit = dummyData.unit,
  basePrice = dummyData.basePrice,
  finalPrice = dummyData.finalPrice,
  images = dummyData.images,
  harvestDate = dummyData.harvestDate,
  availableUntil = dummyData.availableUntil,
  status = dummyData.status,
  location = dummyData.location,
  organicCertified = dummyData.organicCertified,
}: ListingCardProps) {
  const statusColors = {
    DRAFT: "bg-gray-100 text-gray-800",
    AVAILABLE: "bg-emerald-100 text-emerald-800",
    SOLD: "bg-amber-100 text-amber-800",
  };

  const statusLabels = {
    DRAFT: "Draft",
    AVAILABLE: "Available",
    SOLD: "Sold"
  };

  const imageUrl = images && images.length > 0 ? images[0] : "/sabji.jpg";

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-gray-200">
      <div className="relative h-48 w-full overflow-hidden bg-gray-50">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
        <div className="absolute right-2 top-2 flex gap-2">
          <Badge className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
          {organicCertified && (
            <Badge className="bg-emerald-100 text-emerald-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Organic
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold text-gray-900">{name}</CardTitle>
        <CardDescription className="text-gray-600">
          {description || "No description available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 p-4 pt-0">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Category:</span>
          <span className="font-medium text-gray-900 capitalize">{category}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium text-gray-900">{quantity} {unit}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base Price:</span>
          <span className="font-medium text-gray-900">₹{basePrice}/{unit}</span>
        </div>
        {finalPrice && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Final Price:</span>
            <span className="font-medium text-gray-900">₹{finalPrice}/{unit}</span>
          </div>
        )}
        {harvestDate && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Harvested on {new Date(harvestDate).toLocaleDateString()}</span>
          </div>
        )}
        {availableUntil && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Available until {new Date(availableUntil).toLocaleDateString()}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50">
            View Details
          </Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            Contact Seller
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
