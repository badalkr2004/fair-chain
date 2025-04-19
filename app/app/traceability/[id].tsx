import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function TraceabilityDetails() {
  const { id } = useLocalSearchParams();
  
  return (
    <View className="flex-1 bg-[#F8FAF5]">
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6">
          <View className="flex-row items-center mt-16 mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center bg-green-100 mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#16a34a" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-green-800">
              Traceability Details
            </Text>
          </View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Traceability ID: {id}
              </Text>
              
              <Text className="text-gray-700 mb-4">
                This screen will show detailed traceability information for the selected crop.
                The complete supply chain journey from farm to consumer would be displayed here.
              </Text>
              
              <View className="flex-row items-center mb-4">
                <View className="h-1 w-8 bg-green-600 rounded-l-full" />
                <View className="h-1 w-8 bg-green-600" />
                <View className="h-1 w-8 bg-amber-600" />
                <View className="h-1 w-8 bg-blue-600 rounded-r-full" />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500">Farm</Text>
                <Text className="text-xs text-gray-500">Processing</Text>
                <Text className="text-xs text-gray-500">Distribution</Text>
                <Text className="text-xs text-gray-500">Consumer</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
} 