"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MandiPrice } from "@/types/market";

interface MandiPricesProps {
  prices: MandiPrice[];
}

export function MandiPrices({ prices }: MandiPricesProps) {
  if (!prices || prices.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">No mandi prices available at the moment.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nearby Mandi Prices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prices.map((price, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-gray-200 bg-white"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{price.mandi}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Distance: {price.distance} km
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-emerald-600">
                    ₹{price.price}
                  </p>
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(price.last_updated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 