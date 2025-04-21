import RegionalChart from "@/components/forecasting/RegionalChart";

// Mock data for the chart
const regionalData = {
  status: "active",
  regions: [
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
  count: 9
};

export default function RegionalPage() {
  return (
    <div className="min-h-screen bg-white">
      <RegionalChart data={regionalData} isFullPage={true} />
    </div>
  );
} 