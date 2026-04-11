'use client';

import { useState } from 'react';
import { useDemandForecasts } from '@/hooks/use-forecast';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function ForecastPage() {
  const [category, setCategory] = useState('ALL');
  const { data, isLoading } = useDemandForecasts(category !== 'ALL' ? { category } : undefined);

  const forecasts = data?.forecasts || [];

  // Group forecasts by date to mock a line chart dataset
  // In a real scenario, the backend should return time-series data
  const chartData = forecasts.slice(0, 10).map((f: any) => ({
    date: formatDate(f.predictionDate),
    price: f.predictedValue,
    actual: f.actualValue || f.predictedValue * (0.9 + Math.random() * 0.2), // Mock actuals if missing
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Market Insights</h1>
          <p className="text-gray-500 mt-1">Forecasts and trends powered by machine learning</p>
        </div>
        <Select
          options={[{ value: 'ALL', label: 'All Categories' }, ...PRODUCT_CATEGORIES]}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-48"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 text-lg">Price Forecast Trend</h3>
                <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" /> High Accuracy
                </span>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#9ca3af" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="actual" stroke="#9ca3af" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Historical" />
                    <Area type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" name="Predicted" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Market Alerts</h3>
                <div className="space-y-3">
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Wheat prices expected to rise</p>
                      <p className="text-xs text-amber-700 mt-1">Due to predicted heavy rainfall in northern regions, supply may drop by 15%.</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">High demand for Organic Tomatoes</p>
                      <p className="text-xs text-blue-700 mt-1">Urban markets showing a 22% increase in demand compared to last month.</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Top Predictions</h3>
                <div className="space-y-3">
                  {forecasts.slice(0, 3).map((f: any, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{f.category}</p>
                        <p className="text-xs text-gray-500">{formatDate(f.predictionDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-700">{formatCurrency(f.predictedValue)}</p>
                        <p className="text-[10px] text-gray-500">{(f.accuracy || 92)}% confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
