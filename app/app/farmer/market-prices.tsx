import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import forecastingService from '../../services/forecasting';

const screenWidth = Dimensions.get('window').width;

export default function MarketPrices() {
  const [loading, setLoading] = useState(true);
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [marketData, setMarketData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [historicalView, setHistoricalView] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch available crops
        const crops = await forecastingService.getAllCrops();
        const validCrops = Array.isArray(crops) && crops.length > 0 ? crops : ['Wheat', 'Rice', 'Maize'];
        
        setAvailableCrops(validCrops);
        
        // Set default selection and load data
        const defaultCrop = validCrops[0];
        setSelectedCrop(defaultCrop);
        await loadMarketPrices(defaultCrop);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Load market prices for a crop
  const loadMarketPrices = async (crop: string) => {
    try {
      setLoading(true);
      const data = await forecastingService.getMarketPrices(crop);
      setMarketData(data);
      prepareChartData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading market prices:', error);
      setLoading(false);
    }
  };

  // Handle crop change
  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop);
    loadMarketPrices(crop);
  };

  // Prepare chart data
  const prepareChartData = (data: any) => {
    if (!data || !data.price_forecast) return;

    // Get forecast data
    const forecast = data.price_forecast;
    
    // Format dates for display
    const labels = forecast.map((item: any) => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    
    // Add current price at the beginning
    labels.unshift('Now');
    
    // Create dataset
    const prices = forecast.map((item: any) => item.price);
    prices.unshift(data.current_price);
    
    // Set chart data
    setChartData({
      labels,
      datasets: [
        {
          data: prices,
          color: (opacity = 1) => data.price_trend === 'increasing' 
            ? `rgba(46, 204, 113, ${opacity})` 
            : data.price_trend === 'decreasing' 
              ? `rgba(231, 76, 60, ${opacity})`
              : `rgba(52, 152, 219, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: [`${data.crop} Price Trend`]
    });
  };

  // Get trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'arrow-up-outline';
      case 'decreasing': return 'arrow-down-outline';
      default: return 'remove-outline';
    }
  };

  // Format price with commas and decimals
  const formatPrice = (price: number) => {
    return '₹' + price.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      <View className="bg-blue-500 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="p-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white ml-2">
            Crop Market Prices
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Crop Selector */}
        <View className="bg-white rounded-lg mt-4 p-4 shadow-sm">
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

        {/* Loading Indicator */}
        {loading ? (
          <View className="py-20 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-4 text-gray-600">Loading data...</Text>
          </View>
        ) : (
          <>
            {marketData && (
              <>
                {/* Current Price Card */}
                <View className="bg-white rounded-lg mt-4 p-4 shadow-sm">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-bold text-gray-800">
                      Current Market Price
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Last updated: {marketData.last_updated}
                    </Text>
                  </View>
                  
                  <View className="mt-4 flex-row justify-between items-center">
                    <View>
                      <Text className="text-3xl font-bold">
                        {formatPrice(marketData.current_price)}
                      </Text>
                      <Text className="text-sm text-gray-600 mt-1">
                        per quintal
                      </Text>
                    </View>
                    <View className="bg-gray-100 px-4 py-2 rounded-full">
                      <Text className={`font-semibold flex-row items-center ${getTrendColor(marketData.price_trend)}`}>
                        <Ionicons name={getTrendIcon(marketData.price_trend)} size={16} /> 
                        {' '}
                        {marketData.price_trend.charAt(0).toUpperCase() + marketData.price_trend.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Price Chart */}
                <View className="bg-white rounded-lg mt-4 p-4 shadow-sm">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-gray-800">
                      Price Forecast
                    </Text>
                    <TouchableOpacity 
                      className="bg-blue-100 px-3 py-1 rounded-full"
                      onPress={() => setHistoricalView(!historicalView)}
                    >
                      <Text className="text-blue-600 text-xs font-medium">
                        {historicalView ? 'Show Forecast' : 'Show Historical'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {chartData && (
                    <View className="mt-2">
                      <LineChart
                        data={chartData}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={{
                          backgroundColor: '#ffffff',
                          backgroundGradientFrom: '#ffffff',
                          backgroundGradientTo: '#ffffff',
                          decimalPlaces: 0,
                          color: (opacity = 1) => marketData.price_trend === 'increasing' 
                            ? `rgba(46, 204, 113, ${opacity})` 
                            : marketData.price_trend === 'decreasing' 
                              ? `rgba(231, 76, 60, ${opacity})`
                              : `rgba(52, 152, 219, ${opacity})`,
                          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                          style: {
                            borderRadius: 16
                          },
                          propsForDots: {
                            r: '4',
                            strokeWidth: '2',
                            stroke: marketData.price_trend === 'increasing' 
                              ? '#27ae60' 
                              : marketData.price_trend === 'decreasing' 
                                ? '#c0392b'
                                : '#2980b9'
                          },
                          propsForBackgroundLines: {
                            strokeDasharray: ''
                          }
                        }}
                        bezier
                        style={{
                          marginVertical: 8,
                          borderRadius: 16
                        }}
                        withInnerLines={true}
                        withOuterLines={true}
                        withVerticalLines={false}
                        withHorizontalLabels={true}
                        withVerticalLabels={true}
                        withShadow={false}
                        yAxisLabel="₹"
                        yAxisSuffix=""
                      />
                    </View>
                  )}

                  <View className="mt-4">
                    <Text className="text-base font-semibold text-gray-800 mb-2">
                      Price Forecast Details
                    </Text>
                    <View className="bg-gray-50 rounded-lg p-3">
                      <View className="flex-row flex-wrap">
                        {marketData.price_forecast.map((item: any, index: number) => (
                          <View key={index} className="w-1/2 py-2">
                            <Text className="text-sm text-gray-600">
                              {new Date(item.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}:
                            </Text>
                            <Text className="text-base font-medium">
                              {formatPrice(item.price)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>

                {/* Market Insights */}
                <View className="bg-white rounded-lg mt-4 mb-6 p-4 shadow-sm">
                  <Text className="text-lg font-bold text-gray-800 mb-2">
                    Market Insights
                  </Text>
                  <View className="bg-blue-50 p-3 rounded-lg">
                    <Text className="text-sm text-blue-800">
                      <Ionicons name="information-circle" size={16} /> 
                      {marketData.price_trend === 'increasing' 
                        ? `${marketData.crop} prices are trending upward. Consider holding your harvest if storage is available to potentially get better prices in the coming months.`
                        : marketData.price_trend === 'decreasing'
                          ? `${marketData.crop} prices are trending downward. If you have harvested crops, consider selling soon to avoid potential further price drops.`
                          : `${marketData.crop} prices are relatively stable. You can make selling decisions based on your immediate financial needs.`
                      }
                    </Text>
                  </View>
                  
                  <View className="mt-4 flex-row">
                    <View className="flex-1 bg-green-50 p-3 rounded-lg mr-2">
                      <Text className="text-sm font-semibold text-green-800 mb-1">Best Time to Sell</Text>
                      <Text className="text-xs text-green-700">
                        {marketData.price_forecast.reduce((max: any, item: any) => 
                          max.price < item.price ? item : max, 
                          { price: 0, date: '' }
                        ).date}
                      </Text>
                    </View>
                    <View className="flex-1 bg-red-50 p-3 rounded-lg ml-2">
                      <Text className="text-sm font-semibold text-red-800 mb-1">Lowest Price Date</Text>
                      <Text className="text-xs text-red-700">
                        {marketData.price_forecast.reduce((min: any, item: any) => 
                          (min.price === 0 || min.price > item.price) ? item : min, 
                          { price: 0, date: '' }
                        ).date}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
