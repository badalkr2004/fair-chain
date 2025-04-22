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
        
        setAvailableCrops(Array.isArray(crops) ? crops : ['Wheat', 'Rice', 'Maize']);
        setAvailableRegions(Array.isArray(regions) ? regions : ['Saran', 'Patna', 'Buxar']);
        
        // Set default selections
        if (crops && crops.length > 0) {
          setSelectedCrop(crops[0]);
        }
        
        if (regions && regions.length > 0) {
          setSelectedRegion(regions[0]);
        }
        
        // Load initial forecast data
        await loadForecastData('Wheat');
        await loadOptimalCrops('Saran');
        await loadCropCalendar('Wheat');
        await loadRegionalDemand('Saran');
        
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

  // Handle region selection change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    if (activeTab === 'optimal') {
      loadOptimalCrops(region);
    } else if (activeTab === 'demand') {
      loadRegionalDemand(region);
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
    if (!optimalCrops) return null;

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
          {optimalCrops.optimal_crops.map((crop, index) => (
            <View 
              key={crop.crop_name} 
              className={`py-3 ${index < optimalCrops.optimal_crops.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className={`w-8 h-8 rounded-full bg-blue-${Math.floor(crop.score * 900)} justify-center items-center mr-3`}>
                    <Text className="text-white font-bold">{index + 1}</Text>
                  </View>
                  <Text className="text-base font-semibold">{crop.crop_name}</Text>
                </View>
                <View className="bg-blue-50 px-2 py-1 rounded">
                  <Text className="text-blue-800 font-medium">
                    Score: {(crop.score * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
              
              <View className="flex-row mt-2">
                <View className="flex-1 mr-2">
                  <Text className="text-xs text-gray-500">Expected Yield</Text>
                  <Text className="text-sm font-medium">{crop.expected_yield ? crop.expected_yield.toFixed(2) : '0.00'} t/ha</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Expected Price</Text>
                  <Text className="text-sm font-medium">₹{crop.expected_price ? crop.expected_price.toLocaleString() : '0'}/ton</Text>
                </View>
              </View>
            </View>
          ))}
          
          <View className="mt-4 p-3 bg-blue-50 rounded-lg">
            <Text className="text-sm text-blue-800">
              <Ionicons name="information-circle" size={16} /> These recommendations are based on soil conditions, climate, and market trends in your region. The score indicates the suitability of the crop.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render crop calendar tab
  const renderCropCalendarTab = () => {
    if (!cropCalendar) return null;

    return (
      <View className="mt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">
            Crop Calendar for {selectedCrop}
          </Text>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-semibold text-gray-800">Growing Season</Text>
          </View>

          <View className="flex-row mb-4">
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-1">Sowing Period</Text>
              <Text className="text-base font-medium">
                {cropCalendar.calendar.sowing_month}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-1">Harvesting Period</Text>
              <Text className="text-base font-medium">
                {cropCalendar.calendar.harvesting_month}
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">Growing Duration</Text>
            <Text className="text-base font-medium">
              {cropCalendar.calendar.growth_duration_days} days
            </Text>
          </View>
        </View>

        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm text-blue-800">
            <Ionicons name="information-circle" size={16} /> Plan your farming activities according to the optimal growing conditions for best yields.
          </Text>
        </View>
      </View>
    );
  };

  // Render regional demand tab
  const renderRegionalDemandTab = () => {
    if (!regionalDemand || !Array.isArray(regionalDemand) || regionalDemand.length === 0) return null;

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
                      name={isIncreasing ? 'trending-up' : 'trending-down'} 
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
                  {item.forecast_years.map((year, i) => (
                    <View key={year} className="w-1/2 py-1">
                      <Text className="text-sm">
                        {year}: <Text className="font-medium">{Math.round(item.forecast_values[i]).toLocaleString()}</Text>
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          );
        })}
        
        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm text-blue-800">
            <Ionicons name="information-circle" size={16} /> Regional demand forecasts help you plan which crops to grow based on expected market demand in your region.
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
            onPress={() => {
              setActiveTab('optimal');
              loadOptimalCrops(selectedRegion);
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
            onPress={() => {
              setActiveTab('demand');
              loadRegionalDemand(selectedRegion);
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
