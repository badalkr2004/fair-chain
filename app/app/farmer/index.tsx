import  { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import produceService from '../../services/produce';
import authService from '../../services/auth';
import traceabilityService from '../../services/traceability';
import forecastingService from '../../services/forecasting';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FarmerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marketSummaryLoading, setMarketSummaryLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [crops, setCrops] = useState<any[]>([]);
  const [supplyChainActivities, setSupplyChainActivities] = useState<any[]>([]);
  const [marketSummary, setMarketSummary] = useState({
    topCrop: { name: 'Loading...', trend: 'stable' },
    avgPriceChange: 0,
    demandTrend: 'stable',
    lastUpdated: ''
  });
  const [marketInsights, setMarketInsights] = useState([
    {
      id: '1',
      title: 'Rice prices expected to rise by 12% next month',
      description: 'Due to reduced cultivation area and increased export demand.'
    },
    {
      id: '2',
      title: 'Tomato demand increasing in urban markets',
      description: 'Urban consumers showing preference for organic variants.'
    },
    {
      id: '3',
      title: 'New government subsidy for wheat farmers announced',
      description: 'Eligible farmers can apply through the agriculture portal.'
    }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load user data
      const userData = await authService.getCurrentUser();
      setUser(userData);

      // Load produce data
      const produceData = await produceService.getMyProduce();
      const cropsList = produceData.data.produce.map((item: any) => ({
        id: item.id,
        name: item.name,
        variety: item.category, 
        quantity: `${item.quantity} ${item.unit}`,
        status: item.status === 'AVAILABLE' ? 'Ready for sale' : 'Processing',
        predictedPrice: `₹${item.finalPrice}/kg`,
        image: item.images && item.images.length > 0 
          ? item.images[0] 
          : 'https://images.unsplash.com/photo-1626426336803-0fb815b51502?w=800&auto=format&fit=crop'
      }));

      // Load traceability data with immediate fallback to mock data if authentication issues are detected
      try {
        console.log('Loading traceability data...');
        
        // Check if we have a valid auth token before proceeding
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.warn('No authentication token found, using mock data');
          const mockData = await traceabilityService.getMockTraceableProducts();
          handleTraceabilityData(mockData);
          return;
        }
        
        const traceableProducts = await traceabilityService.getMyTraceableProducts();
        handleTraceabilityData(traceableProducts);
      } catch (supplyChainError) {
        console.error('Error handling supply chain data:', supplyChainError);
        // Set empty array to prevent undefined errors in the UI
        setSupplyChainActivities([]);
      }

      // Set crops after loading
      setCrops(cropsList);
      
      // Complete main UI loading
      setIsLoading(false);
      
      // Load market summary data separately
      loadMarketSummary(cropsList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
      console.error(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Load market summary data
  const loadMarketSummary = async (cropsList: any[]) => {
    setMarketSummaryLoading(true);
    try {
      // Get all available crops for market data
      const availableCrops = await forecastingService.getAllCrops();
      
      // Get market prices for common crops
      const cropNames = cropsList.length > 0 
        ? cropsList.map(crop => crop.name) 
        : ['Wheat', 'Rice', 'Maize'].filter(c => availableCrops.includes(c));
      
      // Get price data for the first crop or default to wheat
      const cropToCheck = cropNames[0] || 'Wheat';
      const priceData = await forecastingService.getMarketPrices(cropToCheck);
      
      // Get optimal crops for a default region
      const optimalCropsData = await forecastingService.getOptimalCrops({ region: 'Patna', top_n: 3 });
      
      // Find the crop with highest growth potential
      let topCrop = { name: cropToCheck, trend: priceData.price_trend };
      if (optimalCropsData && optimalCropsData.optimal_crops && optimalCropsData.optimal_crops.length > 0) {
        const bestCrop = optimalCropsData.optimal_crops.reduce(
          (best, current) => current.growth_potential > best.growth_potential ? current : best,
          optimalCropsData.optimal_crops[0]
        );
        topCrop = { name: bestCrop.crop, trend: bestCrop.yield_trend };
      }
      
      // Calculate average price change from forecast
      let avgPriceChange = 0;
      if (priceData && priceData.price_forecast && priceData.price_forecast.length > 0) {
        const lastPrice = priceData.price_forecast[priceData.price_forecast.length - 1].price;
        const priceChange = ((lastPrice - priceData.current_price) / priceData.current_price) * 100;
        avgPriceChange = Math.round(priceChange * 10) / 10; // Round to 1 decimal place
      }
      
      // Set market summary
      setMarketSummary({
        topCrop,
        avgPriceChange,
        demandTrend: priceData.price_trend,
        lastUpdated: priceData.last_updated
      });
      
    } catch (error) {
      console.error('Error loading market summary:', error);
      // Keep default values if there's an error
    } finally {
      setMarketSummaryLoading(false);
    }
  };

  // Add a helper function to process traceability data
  const handleTraceabilityData = (traceableProducts: any[]) => {
    // Ensure traceableProducts is always an array, even if API returns null/undefined
    if (Array.isArray(traceableProducts) && traceableProducts.length > 0) {
      console.log(`Successfully loaded ${traceableProducts.length} traceable products`);
      
      // Map products to supply chain activities with safe property access
      setSupplyChainActivities(traceableProducts.slice(0, 3).map((item: any) => ({
        id: item?.id || `mock-${Math.random().toString(36).substring(7)}`,
        name: `${item?.name || 'Product'} ${item?.batchNumber ? `#${item?.batchNumber}` : ''}`,
        status: item?.currentStage || 'Registered',
        progress: getProgressValue(item?.currentStage),
        productId: item?.productId || item?.id || ''
      })));
    } else {
      console.log('No traceable products found or returned empty array');
      setSupplyChainActivities([]);
    }
  };

  const getProgressValue = (stage?: string): number => {
    // If no stage provided, return 1 (first stage)
    if (!stage) return 1;
    
    // Define all possible stages in order
    const stages = ['HARVESTED', 'PROCESSED', 'PACKAGED', 'SHIPPED', 'RECEIVED', 'QUALITY_CHECK', 'STORED'];
    
    // Find the index of the current stage
    const index = stages.findIndex(s => s.toUpperCase() === stage.toUpperCase());
    
    // If stage is not found in our defined stages, return 1
    // Otherwise return the stage index + 1 (to avoid zero)
    return index === -1 ? 1 : Math.min(index + 1, 5);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddCrop = () => {
    router.push('/farmer/add-produce');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/(auth)');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const profileRoute=()=>{
    router.push("/farmer/profile")
  }
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAF5]">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="mt-2 text-gray-600">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAF5]">
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
        }
      >
        <View className="px-6 pt-16">
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-2xl font-bold text-green-800">Farmer Dashboard</Text>
              <Text className="text-gray-600">Welcome back, {user?.name || 'Farmer'}</Text>
            </View>
            <TouchableOpacity 
              className="w-12 h-12 rounded-full bg-green-100 items-center justify-center"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#16a34a" />
            </TouchableOpacity>
          </View>

          <Animated.View 
            className="bg-green-600 rounded-xl p-5 mb-8"
            entering={FadeInDown.delay(200).duration(500)}
          >
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons name="analytics-outline" size={24} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">Market Summary</Text>
              </View>
              {!marketSummaryLoading && (
                <Text className="text-white/70 text-xs">
                  {marketSummary.lastUpdated ? `Updated: ${marketSummary.lastUpdated}` : ''}
                </Text>
              )}
            </View>
            
            {marketSummaryLoading ? (
              <View className="items-center justify-center py-6">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white/80 text-xs mt-2">Loading market data...</Text>
              </View>
            ) : (
              <>
                <View className="flex-row justify-between mb-3">
                  <View className="bg-white/20 rounded-lg p-3 flex-1 mr-2">
                    <Text className="text-white text-xs mb-1">Top Performing Crop</Text>
                    <View className="flex-row items-center">
                      <Text className="text-white font-semibold mr-1">{marketSummary.topCrop.name}</Text>
                      <Ionicons 
                        name={marketSummary.topCrop.trend === 'increasing' ? 'arrow-up-outline' : 
                              marketSummary.topCrop.trend === 'decreasing' ? 'arrow-down-outline' : 'remove-outline'} 
                        size={14} 
                        color="white" 
                      />
                    </View>
                  </View>
                  <View className="bg-white/20 rounded-lg p-3 flex-1">
                    <Text className="text-white text-xs mb-1">Price Forecast</Text>
                    <View className="flex-row items-center">
                      <Text className="text-white font-semibold mr-1">
                        {marketSummary.avgPriceChange > 0 ? '+' : ''}{marketSummary.avgPriceChange}%
                      </Text>
                      <Ionicons 
                        name={marketSummary.avgPriceChange > 0 ? 'arrow-up-outline' : 
                              marketSummary.avgPriceChange < 0 ? 'arrow-down-outline' : 'remove-outline'} 
                        size={14} 
                        color="white" 
                      />
                    </View>
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View className="bg-white/20 rounded-lg p-3 flex-1 mr-2">
                    <Text className="text-white text-xs mb-1">Market Demand</Text>
                    <View className="flex-row items-center">
                      <Text className="text-white font-semibold mr-1">
                        {marketSummary.demandTrend.charAt(0).toUpperCase() + marketSummary.demandTrend.slice(1)}
                      </Text>
                      <Ionicons 
                        name={marketSummary.demandTrend === 'increasing' ? 'arrow-up-outline' : 
                              marketSummary.demandTrend === 'decreasing' ? 'arrow-down-outline' : 'remove-outline'} 
                        size={14} 
                        color="white" 
                      />
                    </View>
                  </View>
                  <View className="bg-white/20 rounded-lg p-3 flex-1">
                    <Text className="text-white text-xs mb-1">Your Crops</Text>
                    <Text className="text-white font-semibold">{crops.length}</Text>
                  </View>
                </View>
              </>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-800">Quick Actions</Text>
            </View>
            <View className="flex-row flex-wrap">
              <TouchableOpacity 
                className="bg-white rounded-xl p-4 shadow-sm mr-3 mb-3 w-[48%] items-center"
                onPress={() => router.push('/farmer/forecasting')}
              >
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-2">
                  <Ionicons name="analytics-outline" size={24} color="#3b82f6" />
                </View>
                <Text className="text-gray-800 font-medium">AI Forecasting</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-white rounded-xl p-4 shadow-sm mb-3 w-[48%] items-center"
                onPress={() => router.push('/farmer/market-prices')}
              >
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-2">
                  <Ionicons name="trending-up-outline" size={24} color="#16a34a" />
                </View>
                <Text className="text-gray-800 font-medium">Market Prices</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-white rounded-xl p-4 shadow-sm mr-3 w-[48%] items-center"
                onPress={() => router.push('/traceability/scan')}
              >
                <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-2">
                  <Ionicons name="qr-code-outline" size={24} color="#8b5cf6" />
                </View>
                <Text className="text-gray-800 font-medium">Scan QR Code</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-white rounded-xl p-4 shadow-sm w-[48%] items-center"
                onPress={handleAddCrop}
              >
                <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mb-2">
                  <Ionicons name="add-outline" size={24} color="#f59e0b" />
                </View>
                <Text className="text-gray-800 font-medium">Add New Crop</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-800">Your Crops</Text>
              <TouchableOpacity
                onPress={handleAddCrop}
                className="flex-row items-center"
              >
                <Text className="text-green-600 mr-1">Add New</Text>
                <Ionicons name="add-circle-outline" size={18} color="#16a34a" />
              </TouchableOpacity>
            </View>

            {crops.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center justify-center mb-4">
                <Ionicons name="leaf-outline" size={40} color="#d1d5db" />
                <Text className="text-gray-400 mt-2 text-center">No crops added yet</Text>
                <TouchableOpacity 
                  className="mt-4 bg-green-50 px-4 py-2 rounded-lg"
                  onPress={handleAddCrop}
                >
                  <Text className="text-green-600">Add your first crop</Text>
                </TouchableOpacity>
              </View>
            ) : (
              crops.map((crop) => (
                <TouchableOpacity 
                  key={crop.id}
                  className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm"
                  onPress={() => router.push({
                    pathname: "/traceability/[id]",
                    params: { id: crop.id }
                  })}
                >
                  <Image
                    source={{ uri: crop.image }}
                    className="h-40 w-full"
                    resizeMode="cover"
                  />
                  <View className="p-4">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-lg font-semibold text-gray-800">{crop.name}</Text>
                      <View className="bg-green-100 px-2 py-1 rounded-full">
                        <Text className="text-green-700 text-xs">{crop.status}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <Text className="text-gray-600 mr-4">Variety: {crop.variety}</Text>
                      <Text className="text-gray-600">Quantity: {crop.quantity}</Text>
                    </View>
                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-gray-500">Current price:</Text>
                      <Text className="text-green-600 font-semibold">{crop.predictedPrice}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <View className="mt-4 mb-4">
              <Text className="text-xl font-semibold text-gray-800 mb-4">AI Market Insights</Text>
              
              {marketInsights.map((insight) => (
                <View
                  key={insight.id}
                  className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                >
                  <Text className="text-gray-800 font-medium mb-1">{insight.title}</Text>
                  <Text className="text-gray-600 text-sm">{insight.description}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).duration(500)}>
            <Text className="text-xl font-semibold text-gray-800 mb-4">Supply Chain Activity</Text>
            
            {supplyChainActivities.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center justify-center mb-4">
                <Ionicons name="git-network-outline" size={40} color="#d1d5db" />
                <Text className="text-gray-400 mt-2 text-center">No supply chain activity yet</Text>
                <Text className="text-gray-400 text-sm text-center mb-4">
                  Register your products for traceability to start tracking
                </Text>
                <View className="flex-row justify-center flex-wrap">
                  <TouchableOpacity 
                    className="mt-2 bg-green-50 px-4 py-2 rounded-lg mr-2"
                    onPress={() => router.push('/farmer/register-product')}
                  >
                    <Text className="text-green-600">Register New Product</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="mt-2 bg-green-600 px-4 py-2 rounded-lg"
                    onPress={() => router.push('/farmer/register-existing-product')}
                  >
                    <Text className="text-white">Use Existing Product</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-gray-700">Supply Chain Activity</Text>
                  <TouchableOpacity
                    onPress={() => router.push('/farmer/register-existing-product')}
                    className="flex-row items-center"
                  >
                    <Text className="text-green-600 mr-1">Register More</Text>
                    <Ionicons name="add-circle-outline" size={18} color="#16a34a" />
                  </TouchableOpacity>
                </View>
                
                {supplyChainActivities.map((activity) => (
                  <TouchableOpacity 
                    key={activity.id} 
                    className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                    onPress={() => router.push({
                      pathname: "/traceability/[id]",
                      params: { id: activity.productId || activity.id }
                    })}
                  >
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="font-medium text-gray-800">{activity.name}</Text>
                      <View className="bg-blue-100 px-2 py-1 rounded-full">
                        <Text className="text-blue-700 text-xs">{activity.status}</Text>
                      </View>
                    </View>
                    
                    <View>
                      <View className="flex-row items-center mb-1">
                        <View className={`h-1 w-8 ${activity.progress >= 1 ? 'bg-green-600' : 'bg-gray-300'} rounded-l-full`} />
                        <View className={`h-1 w-8 ${activity.progress >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
                        <View className={`h-1 w-8 ${activity.progress >= 3 ? 'bg-green-600' : 'bg-gray-300'}`} />
                        <View className={`h-1 w-8 ${activity.progress >= 4 ? 'bg-green-600' : 'bg-gray-300'}`} />
                        <View className={`h-1 w-8 ${activity.progress >= 5 ? 'bg-green-600' : 'bg-gray-300'} rounded-r-full`} />
                      </View>
                      
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-gray-500">Farm</Text>
                        <Text className="text-xs text-gray-500">Processing</Text>
                        <Text className="text-xs text-gray-500">Packaging</Text>
                        <Text className="text-xs text-gray-500">Shipping</Text>
                        <Text className="text-xs text-gray-500">Delivery</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity 
                  className="bg-green-50 p-3 rounded-lg items-center mt-2"
                  onPress={() => router.push('/farmer')}
                >
                  <Text className="text-green-600">Refresh Supply Chain Data</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-3 pb-8 flex-row justify-between border-t border-gray-200">
        <TouchableOpacity className="items-center">
          <Ionicons name="home" size={24} color="#16a34a" />
          <Text className="text-green-600 text-xs mt-1">Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Ionicons name="leaf" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs mt-1">Crops</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center" onPress={() => router.push('/farmer/forecasting')}>
          <Ionicons name="analytics" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs mt-1">Insights</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center" onPress={profileRoute}>
          <Ionicons name="person" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 