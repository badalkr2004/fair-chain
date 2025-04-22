"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/api/types";
import { useAuthStore } from "@/lib/store";
import { Search, Filter, MapPin, DollarSign, Calendar, Crop, Map, Target } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom location icon
const locationIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="bg-blue-600 text-white p-2 rounded-full shadow-lg">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Dummy data for demonstration
const dummyProducts: Product[] = [
  {
    id: "1",
    name: "Organic Tomatoes",
    description: "Fresh organic tomatoes from local farm",
    farmerId: "farmer1",
    category: "VEGETABLES",
    quantity: 100,
    unit: "kg",
    basePrice: 2.5,
    finalPrice: 3.0,
    images: [],
    harvestDate: "2024-04-01",
    availableUntil: "2024-04-30",
    status: "LISTED",
    location: {
      lat: 25.6165905,
      lng: 85.1425886
    },
    organicCertified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Fresh Potatoes",
    description: "Premium quality potatoes",
    farmerId: "farmer2",
    category: "VEGETABLES",
    quantity: 200,
    unit: "kg",
    basePrice: 1.5,
    finalPrice: 2.0,
    images: [],
    harvestDate: "2024-04-05",
    availableUntil: "2024-05-05",
    status: "LISTED",
    location: {
      lat: 25.5755,
      lng: 85.0917
    },
    organicCertified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Wheat",
    description: "High quality wheat grains",
    farmerId: "farmer3",
    category: "GRAINS",
    quantity: 500,
    unit: "kg",
    basePrice: 2.0,
    finalPrice: 2.5,
    images: [],
    harvestDate: "2024-03-20",
    availableUntil: "2024-06-20",
    status: "LISTED",
    location: {
      lat: 25.6210413,
      lng: 85.1002741
    },
    organicCertified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface FilterState {
  searchQuery: string;
  category: string;
  priceRange: [number, number];
  distance: number;
  season: string;
}

// Map controller component
function MapController({ center, zoom, radius }: { center: [number, number]; zoom: number; radius: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

// Map click handler component
function MapClickHandler({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onClick
  });
  return null;
}

export default function MapInterface() {
  const [products] = useState<Product[]>(dummyProducts);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    category: "ALL",
    priceRange: [0, 100],
    distance: 50,
    season: "ALL"
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.6165905, 85.1425886]);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedArea, setSelectedArea] = useState<{
    center: [number, number];
    radius: number;
  } | null>(null);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesCategory = filters.category === "ALL" || product.category === filters.category;
    const matchesPrice = product.finalPrice !== undefined && 
      product.finalPrice >= filters.priceRange[0] && 
      product.finalPrice <= filters.priceRange[1];
    
    // Filter by distance if area is selected
    if (selectedArea) {
      const distance = L.latLng(product.location.lat, product.location.lng)
        .distanceTo(L.latLng(selectedArea.center[0], selectedArea.center[1]));
      const matchesDistance = distance <= selectedArea.radius * 1000; // Convert km to meters
      return matchesSearch && matchesCategory && matchesPrice && matchesDistance;
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleFindProducts = () => {
    if (filteredProducts.length === 0) {
      toast({
        title: "No Products Found",
        description: "No products match your current filters.",
        variant: "destructive",
      });
      return;
    }

    const bounds = filteredProducts.reduce((acc, product) => {
      return acc.extend([product.location.lat, product.location.lng]);
    }, L.latLngBounds([]));

    setMapCenter([
      (bounds.getNorth() + bounds.getSouth()) / 2,
      (bounds.getEast() + bounds.getWest()) / 2
    ]);
    setMapZoom(11);
  };

  const handleShowAreaProducts = () => {
    if (!selectedArea) {
      toast({
        title: "Select Area",
        description: "Please select an area on the map first.",
        variant: "destructive",
      });
      return;
    }

    handleFindProducts();
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    setSelectedArea({
      center: [e.latlng.lat, e.latlng.lng],
      radius: filters.distance
    });
  };

  const calculateProfitBreakdown = (product: Product) => {
    const basePrice = product.basePrice;
    const finalPrice = product.finalPrice ?? basePrice;
    const profit = finalPrice - basePrice;
    const profitPercentage = (profit / basePrice) * 100;

    return {
      basePrice,
      finalPrice,
      profit,
      profitPercentage
    };
  };

  return (
    <div className="flex h-screen">
      {/* Filters Sidebar */}
      <div className="w-80 p-4 border-r overflow-y-auto flex flex-col">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        
        <div className="space-y-4 flex-grow">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Price Range</label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => setFilters({ ...filters, priceRange: value as [number, number] })}
              min={0}
              max={100}
              step={1}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>₹{filters.priceRange[0]}</span>
              <span>₹{filters.priceRange[1]}</span>
            </div>
          </div>

          {/* Distance */}
          <div>
            <label className="text-sm font-medium mb-2 block">Distance (km)</label>
            <Slider
              value={[filters.distance]}
              onValueChange={(value) => setFilters({ ...filters, distance: value[0] })}
              min={0}
              max={100}
              step={5}
            />
            <div className="text-sm text-gray-500 text-right">
              {filters.distance} km
            </div>
          </div>

          {/* Season Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Season</label>
            <Select
              value={filters.season}
              onValueChange={(value) => setFilters({ ...filters, season: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Seasons</SelectItem>
                <SelectItem value="SUMMER">Summer</SelectItem>
                <SelectItem value="WINTER">Winter</SelectItem>
                <SelectItem value="MONSOON">Monsoon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-4">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleFindProducts}
          >
            <Map className="w-4 h-4 mr-2" />
            Find All Products
          </Button>
          
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleShowAreaProducts}
            disabled={!selectedArea}
          >
            <Target className="w-4 h-4 mr-2" />
            Show Products in Area
          </Button>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
        >
          <MapClickHandler onClick={handleMapClick} />
          <MapController center={mapCenter} zoom={mapZoom} radius={filters.distance} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Selected Area Circle */}
          {selectedArea && (
            <Circle
              center={selectedArea.center}
              radius={selectedArea.radius * 1000} // Convert km to meters
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
            />
          )}
          
          {filteredProducts.map((product) => (
            <Marker
              key={product.id}
              position={[product.location.lat, product.location.lng]}
              icon={locationIcon}
            >
              <Popup>
                <Card className="w-80">
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>{product.description}</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Price: ₹{product.finalPrice ?? product.basePrice}/{product.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Crop className="h-4 w-4" />
                        <span>Category: {product.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Available until: {product.availableUntil ? new Date(product.availableUntil).toLocaleDateString() : 'Not specified'}</span>
                      </div>
                      
                      {/* Profit Breakdown */}
                      <div className="mt-4 p-2 bg-gray-50 rounded">
                        <h4 className="font-medium mb-2">Profit Breakdown</h4>
                        {(() => {
                          const breakdown = calculateProfitBreakdown(product);
                          return (
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Base Price:</span>
                                <span>₹{breakdown.basePrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Final Price:</span>
                                <span>₹{breakdown.finalPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Profit:</span>
                                <span>₹{breakdown.profit.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Profit %:</span>
                                <span>{breakdown.profitPercentage.toFixed(2)}%</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
} 