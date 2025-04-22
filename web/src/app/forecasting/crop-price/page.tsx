import CropPriceChart from "@/components/forecasting/ForecastChart";

// Mock data for the chart
const cropPriceData = {
  crop: "Wheat",
  current_price: 2500,
  price_trend: "increasing",
  price_forecast: [
    { date: "2024-03-01", price: 2550 },
    { date: "2024-03-15", price: 2600 },
    { date: "2024-04-01", price: 2650 },
    { date: "2024-04-15", price: 2700 },
    { date: "2024-05-01", price: 2750 },
  ],
  last_updated: "2024-02-28",
};

export default function CropPricePage() {
  return (
    <div className="min-h-screen bg-white">
      <CropPriceChart data={cropPriceData} isFullPage={true} />
    </div>
  );
} 