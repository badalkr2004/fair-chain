import  { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import produceService from '../../services/produce';
import authService from '../../services/auth';
import traceabilityService from '../../services/traceability';

export default function FarmerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [crops, setCrops] = useState<any[]>([]);
  const [supplyChainActivities, setSupplyChainActivities] = useState<any[]>([]);
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
      setCrops(produceData.map((item: any) => ({
        id: item.id,
        name: item.name,
        variety: item.category,
        quantity: `${item.quantity} ${item.unit}`,
        status: item.status === 'AVAILABLE' ? 'Ready for sale' : 'Processing',
        predictedPrice: `₹${item.price}/kg`,
        image: item.images && item.images.length > 0 
          ? item.images[0] 
          : 'https://images.unsplash.com/photo-1626426336803-0fb815b51502?w=800&auto=format&fit=crop'
      })));

      // Load supply chain data
      const traceableProducts = await traceabilityService.getMyTraceableProducts();
      setSupplyChainActivities(traceableProducts.slice(0, 2).map((item: any) => ({
        id: item.id,
        name: `${item.name} #${item.batchNumber || item.id.substr(0, 8)}`,
        status: item.currentStage || 'Processing',
        progress: getProgressValue(item.currentStage)
      })));
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
      console.error(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getProgressValue = (stage?: string) => {
    if (!stage) return 1;
    const stages = ['HARVESTED', 'PROCESSED', 'PACKAGED', 'SHIPPED', 'RECEIVED'];
    const index = stages.findIndex(s => s === stage);
    return Math.max(index + 1, 1);
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
            <View className="flex-row items-center mb-3">
              <Ionicons name="analytics-outline" size={24} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">Market Summary</Text>
            </View>
            <View className="flex-row justify-between">
              <View className="bg-white/20 rounded-lg p-3 flex-1 mr-2">
                <Text className="text-white text-xs mb-1">Current Season</Text>
                <Text className="text-white font-semibold">Active</Text>
              </View>
              <View className="bg-white/20 rounded-lg p-3 flex-1 mr-2">
                <Text className="text-white text-xs mb-1">Active Crops</Text>
                <Text className="text-white font-semibold">{crops.length}</Text>
              </View>
              <View className="bg-white/20 rounded-lg p-3 flex-1">
                <Text className="text-white text-xs mb-1">Products</Text>
                <Text className="text-white font-semibold">{supplyChainActivities.length}</Text>
              </View>
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
                <TouchableOpacity 
                  className="mt-4 bg-green-50 px-4 py-2 rounded-lg"
                  onPress={() => router.push('/farmer/register-product')}
                >
                  <Text className="text-green-600">Register a product</Text>
                </TouchableOpacity>
              </View>
            ) : (
              supplyChainActivities.map((activity) => (
                <View key={activity.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-medium text-gray-800">{activity.name}</Text>
                    <View className="bg-blue-100 px-2 py-1 rounded-full">
                      <Text className="text-blue-700 text-xs">{activity.status}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <View className={`h-1 w-8 ${activity.progress >= 1 ? 'bg-green-600' : 'bg-gray-300'} rounded-l-full`} />
                    <View className={`h-1 w-8 ${activity.progress >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
                    <View className={`h-1 w-8 ${activity.progress >= 3 ? 'bg-green-600' : 'bg-gray-300'}`} />
                    <View className={`h-1 w-8 ${activity.progress >= 4 ? 'bg-green-600' : 'bg-gray-300'} rounded-r-full`} />
                  </View>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-xs text-gray-500">Farm</Text>
                    <Text className="text-xs text-gray-500">Processing</Text>
                    <Text className="text-xs text-gray-500">Distribution</Text>
                    <Text className="text-xs text-gray-500">Retailer</Text>
                  </View>
                </View>
              ))
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
        
        <TouchableOpacity className="items-center">
          <Ionicons name="analytics" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs mt-1">Insights</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Ionicons name="wallet" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs mt-1">Finances</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 