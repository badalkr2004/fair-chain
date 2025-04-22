"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, Order } from "@/lib/api/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/store";
import { Search, Filter } from "lucide-react";

// Mock data with proper typing
const mockProducts: Product[] = [
  {
    "id": "f8b9fc8d-d3e6-4bf5-9469-6908868c66e8",
    "name": "Wheat",
    "description": "In good condition ",
    "farmerId": "a9a816e6-102b-4d39-8394-c14cee506ad4",
    "category": "GRAINS",
    "quantity": 500,
    "unit": "kg",
    "basePrice": 30,
    "finalPrice": 30,
    "images": [],
    "harvestDate": "2025-04-22T06:04:29.579Z",
    "availableUntil": "2025-07-22T06:04:29.579Z",
    "status": "LISTED",
    "location": {
      "lat": 25.6165905,
      "lng": 85.1425886
    },
    "organicCertified": false,
    "createdAt": "2025-04-22T06:06:21.800Z",
    "updatedAt": "2025-04-22T06:06:21.800Z"
  },
  {
    "id": "aa74aeea-f613-4f66-8a3c-717efb955d2f",
    "name": "Poatato",
    "description": "Red potatoes",
    "farmerId": "ffb246a1-b66c-4664-ba7f-a14f7d90aac6",
    "category": "VEGETABLES",
    "quantity": 100,
    "unit": "kg",
    "basePrice": 20,
    "finalPrice": 20,
    "images": [],
    "harvestDate": "2025-04-21T09:52:55.777Z",
    "availableUntil": "2025-05-21T09:52:55.777Z",
    "status": "LISTED",
    "location": {
      "lat": 25.5755,
      "lng": 85.0917
    },
    "organicCertified": true,
    "createdAt": "2025-04-21T09:54:17.275Z",
    "updatedAt": "2025-04-21T09:54:17.275Z"
  },
  {
    "id": "05b025fe-2818-4063-8c49-5550f2be6bdd",
    "name": "Apple",
    "description": "This Apple is best in athe World ",
    "farmerId": "ffb246a1-b66c-4664-ba7f-a14f7d90aac6",
    "category": "FRUITS",
    "quantity": 10,
    "unit": "ton",
    "basePrice": 15000,
    "finalPrice": 15000,
    "images": [],
    "harvestDate": "2025-04-20T08:44:22.981Z",
    "availableUntil": "2025-05-20T08:44:22.981Z",
    "status": "LISTED",
    "location": {
      "lat": 25.6210413,
      "lng": 85.1002741
    },
    "organicCertified": true,
    "createdAt": "2025-04-20T08:45:22.133Z",
    "updatedAt": "2025-04-20T08:45:22.133Z"
  }
];

// Mock farmer data
interface FarmerInfo {
  name: string;
  email: string;
}

const mockFarmers: Record<string, FarmerInfo> = {
  "a9a816e6-102b-4d39-8394-c14cee506ad4": {
    name: "Dinkar prasad",
    email: "farmer@example.com"
  },
  "ffb246a1-b66c-4664-ba7f-a14f7d90aac6": {
    name: "Sarah Farmer",
    email: "farmer2@example.com"
  }
};

export default function ConsumerShop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Using mock data instead of API call
      setProducts(mockProducts);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product: Product) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to make a purchase",
        variant: "destructive",
      });
      return;
    }

    try {
      const order: Omit<Order, "id"> = {
        productId: product.id,
        consumerId: user.id,
        quantity: 1, // Default quantity, can be made configurable
        price: product.finalPrice || product.basePrice,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mock order creation
      toast({
        title: "Success",
        description: "Order placed successfully",
      });
      // Refresh products to update availability
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while placing the order",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "ALL" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Shop Directly from Farmers</h1>
          <p className="text-gray-600">Browse and purchase fresh produce directly from local farmers</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="GRAINS">Grains</SelectItem>
              <SelectItem value="VEGETABLES">Vegetables</SelectItem>
              <SelectItem value="FRUITS">Fruits</SelectItem>
              <SelectItem value="DAIRY">Dairy</SelectItem>
              <SelectItem value="MEAT">Meat</SelectItem>
              <SelectItem value="POULTRY">Poultry</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center">No products found</div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold">₹{product.finalPrice || product.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span>{product.quantity} {product.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span>{product.category}</span>
                    </div>
                    {product.organicCertified && (
                      <div className="flex items-center gap-2 text-green-600">
                        <span>✓</span>
                        <span>Organic Certified</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Farmer:</span>
                      <span>{mockFarmers[product.farmerId]?.name || "Unknown"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handlePurchase(product)}
                  >
                    Purchase
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 