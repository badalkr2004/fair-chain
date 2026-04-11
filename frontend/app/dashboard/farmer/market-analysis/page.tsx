'use client';

import { useState } from 'react';
import { useAvailableCrops, useAvailableRegions, useCropForecast, useMarketPrices, useOptimalCrops } from '@/hooks/use-market-analysis';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Lightbulb, MapPin, Sprout } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import clsx from 'clsx';

export default function MarketAnalysisPage() {
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [selectedRegion, setSelectedRegion] = useState('Buxar');

  const { data: cropsData } = useAvailableCrops();
  const { data: regionsData } = useAvailableRegions();

  const { data: priceData, isLoading: priceLoading } = useMarketPrices(selectedCrop);
  const { data: forecastData, isLoading: forecastLoading } = useCropForecast({ crop_name: selectedCrop, region: selectedRegion });
  const { data: optimalData, isLoading: optimalLoading } = useOptimalCrops(selectedRegion);

  const crops = cropsData?.crops || ['wheat', 'rice', 'maize', 'potato'];
  const regions = regionsData?.regions || ['Buxar', 'Patna', 'Gaya', 'Nalanda'];

  const isLoading = priceLoading || forecastLoading || optimalLoading;

  // Chart Formatting
  const formatYAxis = (tickItem: any) => {
    if (tickItem > 1000) return `₹${(tickItem / 1000).toFixed(1)}k`;
    return `₹${tickItem}`;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing' || trend === 'growing') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === 'decreasing' || trend === 'declining') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  const TrendColor = (trend: string) => {
    if (trend === 'increasing' || trend === 'growing') return 'text-green-600';
    if (trend === 'decreasing' || trend === 'declining') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Market Analysis</h1>
          <p className="text-gray-500 mt-1">Real-time stock-style intelligence for crop forecasting</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <Select
            options={crops.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-36 focus:ring-0 border-transparent shadow-none bg-gray-50"
          />
          <Select
            options={regions.map(r => ({ value: r, label: r }))}
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-36 focus:ring-0 border-transparent shadow-none bg-gray-50"
          />
        </div>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main Chart Column */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Price Ticker / Headline */}
            {priceData && (
              <div className="bg-[#111827] rounded-2xl p-6 shadow-xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-green-500/20 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-xs">Simulated Current Market Price</span>
                    <h2 className="text-4xl font-black mt-1 flex items-center gap-3">
                      {formatCurrency(priceData.current_price)}
                      <span className="text-sm font-medium bg-white/10 px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        {getTrendIcon(priceData.price_trend)}
                        <span className={clsx(priceData.price_trend === 'increasing' ? 'text-green-400' : priceData.price_trend === 'decreasing' ? 'text-red-400' : 'text-gray-300')}>
                          {priceData.price_trend.toUpperCase()}
                        </span>
                      </span>
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm">{selectedCrop.toUpperCase()} / Quintal</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Last Updated: {priceData.last_updated}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Price Forecast Area Chart */}
            {priceData && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 text-lg">5-Month Price Projection</h3>
                  <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                    <TrendingUp className="w-3 h-3 mr-1" /> Volatility Model
                  </span>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceData.price_forecast} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPriceSim" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={formatYAxis} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(val: any) => [formatCurrency(Number(val)), 'Projected Price']}
                        labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPriceSim)" name="Predicted" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Production Forecast Bar Chart */}
            {forecastData && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 text-lg">Production Volume Forecast ({selectedRegion})</h3>
                  <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                    Prophet + SARIMA AI
                  </span>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[...forecastData.historical_data.slice(-3), ...forecastData.forecast]} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="value" name="Historical Production" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="forecast" name="Predicted Production" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar / Recommendations */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50 border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">AI Recommendations</h3>
              </div>
              <p className="text-sm text-green-800/80 mb-6 flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4"/> Optimal crops for {selectedRegion}
              </p>

              {optimalData?.optimal_crops && optimalData.optimal_crops.length > 0 ? (
                <div className="space-y-4">
                  {optimalData.optimal_crops.map((opt, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-green-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900 capitalize flex items-center gap-1.5">
                            <Sprout className="w-4 h-4 text-green-600"/> {opt.crop}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">Est. Yield: {opt.current_yield.toFixed(1)} tons/ha</p>
                        </div>
                        <div className="text-right">
                          <span className={clsx('text-xs font-bold uppercase flex items-center justify-end gap-1', TrendColor(opt.yield_trend))}>
                            {getTrendIcon(opt.yield_trend)}
                            {opt.yield_trend}
                          </span>
                          <span className={clsx(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 inline-block',
                            opt.profit_potential === 'high' ? 'bg-green-100 text-green-700' :
                            opt.profit_potential === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          )}>
                            {opt.profit_potential} ROI
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-4 text-center bg-white/50 rounded-xl border border-dashed border-gray-200">
                  No recommendations available for this region currently.
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Stock Highlights</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Model Confidence</span>
                  <span className="font-bold text-gray-900">{forecastData?.forecast_confidence ? `${Math.round(forecastData.forecast_confidence * 100)}%` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Metric Analysed</span>
                  <span className="font-bold text-gray-900">Production (Tons)</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-600">Algorithm</span>
                  <span className="font-bold text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">Prophet + SARIMA</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
