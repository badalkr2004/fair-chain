import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ordersService from '../../services/orders';

// Types
interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: any;
}

interface Order {
  id: string;
  orderId: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
}

// Status type and colors mapping
const statusColors = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-700' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  IN_TRANSIT: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-700' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function ConsumerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setError(null);
      const response = await ordersService.getMyOrders() as OrdersResponse;
      
      if (response && response.orders) {
        // Sort orders by date (newest first)
        const sortedOrders = response.orders.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load your orders. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  const filterOrders = (status: string | null) => {
    setActiveFilter(status);
    
    if (!status) {
      setFilteredOrders(orders);
      return;
    }
    
    const filtered = orders.filter(order => order.status === status);
    setFilteredOrders(filtered);
  };

  const navigateToOrderDetails = (orderId: string) => {
    router.push({
      pathname: '/consumer/order-details',
      params: { orderId }
    } as any);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAF5]">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAF5]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="pt-16 px-6 pb-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center bg-blue-100 mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-blue-800">My Orders</Text>
        </View>
        
        {/* Filter tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <TouchableOpacity
            className={`py-2 px-4 rounded-full mr-2 ${!activeFilter ? 'bg-blue-600' : 'bg-gray-200'}`}
            onPress={() => filterOrders(null)}
          >
            <Text className={!activeFilter ? 'text-white font-medium' : 'text-gray-800'}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`py-2 px-4 rounded-full mr-2 ${activeFilter === 'PENDING' ? 'bg-amber-100 border border-amber-300' : 'bg-gray-200'}`}
            onPress={() => filterOrders('PENDING')}
          >
            <Text className={activeFilter === 'PENDING' ? 'text-amber-800 font-medium' : 'text-gray-800'}>
              Pending
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`py-2 px-4 rounded-full mr-2 ${activeFilter === 'CONFIRMED' ? 'bg-blue-100 border border-blue-300' : 'bg-gray-200'}`}
            onPress={() => filterOrders('CONFIRMED')}
          >
            <Text className={activeFilter === 'CONFIRMED' ? 'text-blue-800 font-medium' : 'text-gray-800'}>
              Confirmed
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`py-2 px-4 rounded-full mr-2 ${activeFilter === 'IN_TRANSIT' ? 'bg-indigo-100 border border-indigo-300' : 'bg-gray-200'}`}
            onPress={() => filterOrders('IN_TRANSIT')}
          >
            <Text className={activeFilter === 'IN_TRANSIT' ? 'text-indigo-800 font-medium' : 'text-gray-800'}>
              In Transit
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`py-2 px-4 rounded-full mr-2 ${activeFilter === 'DELIVERED' ? 'bg-green-100 border border-green-300' : 'bg-gray-200'}`}
            onPress={() => filterOrders('DELIVERED')}
          >
            <Text className={activeFilter === 'DELIVERED' ? 'text-green-800 font-medium' : 'text-gray-800'}>
              Delivered
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`py-2 px-4 rounded-full mr-2 ${activeFilter === 'CANCELLED' ? 'bg-red-100 border border-red-300' : 'bg-gray-200'}`}
            onPress={() => filterOrders('CANCELLED')}
          >
            <Text className={activeFilter === 'CANCELLED' ? 'text-red-800 font-medium' : 'text-gray-800'}>
              Cancelled
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {error ? (
        <View className="p-6 items-center justify-center">
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text className="text-red-500 text-center mt-2 mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-blue-600 py-2 px-6 rounded-lg"
            onPress={handleRefresh}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-lg font-medium mt-4 mb-2">No orders found</Text>
          {activeFilter ? (
            <Text className="text-gray-400 text-center mb-4">
              You don't have any {activeFilter.toLowerCase().replace('_', ' ')} orders
            </Text>
          ) : (
            <Text className="text-gray-400 text-center mb-4">
              Once you place orders, they will appear here
            </Text>
          )}
          
          <TouchableOpacity
            className="bg-blue-600 py-3 px-6 rounded-lg"
            onPress={() => router.push('/consumer' as any)}
          >
            <Text className="text-white font-medium">Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-4 shadow-sm"
              onPress={() => navigateToOrderDetails(item.id)}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-medium text-gray-800">Order #{item.orderId.substring(0, 8)}</Text>
                <View className={`px-3 py-1 rounded-full ${statusColors[item.status].bg}`}>
                  <Text className={`text-xs font-medium ${statusColors[item.status].text}`}>
                    {item.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center mb-3">
                <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-1">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text className="text-gray-500 mx-2">•</Text>
                <Ionicons name="cube-outline" size={14} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-1">
                  {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                </Text>
              </View>
              
              {/* Preview of items */}
              <View className="bg-gray-50 p-3 rounded-lg mb-3">
                {item.items.slice(0, 2).map((orderItem) => (
                  <View key={orderItem.id} className="flex-row justify-between mb-1">
                    <Text className="text-gray-700" numberOfLines={1} style={{ width: '70%' }}>
                      {orderItem.quantity}x {orderItem.product?.name || 'Product'}
                    </Text>
                    <Text className="text-gray-800 font-medium">
                      ₹{orderItem.totalPrice.toFixed(2)}
                    </Text>
                  </View>
                ))}
                {item.items.length > 2 && (
                  <Text className="text-gray-500 text-sm mt-1">
                    +{item.items.length - 2} more items
                  </Text>
                )}
              </View>
              
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-500 text-xs">Total Amount</Text>
                  <Text className="text-blue-700 font-semibold text-lg">
                    ₹{item.totalAmount.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-blue-600 mr-1">View Details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      
      {/* Footer Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-3 pb-8 flex-row justify-between border-t border-gray-200">
        <TouchableOpacity 
          className="items-center"
          onPress={() => router.push('/consumer/dashboard' as any)}
        >
          <Ionicons name="home" size={24} color="#9ca3af" />
          <Text className="text-gray-500 text-xs mt-1">Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center"
          onPress={() => router.push('/consumer' as any)}
        >
          <Ionicons name="basket" size={24} color="#9ca3af" />
          <Text className="text-gray-500 text-xs mt-1">Shop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center"
          onPress={() => {}}
        >
          <Ionicons name="list" size={24} color="#3b82f6" />
          <Text className="text-blue-600 text-xs mt-1">Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center"
          onPress={() => router.push('/consumer/profile' as any)}
        >
          <Ionicons name="person" size={24} color="#9ca3af" />
          <Text className="text-gray-500 text-xs mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 