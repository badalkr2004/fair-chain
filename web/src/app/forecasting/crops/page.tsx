import CropsChart from "@/components/forecasting/CropsChart";

// Mock data for the chart
const cropsData = {
  status: "active",
  crops: [
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
  count: 10
};

export default function CropsPage() {
  return (
    <div className="min-h-screen bg-white">
      <CropsChart data={cropsData} isFullPage={true} />
    </div>
  );
} 