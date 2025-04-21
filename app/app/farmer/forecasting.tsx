import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import forecastingService, { 
  CropForecastResponse, 
  OptimalCropResponse,
  CropCalendarResponse
} from '../../services/forecasting';

export default function FarmerForecasting() {
  // State variables
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forecast' | 'optimal' | 'calendar' | 'demand'>('forecast');
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [selectedRegion, setSelectedRegion] = useState<string>('Saran');
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [cropForecast, setCropForecast] = useState<CropForecastResponse | null>(null);
  const [optimalCrops, setOptimalCrops] = useState<OptimalCropResponse | null>(null);
  const [cropCalendar, setCropCalendar] = useState<CropCalendarResponse | null>(null);
  const [regionalDemand, setRegionalDemand] = useState<any>(null);
  const [metric, setMetric] = useState<'Production' | 'Area' | 'Yield'>('Production');

  const screenWidth = Dimensions.get('window').width - 40;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch available crops and regions
        const crops = await forecastingService.getAllCrops();
        const regions = await forecastingService.getAllRegions();
        
        console.log('Initial regions loaded:', regions);
        
        // Ensure we have valid arrays
        const validCrops = Array.isArray(crops) && crops.length > 0 ? crops : ['Wheat', 'Rice', 'Maize'];
        const validRegions = Array.isArray(regions) && regions.length > 0 ? regions : ['Saran', 'Patna', 'Buxar'];
        
        setAvailableCrops(validCrops);
        setAvailableRegions(validRegions);
        
        // Set default selections
        const defaultCrop = validCrops[0];
        const defaultRegion = validRegions[0];
        
        setSelectedCrop(defaultCrop);
        setSelectedRegion(defaultRegion);
        
        // Load initial forecast data
        await loadForecastData(defaultCrop);
        await loadOptimalCrops(defaultRegion);
        await loadCropCalendar(defaultCrop);
        await loadRegionalDemand(defaultRegion);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Load forecast data for a specific crop
  const loadForecastData = async (crop: string) => {
    try {
      setLoading(true);
      const data = await forecastingService.getCropForecast({
        crop_name: crop,
        metric,
        top_n: 5,
        periods: 5
      });
      setCropForecast(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading forecast data:', error);
      setLoading(false);
    }
  };

  // Load optimal crops for a region
  const loadOptimalCrops = async (region: string) => {
    try {
      setLoading(true);
      const data = await forecastingService.getOptimalCrops({
        region,
        top_n: 5
      });
      setOptimalCrops(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading optimal crops:', error);
      setLoading(false);
    }
  };

  // Load crop calendar
  const loadCropCalendar = async (crop: string) => {
    try {
      setLoading(true);
      const data = await forecastingService.getCropCalendar({
        crop_name: crop
      });
      setCropCalendar(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading crop calendar:', error);
      setLoading(false);
    }
  };

  // Load regional demand data
  const loadRegionalDemand = async (region: string) => {
    try {
      setLoading(true);
      const data = await forecastingService.getRegionalDemand({
        region,
        top_n: 5,
        periods: 5
      });
      setRegionalDemand(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading regional demand:', error);
      setLoading(false);
    }
  };

  // Handle crop selection change
  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop);
    if (activeTab === 'forecast') {
      loadForecastData(crop);
    } else if (activeTab === 'calendar') {
      loadCropCalendar(crop);
    }
  };

  // Handle region change
  const handleRegionChange = async (region: string) => {
    setSelectedRegion(region);
    if (activeTab === 'optimal') {
      loadOptimalCrops(region);
    } else if (activeTab === 'demand') {
      loadRegionalDemand(region);
    }
  };

  // Function to refresh regions
  const refreshRegions = async () => {
    try {
      const regions = await forecastingService.getAllRegions();
      if (Array.isArray(regions) && regions.length > 0) {
        console.log('Fetched regions:', regions);
        setAvailableRegions(regions);
        
        // If the current region isn't in the new list, use the first one
        if (!regions.includes(selectedRegion)) {
          setSelectedRegion(regions[0]);
          return regions[0];
        }
      }
      return selectedRegion;
    } catch (error) {
      console.error('Error refreshing regions:', error);
      return selectedRegion;
    }
  };

  // Handle metric change
  const handleMetricChange = (newMetric: 'Production' | 'Area' | 'Yield') => {
    setMetric(newMetric);
    loadForecastData(selectedCrop);
  };

  // Prepare chart data for forecast
  const getForecastChartData = () => {
    if (!cropForecast) return null;

    const historicalData = cropForecast.historical_data.slice(-5); // Last 5 years
    const forecastData = cropForecast.forecast;

    return {
      labels: [
        ...historicalData.map(d => d.year.toString().substr(2)),
        ...forecastData.map(d => d.year.toString().substr(2))
      ],
      datasets: [
        {
          data: [
            ...historicalData.map(d => 
              metric === 'Production' ? d.production :
              metric === 'Area' ? d.area : d.yield
            ),
            ...forecastData.map(d => d.production)
          ],
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: [`${metric} (${metric === 'Production' ? 'Tons' : metric === 'Area' ? 'Hectares' : 'Tons/Hectare'})`]
    };
  };

  // Render forecast tab
  const renderForecastTab = () => {
    if (!cropForecast) return null;

    const chartData = getForecastChartData();
    if (!chartData) return null;

    return (
      <View className="mt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">
            {cropForecast.crop} {metric} Forecast
          </Text>
          <Text className="text-xs text-gray-500">
            Last updated: {cropForecast.last_updated}
          </Text>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-sm text-gray-600 mb-2">Select Metric:</Text>
          <View className="flex-row mb-4">
            {(['Production', 'Area', 'Yield'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                className={`mr-2 px-4 py-2 rounded-full ${metric === m ? 'bg-blue-500' : 'bg-gray-200'}`}
                onPress={() => handleMetricChange(m)}
              >
                <Text className={`${metric === m ? 'text-white' : 'text-gray-700'}`}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#3b82f6'
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
          
          <View className="flex-row justify-between mt-2">
            <Text className="text-xs text-gray-500">Historical</Text>
            <Text className="text-xs text-gray-500">Forecast</Text>
          </View>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-2">
            Forecast Details
          </Text>
          
          <View className="border-b border-gray-200 pb-2 mb-2">
            <Text className="text-sm text-gray-600 mb-1">Historical Data (Last 3 Years)</Text>
            {cropForecast.historical_data.slice(-3).map((item) => (
              <View key={item.year} className="flex-row justify-between py-1">
                <Text className="text-sm">{item.year}</Text>
                <Text className="text-sm font-medium">
                  {metric === 'Production' ? (item.production ? item.production.toLocaleString() : '0') :
                   metric === 'Area' ? (item.area ? item.area.toLocaleString() : '0') :
                   (item.yield ? item.yield.toFixed(2) : '0.00')}
                  {metric === 'Production' ? ' tons' :
                   metric === 'Area' ? ' ha' : ' t/ha'}
                </Text>
              </View>
            ))}
          </View>
          
          <View>
            <Text className="text-sm text-gray-600 mb-1">Forecast (Next 5 Years)</Text>
            {cropForecast.forecast.map((item) => (
              <View key={item.year} className="flex-row justify-between py-1">
                <Text className="text-sm">{item.year}</Text>
                <Text className="text-sm font-medium">
                  {item.production ? item.production.toLocaleString() : '0'} tons
                </Text>
              </View>
            ))}
          </View>
          
          <View className="mt-4 p-3 bg-blue-50 rounded-lg">
            <Text className="text-sm text-blue-800">
              <Ionicons name="information-circle" size={16} /> This forecast is based on historical data and predictive modeling. Actual results may vary due to weather conditions and other factors.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render optimal crops tab
  const renderOptimalCropsTab = () => {
    if (!optimalCrops || !optimalCrops.optimal_crops || optimalCrops.optimal_crops.length === 0) {
      // Show empty state if no optimal crops data is available
      return (
        <View className="mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">
              Optimal Crops for {selectedRegion}
            </Text>
          </View>
          
          <View className="bg-white rounded-lg p-4 shadow-sm items-center justify-center py-8">
            <Ionicons name="leaf-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-center">
              No optimal crop recommendations available for this region.
            </Text>
          </View>
        </View>
      );
    }

    // Get color based on yield trend
    const getTrendColor = (trend: string) => {
      switch (trend) {
        case 'increasing': return 'bg-green-500';
        case 'stable': return 'bg-blue-500';
        case 'decreasing': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    };

    // Get text color based on yield trend
    const getTrendTextColor = (trend: string) => {
      switch (trend) {
        case 'increasing': return 'text-green-800';
        case 'stable': return 'text-blue-800';
        case 'decreasing': return 'text-red-800';
        default: return 'text-gray-800';
      }
    };

    // Get icon based on yield trend
    const getTrendIcon = (trend: string) => {
      switch (trend) {
        case 'increasing': return 'arrow-up-outline';
        case 'stable': return 'remove-outline';
        case 'decreasing': return 'arrow-down-outline';
        default: return 'help-circle-outline';
      }
    };

    // Get color based on confidence score
    const getConfidenceColor = (score: number) => {
      if (score >= 80) return 'bg-green-500';
      if (score >= 70) return 'bg-blue-500';
      if (score >= 60) return 'bg-yellow-500';
      return 'bg-orange-500';
    };

    // Get text color based on profit potential
    const getProfitTextColor = (potential: string) => {
      switch (potential) {
        case 'high': return 'text-green-800';
        case 'medium': return 'text-blue-800';
        case 'low': return 'text-orange-800';
        default: return 'text-gray-800';
      }
    };

    // Get background color based on profit potential
    const getProfitBgColor = (potential: string) => {
      switch (potential) {
        case 'high': return 'bg-green-100';
        case 'medium': return 'bg-blue-100';
        case 'low': return 'bg-orange-100';
        default: return 'bg-gray-100';
      }
    };

    return (
      <View className="mt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">
            Optimal Crops for {optimalCrops.region}
          </Text>
          <Text className="text-xs text-gray-500">
            Last updated: {optimalCrops.last_updated}
          </Text>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm">
          {optimalCrops.optimal_crops.map((crop, index) => {
            const trendColor = getTrendColor(crop.yield_trend);
            const trendTextColor = getTrendTextColor(crop.yield_trend);
            const trendIcon = getTrendIcon(crop.yield_trend);
            const confidenceColor = getConfidenceColor(crop.confidence_score);
            const profitTextColor = getProfitTextColor(crop.profit_potential);
            const profitBgColor = getProfitBgColor(crop.profit_potential);
            
            return (
              <View 
                key={crop.crop} 
                className={`py-3 ${index < optimalCrops.optimal_crops.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className={`w-8 h-8 rounded-full ${confidenceColor} justify-center items-center mr-3`}>
                      <Text className="text-white font-bold">{index + 1}</Text>
                    </View>
                    <Text className="text-base font-semibold">{crop.crop}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded ${profitBgColor}`}>
                    <Text className={profitTextColor}>
                      Profit: {crop.profit_potential.charAt(0).toUpperCase() + crop.profit_potential.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row mt-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-xs text-gray-500">Current Yield</Text>
                    <Text className="text-sm font-medium">
                      {crop.current_yield.toFixed(2)} t/ha
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500">Forecasted Yield</Text>
                    <Text className="text-sm font-medium">
                      {crop.forecasted_yield.toFixed(2)} t/ha
                    </Text>
                  </View>
                </View>

                <View className="flex-row mt-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-xs text-gray-500">Yield Trend</Text>
                    <View className="flex-row items-center">
                      <Ionicons name={trendIcon} size={14} color={trendTextColor.replace('text-', '').replace('-800', '')} />
                      <Text className={`text-sm font-medium ml-1 ${trendTextColor}`}>
                        {crop.yield_trend.charAt(0).toUpperCase() + crop.yield_trend.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500">Confidence</Text>
                    <Text className="text-sm font-medium">
                      {Math.round(crop.confidence_score)}%
                    </Text>
                  </View>
                </View>

                <View className="mt-2">
                  <Text className="text-xs text-gray-500">Growth Potential</Text>
                  <View className="flex-row items-center">
                    <View className="flex-1 h-2 bg-gray-200 rounded-full mt-1">
                      <View 
                        className={`h-2 ${crop.growth_potential > 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full`} 
                        style={{ width: `${Math.min(Math.abs(crop.growth_potential), 100)}%` }} 
                      />
                    </View>
                    <Text className="text-sm ml-2 font-medium">
                      {crop.growth_potential > 0 ? '+' : ''}{crop.growth_potential.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
          
          <View className="mt-4 p-3 bg-blue-50 rounded-lg">
            <Text className="text-sm text-blue-800">
              <Ionicons name="information-circle" size={16} /> 
              {optimalCrops.explanation || 'These recommendations are based on AI forecasting models that analyzed historical yield data and projected future performance.'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render crop calendar tab
  const renderCropCalendarTab = () => {
    // Check if crop calendar data exists and has entries for the selected crop
    const hasCalendarData = cropCalendar && 
                          cropCalendar.crop_calendars && 
                          cropCalendar.crop_calendars[selectedCrop] && 
                          cropCalendar.crop_calendars[selectedCrop].length > 0;

    if (!hasCalendarData) {
      return (
        <View className="mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">
              Crop Calendar for {selectedCrop}
            </Text>
          </View>
          
          <View className="bg-white rounded-lg p-4 shadow-sm items-center justify-center py-8">
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-center">
              Calendar information is not available for this crop.
            </Text>
          </View>
        </View>
      );
    }

    // Get the calendar entries for the selected crop
    const calendarEntries = cropCalendar.crop_calendars[selectedCrop];

    return (
      <View className="mt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">
            Crop Calendar for {selectedCrop}
          </Text>
          <Text className="text-xs text-gray-500">
            Last updated: {cropCalendar.last_updated}
          </Text>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm">
          {calendarEntries.map((entry, index) => (
            <View key={index} className={index > 0 ? 'mt-6' : ''}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-base font-semibold text-gray-800">
                  {entry.season} Season
                </Text>
              </View>

              <View className="flex-row mb-4">
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 mb-1">Planting Time</Text>
                  <Text className="text-base font-medium">
                    {entry.planting_time || 'Not available'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 mb-1">Harvesting Time</Text>
                  <Text className="text-base font-medium">
                    {entry.harvesting_time || 'Not available'}
                  </Text>
                </View>
              </View>

              {/* Calculate approximate growing duration */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Approximate Growing Duration</Text>
                <Text className="text-base font-medium">
                  {getApproximateGrowingDuration(entry.planting_time, entry.harvesting_time)}
                </Text>
              </View>
            </View>
          ))}

          <View className="p-3 bg-blue-50 rounded-lg mt-4">
            <Text className="text-sm text-blue-800">
              <Ionicons name="information-circle" size={16} /> These dates are approximate and may vary based on local climate conditions and specific crop varieties.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Helper function to calculate approximate growing duration from planting and harvesting times
  const getApproximateGrowingDuration = (plantingTime: string, harvestingTime: string): string => {
    if (!plantingTime || !harvestingTime) return 'Not available';
    
    // Simple estimation based on month ranges
    // This is a rough approximation - in a real app, you'd use more precise calculations
    const monthMap: {[key: string]: number} = {
      'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
      'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
    };
    
    try {
      // Extract start and end months from the time ranges
      const plantingMonths = plantingTime.split('-');
      const harvestingMonths = harvestingTime.split('-');
      
      if (plantingMonths.length < 1 || harvestingMonths.length < 1) return '3-4 months (estimated)';
      
      // Get the first month of planting and last month of harvesting
      const startMonth = monthMap[plantingMonths[0]] || 0;
      const endMonth = monthMap[harvestingMonths[harvestingMonths.length - 1]] || 0;
      
      if (startMonth === 0 || endMonth === 0) return '3-4 months (estimated)';
      
      // Calculate months difference, handling year wrap-around
      let monthsDiff = endMonth - startMonth;
      if (monthsDiff < 0) monthsDiff += 12; // Wrap around for crops that span across years
      
      return `${monthsDiff} months (estimated)`;
    } catch (error) {
      return '3-4 months (estimated)';
    }
  };

  // Render regional demand tab
  const renderRegionalDemandTab = () => {
    if (!regionalDemand || !Array.isArray(regionalDemand) || regionalDemand.length === 0) {
      return (
        <View className="mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">
              Crop Demand Forecast for {selectedRegion}
            </Text>
          </View>
          
          <View className="bg-white rounded-lg p-4 shadow-sm items-center justify-center py-8">
            <Ionicons name="analytics-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-center">
              No demand forecast data is available for this region.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="mt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">
            Crop Demand Forecast for {selectedRegion}
          </Text>
        </View>

        {regionalDemand.map((item, index) => {
          // Prepare chart data for this crop
          const chartData = {
            labels: item.forecast_years.map(year => year.toString().substr(2)),
            datasets: [{
              data: item.forecast_values,
              color: (opacity = 1) => `rgba(${index % 2 === 0 ? '59, 130, 246' : '249, 115, 22'}, ${opacity})`,
              strokeWidth: 2
            }],
            legend: [item.crop]
          };

          const isIncreasing = item.forecast_values[0] < item.forecast_values[item.forecast_values.length - 1];

          return (
            <View key={item.crop} className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-semibold text-gray-800">{item.crop}</Text>
                <View className={`px-2 py-1 rounded ${isIncreasing ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Text className={isIncreasing ? 'text-green-800' : 'text-red-800'}>
                    <Ionicons 
                      name={isIncreasing ? 'arrow-up-outline' : 'arrow-down-outline'} 
                      size={14} 
                    /> {isIncreasing ? 'Increasing' : 'Decreasing'}
                  </Text>
                </View>
              </View>

              <LineChart
                data={chartData}
                width={screenWidth - 40}
                height={180}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(${index % 2 === 0 ? '59, 130, 246' : '249, 115, 22'}, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: index % 2 === 0 ? '#3b82f6' : '#f97316'
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              
              <View className="mt-2">
                <Text className="text-sm text-gray-600 mb-1">Forecast Demand (Tons)</Text>
                <View className="flex-row flex-wrap">
                  {item.forecast_years.map((year: number, i: number) => {
                    // Format the value based on its magnitude
                    const value = item.forecast_values[i];
                    let formattedValue = '';
                    
                    if (value >= 1000) {
                      formattedValue = `${(value / 1000).toFixed(1)}K`;
                    } else if (value < 10) {
                      formattedValue = value.toFixed(2);
                    } else {
                      formattedValue = Math.round(value).toLocaleString();
                    }
                    
                    return (
                      <View key={year} className="w-1/2 py-1">
                        <Text className="text-sm">
                          {year}: <Text className="font-medium">{formattedValue}</Text>
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        })}
        
        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm text-blue-800">
            <Ionicons name="information-circle" size={16} /> Regional demand forecasts help you plan which crops to grow based on expected market demand in your region. Data is shown in tons per year.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-500 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="p-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white ml-2">
            AI Crop Forecasting
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Selector Section */}
        <View className="bg-white rounded-lg mt-4 p-4 shadow-sm">
          {activeTab === 'forecast' || activeTab === 'calendar' ? (
            <View>
              <Text className="text-sm text-gray-600 mb-1">Select Crop</Text>
              <View className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={selectedCrop}
                  onValueChange={(itemValue) => handleCropChange(itemValue)}
                  style={{ height: 50 }}
                >
                  {availableCrops.map((crop) => (
                    <Picker.Item key={crop} label={crop} value={crop} />
                  ))}
                </Picker>
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-sm text-gray-600 mb-1">Select Region</Text>
              <View className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={selectedRegion}
                  onValueChange={(itemValue) => handleRegionChange(itemValue)}
                  style={{ height: 50 }}
                >
                  {availableRegions.map((region) => (
                    <Picker.Item key={region} label={region} value={region} />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        </View>
        
        {/* Tab Selector */}
        <View className="flex-row bg-white rounded-lg mt-4 p-1 shadow-sm">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === 'forecast' ? 'bg-blue-500' : 'bg-transparent'}`}
            onPress={() => {
              setActiveTab('forecast');
              loadForecastData(selectedCrop);
            }}
          >
            <Text className={`text-center font-medium ${activeTab === 'forecast' ? 'text-white' : 'text-gray-600'}`}>
              Forecast
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === 'optimal' ? 'bg-blue-500' : 'bg-transparent'}`}
            onPress={async () => {
              setActiveTab('optimal');
              // Use the common function to refresh regions
              const regionToUse = await refreshRegions();
              loadOptimalCrops(regionToUse);
            }}
          >
            <Text className={`text-center font-medium ${activeTab === 'optimal' ? 'text-white' : 'text-gray-600'}`}>
              Optimal Crops
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === 'calendar' ? 'bg-blue-500' : 'bg-transparent'}`}
            onPress={() => {
              setActiveTab('calendar');
              loadCropCalendar(selectedCrop);
            }}
          >
            <Text className={`text-center font-medium ${activeTab === 'calendar' ? 'text-white' : 'text-gray-600'}`}>
              Calendar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === 'demand' ? 'bg-blue-500' : 'bg-transparent'}`}
            onPress={async () => {
              setActiveTab('demand');
              // Use the common function to refresh regions
              const regionToUse = await refreshRegions();
              loadRegionalDemand(regionToUse);
            }}
          >
            <Text className={`text-center font-medium ${activeTab === 'demand' ? 'text-white' : 'text-gray-600'}`}>
              Demand
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading ? (
          <View className="py-20 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-4 text-gray-600">Loading data...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'forecast' && renderForecastTab()}
            {activeTab === 'optimal' && renderOptimalCropsTab()}
            {activeTab === 'calendar' && renderCropCalendarTab()}
            {activeTab === 'demand' && renderRegionalDemandTab()}
          </>
        )}
        
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
