import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForecastData } from '@/types/market';

interface RecommendedPriceProps {
  forecastData: ForecastData | null;
}

const RecommendedPrice: React.FC<RecommendedPriceProps> = ({ forecastData }) => {
  if (!forecastData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No forecast data available</p>
        </CardContent>
      </Card>
    );
  }

  const { current_price, price_forecast, last_updated } = forecastData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Current Price</h3>
            <p className="text-2xl font-bold">₹{current_price}/quintal</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Price Forecast</h3>
            <div className="space-y-2">
              {price_forecast.map((forecast, index) => (
                <div key={index} className="flex justify-between">
                  <span>{forecast.date}</span>
                  <span>₹{forecast.price}/quintal</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(last_updated).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedPrice;
