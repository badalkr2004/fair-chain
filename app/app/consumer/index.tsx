import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {router} from "expo-router"

// Mock data for the marketplace
const products = [
  {
    id: '1',
    name: 'Premium Basmati Rice',
    price: '₹85/kg',
    origin: 'Haryana',
    rating: 4.8,
    farmer: 'Rajesh Kumar',
    organic: true,
    availableQuantity: '250 kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8d7?w=800&auto=format&fit=crop',
    priceBreakdown: {
      farmer: 60,
      logistics: 20,
      platform: 20
    }
  },
  {
    id: '2',
    name: 'Fresh Red Tomatoes',
    price: '₹40/kg',
    origin: 'Karnataka',
    rating: 4.5,
    farmer: 'Venkat Reddy',
    organic: false,
    availableQuantity: '100 kg',
    image: 'https://images.unsplash.com/photo-1592924357210-c3e81fb24baa?w=800&auto=format&fit=crop',
    priceBreakdown: {
      farmer: 65,
      logistics: 15,
      platform: 20
    }
  },
  {
    id: '3',
    name: 'Organic Whole Wheat Flour',
    price: '₹55/kg',
    origin: 'Punjab',
    rating: 4.9,
    farmer: 'Gurpreet Singh',
    organic: true,
    availableQuantity: '500 kg',
    image: 'https://images.unsplash.com/photo-1568386453619-84c3ff4b43c5?w=800&auto=format&fit=crop',
    priceBreakdown: {
      farmer: 70,
      logistics: 15,
      platform: 15
    }
  },
  {
    id: '4',
    name: 'Fresh Green Peas',
    price: '₹120/kg',
    origin: 'Himachal Pradesh',
    rating: 4.7,
    farmer: 'Neha Sharma',
    organic: true,
    availableQuantity: '80 kg',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop',
    priceBreakdown: {
      farmer: 75,
      logistics: 15,
      platform: 10
    }
  }
];

const categories = [
  { id: '1', name: 'All', icon: 'apps' },
  { id: '2', name: 'Grains', icon: 'nutrition' },
  { id: '3', name: 'Vegetables', icon: 'leaf' },
  { id: '4', name: 'Fruits', icon: 'water' },
  { id: '5', name: 'Dairy', icon: 'cafe' }
];

export default function ConsumerMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const profileRoute=()=>{
    router.replace("/consumer/profile")
  }

  return (
    <View className="flex-1 bg-[#F8FAF5]">
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 pt-16">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-bold text-blue-800">Marketplace</Text>
              <Text className="text-gray-600">Fresh produce from farm to table</Text>
            </View>
            <TouchableOpacity 
              className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center"
              onPress={() => {}}
            >
              <Ionicons name="cart-outline" size={24} color="#2563eb" />
            </TouchableOpacity>
          </View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-6 shadow-sm">
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 text-gray-700 ml-2"
                placeholder="Search products, farmers, or categories"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className={`mr-4 items-center justify-center ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 px-5 py-3 rounded-xl'
                      : 'bg-white px-5 py-3 rounded-xl'
                  }`}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={18}
                    color={selectedCategory === category.id ? '#ffffff' : '#6b7280'}
                  />
                  <Text
                    className={`mt-1 ${
                      selectedCategory === category.id
                        ? 'text-white'
                        : 'text-gray-600'
                    }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            {products.map((product) => (
              <View 
                key={product.id}
                className="bg-white rounded-xl overflow-hidden mb-5 shadow-sm"
              >
                <Image
                  source={{ uri: product.image }}
                  className="h-48 w-full"
                  resizeMode="cover"
                />
                <View className="p-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-lg font-semibold text-gray-800">{product.name}</Text>
                    <Text className="text-blue-600 font-semibold">{product.price}</Text>
                  </View>
                  
                  <View className="flex-row items-center mb-3">
                    <Text className="text-gray-600 mr-4">Origin: {product.origin}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#fbbf24" />
                      <Text className="text-gray-600 ml-1">{product.rating}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="person" size={14} color="#6b7280" />
                      <Text className="text-gray-600 ml-1">Farmer: {product.farmer}</Text>
                    </View>
                    {product.organic && (
                      <View className="bg-green-100 px-2 py-1 rounded-full">
                        <Text className="text-green-700 text-xs">Organic</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    className="mb-3"
                    onPress={() => setShowDetail(showDetail === product.id ? null : product.id)}
                  >
                    <Text className="text-blue-600 text-sm">
                      {showDetail === product.id ? 'Hide price breakdown' : 'View price breakdown'}
                    </Text>
                  </TouchableOpacity>

                  {showDetail === product.id && (
                    <View className="bg-gray-50 p-3 rounded-lg mb-3">
                      <Text className="text-gray-700 mb-2 font-medium">Price Breakdown</Text>
                      <View className="mb-2">
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-gray-600 text-sm">Farmer's share</Text>
                          <Text className="text-gray-800 text-sm">{product.priceBreakdown.farmer}%</Text>
                        </View>
                        <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <View 
                            className="h-full bg-green-600" 
                            style={{ width: `${product.priceBreakdown.farmer}%` }} 
                          />
                        </View>
                      </View>
                      
                      <View className="mb-2">
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-gray-600 text-sm">Logistics & Processing</Text>
                          <Text className="text-gray-800 text-sm">{product.priceBreakdown.logistics}%</Text>
                        </View>
                        <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <View 
                            className="h-full bg-amber-600" 
                            style={{ width: `${product.priceBreakdown.logistics}%` }} 
                          />
                        </View>
                      </View>
                      
                      <View>
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-gray-600 text-sm">Platform fee</Text>
                          <Text className="text-gray-800 text-sm">{product.priceBreakdown.platform}%</Text>
                        </View>
                        <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <View 
                            className="h-full bg-blue-600" 
                            style={{ width: `${product.priceBreakdown.platform}%` }} 
                          />
                        </View>
                      </View>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-700">Available: {product.availableQuantity}</Text>
                    <TouchableOpacity
                      className="bg-blue-600 px-5 py-2 rounded-lg"
                      onPress={() => {}}
                    >
                      <Text className="text-white font-medium">Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-3 pb-8 flex-row justify-between border-t border-gray-200">
        <TouchableOpacity className="items-center">
          <Ionicons name="home" size={24} color="#2563eb" />
          <Text className="text-blue-600 text-xs mt-1">Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Ionicons name="search" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs mt-1">Explore</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Ionicons name="cart" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs mt-1">Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center" onPress={profileRoute}>
          <Ionicons name="person" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 