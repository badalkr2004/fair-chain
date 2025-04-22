import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/auth';
import * as productsService from '../../services/products';
import * as ordersService from '../../services/orders';

// Types
interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  images: string[];
  category: string;
  unit: string;
  organicCertified: boolean;
}

interface Order {
  id: string;
  orderId: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    product?: Product;
  }[];
}

interface OrdersResponse {
  orders: Order[];
}

interface ProductsResponse {
  products: Product[];
}

export default function ConsumerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setDebugInfo(null);
      
      // Get user profile
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          setDebugInfo("No user found in AsyncStorage. Please log in again.");
          router.replace('/(auth)/login');
          return;
        }
        setUser(currentUser);
        
        // Get full profile from server
        try {
          const profileResponse = await authService.getUserProfile();
          if (profileResponse && profileResponse.user) {
            setUser(profileResponse.user);
          } else {
            setDebugInfo("User profile response format invalid");
          }
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError);
          setDebugInfo(`Profile error: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`);
        }
      } catch (userError) {
        console.error('Error getting current user:', userError);
        setDebugInfo(`User error: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
        router.replace('/(auth)/login');
        return;
      }

      // Get recent orders
      try {
        const ordersResponse = await ordersService.getMyOrders() as OrdersResponse;
        if (ordersResponse && ordersResponse.orders) {
          setRecentOrders(ordersResponse.orders);
        } else {
          setDebugInfo(debugInfo => `${debugInfo || ''}\nOrders response format invalid`);
          setRecentOrders([]);
        }
      } catch (ordersError) {
        console.error('Error loading orders:', ordersError);
        setDebugInfo(debugInfo => `${debugInfo || ''}\nOrders error: ${ordersError instanceof Error ? ordersError.message : 'Unknown error'}`);
        setRecentOrders([]);
      }

      // Get recommended products (simulated with filtered products)
      try {
        const productsResponse = await productsService.getProducts({ 
          status: 'LISTED',
          limit: 5,
          sortBy: 'createdAt',
          sortDirection: 'desc'
        }) as ProductsResponse;
        
        if (productsResponse && productsResponse.products) {
          setRecommendedProducts(productsResponse.products);
        } else {
          setDebugInfo(debugInfo => `${debugInfo || ''}\nProducts response format invalid`);
          setRecommendedProducts([]);
        }
      } catch (productsError) {
        console.error('Error loading recommended products:', productsError);
        setDebugInfo(debugInfo => `${debugInfo || ''}\nProducts error: ${productsError instanceof Error ? productsError.message : 'Unknown error'}`);
        setRecommendedProducts([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Pull down to refresh.');
      setDebugInfo(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setError(null);
    setDebugInfo(null);
    loadDashboardData();
  };

  const navigateToOrderDetails = (orderId: string) => {
    router.push({
      pathname: '/consumer/order-details',
      params: { orderId }
    } as any);
  };

  const navigateToProductDetails = (productId: string) => {
    router.push({
      pathname: '/consumer/product-details',
      params: { productId }
    } as any);
  };

  const navigateToProfile = () => {
    router.push('/consumer/profile' as any);
  };

  const navigateToMarketplace = () => {
    router.push('/consumer' as any);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAF5]">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading your dashboard...</Text>
      </View>
    );
  }

  // Get user information with fallbacks
  const userName = user?.name || 'Consumer';
  const userType = user?.consumerProfile?.type || 'RETAILER';
  
  // Format consumer type for display
  const formattedConsumerType = userType.charAt(0) + userType.slice(1).toLowerCase().replace('_', ' ');

  // Get default delivery address or empty string
  const defaultAddress = user?.consumerProfile?.deliveryAddress?.default || '';

  return (
    <View className="flex-1 bg-[#F8FAF5]">
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        <View className="px-6 pt-16">
          {/* Header with greeting and profile button */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-2xl font-bold text-blue-800">Your Dashboard</Text>
              <Text className="text-gray-600">Welcome back, {userName}</Text>
            </View>
            <TouchableOpacity 
              className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center"
              onPress={navigateToProfile}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <Ionicons name="person" size={24} color="#3b82f6" />
              )}
            </TouchableOpacity>
          </View>

          {/* Error message */}
          {error && (
            <View className="bg-red-50 p-4 rounded-lg mb-4">
              <Text className="text-red-500 font-medium">{error}</Text>
              {debugInfo && __DEV__ && (
                <Text className="text-red-400 text-xs mt-2">{debugInfo}</Text>
              )}
              <TouchableOpacity 
                className="bg-red-100 py-2 px-4 rounded-lg mt-2 self-start"
                onPress={handleRefresh}
              >
                <Text className="text-red-700">Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick stats */}
          <Animated.View 
            className="bg-blue-600 rounded-xl p-5 mb-8"
            entering={FadeInDown.delay(200).duration(500)}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="stats-chart" size={24} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">Your Summary</Text>
            </View>
            <View className="flex-row justify-between">
              <View className="bg-white/20 rounded-lg p-3 flex-1 mr-2">
                <Text className="text-white text-xs mb-1">Orders</Text>
                <Text className="text-white font-semibold">{recentOrders.length}</Text>
              </View>
              <View className="bg-white/20 rounded-lg p-3 flex-1 mr-2">
                <Text className="text-white text-xs mb-1">Saved Items</Text>
                <Text className="text-white font-semibold">0</Text>
              </View>
              <View className="bg-white/20 rounded-lg p-3 flex-1">
                <Text className="text-white text-xs mb-1">Reviews</Text>
                <Text className="text-white font-semibold">0</Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick actions */}
          <Animated.View 
            entering={FadeInDown.delay(300).duration(500)}
            className="mb-8"
          >
            <Text className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="bg-white rounded-xl p-4 items-center justify-center shadow-sm"
                style={{ width: '48%' }}
                onPress={navigateToMarketplace}
              >
                <Ionicons name="basket" size={28} color="#3b82f6" />
                <Text className="text-gray-800 font-medium mt-2">Shop Products</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-white rounded-xl p-4 items-center justify-center shadow-sm"
                style={{ width: '48%' }}
                onPress={() => router.push('/consumer/orders' as any)}
              >
                <Ionicons name="list" size={28} color="#3b82f6" />
                <Text className="text-gray-800 font-medium mt-2">My Orders</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Recent orders */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-800">Recent Orders</Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push('/consumer/orders' as any)}
              >
                <Text className="text-blue-600 mr-1">View All</Text>
                <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
              </TouchableOpacity>
            </View>

            {recentOrders.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center justify-center mb-4 shadow-sm">
                <Ionicons name="receipt-outline" size={40} color="#d1d5db" />
                <Text className="text-gray-500 mt-2">No orders yet</Text>
                <Text className="text-gray-400 text-sm text-center mt-1 mb-2">
                  Start shopping to see your orders here
                </Text>
                <TouchableOpacity
                  className="bg-blue-100 px-4 py-2 rounded-lg mt-2"
                  onPress={navigateToMarketplace}
                >
                  <Text className="text-blue-700">Browse Marketplace</Text>
                </TouchableOpacity>
              </View>
            ) : (
              recentOrders.slice(0, 3).map((order) => (
                <TouchableOpacity 
                  key={order.id}
                  className="bg-white rounded-xl p-4 mb-4 shadow-sm"
                  onPress={() => navigateToOrderDetails(order.id)}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-medium text-gray-800">Order #{order.orderId.substring(0, 8)}</Text>
                    <View className={`px-3 py-1 rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100' : 
                      order.status === 'CANCELLED' ? 'bg-red-100' : 
                      order.status === 'IN_TRANSIT' ? 'bg-blue-100' : 
                      'bg-amber-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        order.status === 'DELIVERED' ? 'text-green-700' : 
                        order.status === 'CANCELLED' ? 'text-red-700' : 
                        order.status === 'IN_TRANSIT' ? 'text-blue-700' : 
                        'text-amber-700'
                      }`}>
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <Text className="text-gray-600 text-sm">{new Date(order.createdAt).toLocaleDateString()}</Text>
                    <Text className="text-gray-500 mx-2">•</Text>
                    <Text className="text-gray-600 text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="text-blue-700 font-medium">₹{order.totalAmount.toFixed(2)}</Text>
                    <View className="flex-row items-center">
                      <Text className="text-gray-600 mr-1">Details</Text>
                      <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </Animated.View>

          {/* Recommended products */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)} className="mt-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-800">Recommended for You</Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={navigateToMarketplace}
              >
                <Text className="text-blue-600 mr-1">View All</Text>
                <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
              </TouchableOpacity>
            </View>

            {recommendedProducts.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center justify-center mb-4 shadow-sm">
                <Ionicons name="nutrition-outline" size={40} color="#d1d5db" />
                <Text className="text-gray-500 mt-2">No recommendations yet</Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Browse the marketplace to get personalized recommendations
                </Text>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingEnd: 12 }}
              >
                {recommendedProducts.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    className="bg-white rounded-xl mr-4 shadow-sm"
                    style={{ width: 180 }}
                    onPress={() => navigateToProductDetails(product.id)}
                  >
                    <View className="relative">
                      <Image
                        source={{ 
                          uri: product.images && product.images.length > 0 
                            ? product.images[0] 
                            : 'https://images.unsplash.com/photo-1553787499-6f9133242821?w=600&auto=format&fit=crop'
                        }}
                        className="h-32 w-full rounded-t-xl"
                        resizeMode="cover"
                      />
                      {product.organicCertified && (
                        <View className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded-full">
                          <Text className="text-green-700 text-xs">Organic</Text>
                        </View>
                      )}
                    </View>
                    <View className="p-3">
                      <Text className="text-gray-800 font-medium" numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text className="text-gray-500 text-xs mb-2" numberOfLines={1}>
                        {product.category}
                      </Text>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-blue-700 font-semibold">
                          ₹{product.basePrice}/{product.unit}
                        </Text>
                        <TouchableOpacity>
                          <Ionicons name="add-circle" size={24} color="#3b82f6" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Animated.View>

          {/* Carbon footprint and impact */}
          <Animated.View 
            entering={FadeInDown.delay(600).duration(500)} 
            className="bg-white rounded-xl p-5 mt-8 mb-4 shadow-sm"
          >
            <View className="flex-row items-start mb-3">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="leaf" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium mb-1">Your Impact</Text>
                <Text className="text-gray-600 text-sm">
                  By buying directly from farmers, you've helped reduce food miles and supported local agriculture.
                </Text>
              </View>
            </View>
            <View className="bg-gray-50 rounded-lg p-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-700 text-sm">Carbon saved</Text>
                <Text className="text-green-700 text-sm font-medium">5.8 kg CO₂</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700 text-sm">Farmers supported</Text>
                <Text className="text-green-700 text-sm font-medium">
                  {recentOrders.length > 0 ? 2 : 0}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-3 pb-8 flex-row justify-between border-t border-gray-200">
        <TouchableOpacity 
          className="items-center"
        >
          <Ionicons name="home" size={24} color="#2563eb" />
          <Text className="text-blue-600 text-xs mt-1">Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center"
          onPress={() => router.push('./browse-products')}
        >
          <Ionicons name="basket-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-500 text-xs mt-1">Shop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center"
          onPress={() => router.push('./cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-500 text-xs mt-1">Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center"
          onPress={() => router.push('./profile')}
        >
          <Ionicons name="person-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-500 text-xs mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 