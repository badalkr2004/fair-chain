"use client";

import CropPriceChart from "@/components/forecasting/ForecastChart";
import RegionalChart from "@/components/forecasting/RegionalChart";
import CropsChart from "@/components/forecasting/CropsChart";
import { Container } from "lucide-react";

const ForecastingPage = () => {
  // Mock data for crop price visualization
  const cropPriceData = {
    "status": "success",
    "crop": "Wheat",
    "current_price": 2500,
    "price_trend": "increasing",
    "price_forecast": [
      {"date": "2024-03-01", "price": 2550},
      {"date": "2024-03-15", "price": 2600},
      {"date": "2024-04-01", "price": 2650},
      {"date": "2024-04-15", "price": 2700},
      {"date": "2024-05-01", "price": 2750}
    ],
    "last_updated": "2024-02-28"
  };

  // Mock data for regional visualization
  const regionalData = {
    "status": "active",
    "regions": [
      "North Region",
      "South Region",
      "East Region",
      "West Region",
      "Central Region",
      "Northeast Region",
      "Northwest Region",
      "Southeast Region",
      "Southwest Region"
    ],
    "count": 9
  };

  // Mock data for crops visualization
  const cropsData = {
    "status": "active",
    "crops": [
      "Wheat",
      "Rice",
      "Maize",
      "Barley",
      "Oats",
      "Rye",
      "Sorghum",
      "Millet",
      "Quinoa",
      "Buckwheat"
    ],
    "count": 10
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-3">Agricultural Analytics Dashboard</h1>
          <p className="text-green-600 max-w-2xl mx-auto">
            Track crop prices, regional distribution, and crop analysis with our interactive visualization tools.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <CropPriceChart data={cropPriceData} isFullPage={false} />
          <RegionalChart data={regionalData} isFullPage={false} />
          <CropsChart data={cropsData} isFullPage={false} />
        </div>
      </div>
    </main>
  );
};

export default ForecastingPage;
