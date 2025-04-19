import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Mock data for the dashboard
const availableJobs = [
  {
    id: '1',
    productName: 'Rice',
    quantity: '5 tons',
    pickup: 'Bhatinda, Punjab',
    destination: 'Delhi NCR',
    distance: '250 km',
    expectedPrice: '₹8,500',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8d7?w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    productName: 'Wheat',
    quantity: '3.2 tons',
    pickup: 'Ludhiana, Punjab',
    destination: 'Chandigarh',
    distance: '100 km',
    expectedPrice: '₹4,200',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6962cb?w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    productName: 'Tomatoes',
    quantity: '1.5 tons',
    pickup: 'Sonipat, Haryana',
    destination: 'Delhi',
    distance: '60 km',
    expectedPrice: '₹3,800',
    image: 'https://images.unsplash.com/photo-1592924357210-c3e81fb24baa?w=800&auto=format&fit=crop'
  }
];

const activeTransports = [
  {
    id: '1',
    batchId: 'TR-2023-105',
    product: 'Rice',
    progress: 70,
    pickupDate: '15 Oct, 2023',
    deliveryDate: '18 Oct, 2023',
    status: 'In Transit',
  },
  {
    id: '2',
    batchId: 'TR-2023-098',
    product: 'Potatoes',
    progress: 100,
    pickupDate: '10 Oct, 2023',
    deliveryDate: '12 Oct, 2023',
    status: 'Delivered',
  }
];

export default function IntermediaryDashboard() {
  return (
    <View className="flex-1 bg-[#F8FAF5]">
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 pt-16">
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-2xl font-bold text-amber-800">Logistics Dashboard</Text>
              <Text className="text-gray-600">Welcome back, Kumar Transport</Text>
            </View>
            <TouchableOpacity 
              className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center"
              onPress={() => {}}
            >
              <Ionicons name="business" size={24} color="#d97706" />
            </TouchableOpacity>
          </View>

          <Animated.View 
            className="bg-amber-600 rounded-xl p-5 mb-8"
            entering={FadeInDown.delay(200).duration(500)}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="analytics-outline" size={24} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">Business Summary</Text>
            </View>
            <View className="flex-row justify-between">
              <View className="bg-white/20 rounded-lg p-3 flex-1 mr-2">
                <Text className="text-white text-xs mb-1">Active Jobs</Text>
                <Text className="text-white font-semibold">2</Text>
              </View>
              <View className="bg-white/20 rounded-lg p-3 flex-1 mr-2">
                <Text className="text-white text-xs mb-1">Available Jobs</Text>
                <Text className="text-white font-semibold">12</Text>
              </View>
              <View className="bg-white/20 rounded-lg p-3 flex-1">
                <Text className="text-white text-xs mb-1">Monthly Revenue</Text>
                <Text className="text-white font-semibold">₹42,500</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-800">Available Jobs</Text>
              <TouchableOpacity
                onPress={() => {}}
                className="flex-row items-center"
              >
                <Text className="text-amber-600 mr-1">View All</Text>
                <Ionicons name="arrow-forward" size={16} color="#d97706" />
              </TouchableOpacity>
            </View>

            {availableJobs.map((job) => (
              <TouchableOpacity 
                key={job.id}
                className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm"
                onPress={() => {}}
              >
                <Image
                  source={{ uri: job.image }}
                  className="h-32 w-full"
                  resizeMode="cover"
                />
                <View className="p-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-lg font-semibold text-gray-800">{job.productName}</Text>
                    <Text className="text-amber-600 font-medium">{job.expectedPrice}</Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <Text className="text-gray-600 mr-2">Quantity: {job.quantity}</Text>
                    <Text className="text-gray-600">Distance: {job.distance}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Ionicons name="locate" size={14} color="#6b7280" />
                        <Text className="text-gray-500 text-sm ml-1">From: {job.pickup}</Text>
                      </View>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="location" size={14} color="#6b7280" />
                        <Text className="text-gray-500 text-sm ml-1">To: {job.destination}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      className="bg-amber-100 px-3 py-2 rounded-lg"
                      onPress={() => {}}
                    >
                      <Text className="text-amber-700 font-medium">Bid Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <Text className="text-xl font-semibold text-gray-800 mt-4 mb-4">Active Transports</Text>
            
            {activeTransports.map((transport) => (
              <TouchableOpacity
                key={transport.id} 
                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                onPress={() => {}}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View>
                    <Text className="font-medium text-gray-800">{transport.product} - {transport.batchId}</Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-xs text-gray-500 mr-2">Pickup: {transport.pickupDate}</Text>
                      <Text className="text-xs text-gray-500">Delivery: {transport.deliveryDate}</Text>
                    </View>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${
                    transport.status === 'In Transit' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <Text className={`text-xs ${
                      transport.status === 'In Transit' ? 'text-blue-700' : 'text-green-700'
                    }`}>{transport.status}</Text>
                  </View>
                </View>
                <View className="bg-gray-200 h-2 rounded-full w-full overflow-hidden">
                  <View 
                    className={`h-full ${
                      transport.status === 'Delivered' ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${transport.progress}%` }}
                  />
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-xs text-gray-500">Pickup</Text>
                  <Text className="text-xs text-gray-500">In Transit</Text>
                  <Text className="text-xs text-gray-500">Destination</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).duration(500)}>
            <Text className="text-xl font-semibold text-gray-800 mt-6 mb-4">AI-Powered Insights</Text>
            
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
                  <Ionicons name="flash" size={20} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium mb-1">
                    Optimal Route Suggestion
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    For your next Delhi trip, take NH-44 instead of NH-9. You'll save approximately 45 minutes and ₹800 in fuel.
                  </Text>
                </View>
              </View>
            </View>
            
            <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
                  <Ionicons name="trending-up" size={20} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium mb-1">
                    Demand Forecast
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Expect 30% higher transportation demand for wheat in Punjab region next month due to harvest season.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-3 pb-8 flex-row justify-between border-t border-gray-200">
        <TouchableOpacity className="items-center">
          <Ionicons name="home" size={24} color="#d97706" />
          <Text className="text-amber-600 text-xs mt-1">Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Ionicons name="briefcase" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs mt-1">Jobs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Ionicons name="analytics" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs mt-1">Insights</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Ionicons name="wallet" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs mt-1">Earnings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 