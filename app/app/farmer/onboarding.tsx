import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const cropTypes = [
  'Rice', 'Wheat', 'Corn', 'Potatoes', 
  'Tomatoes', 'Onions', 'Soybeans', 'Cotton'
];

export default function FarmerOnboarding() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    location: '',
    farmSize: '',
    selectedCrops: [] as string[],
  });

  const toggleCrop = (crop: string) => {
    setFormData(prev => {
      if (prev.selectedCrops.includes(crop)) {
        return { 
          ...prev, 
          selectedCrops: prev.selectedCrops.filter(c => c !== crop) 
        };
      } else {
        return { 
          ...prev, 
          selectedCrops: [...prev.selectedCrops, crop] 
        };
      }
    });
  };

  const handleSubmit = () => {
    // Here we would typically validate and submit the data to an API
    console.log('Submitting form data:', formData);
    router.replace("./index");
  };

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
              Farmer Registration
            </Text>
          </View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Personal Information
              </Text>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Full Name</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Phone Number</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Location</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter your farm location"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>

              <View>
                <Text className="text-gray-700 mb-2">Farm Size (in acres)</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter farm size"
                  keyboardType="numeric"
                  value={formData.farmSize}
                  onChangeText={(text) => setFormData({ ...formData, farmSize: text })}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Crop Information
              </Text>

              <Text className="text-gray-700 mb-3">Select crops you grow:</Text>
              <View className="flex-row flex-wrap">
                {cropTypes.map((crop) => (
                  <TouchableOpacity
                    key={crop}
                    className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                      formData.selectedCrops.includes(crop)
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    }`}
                    onPress={() => toggleCrop(crop)}
                  >
                    <Text
                      className={`${
                        formData.selectedCrops.includes(crop)
                          ? 'text-white'
                          : 'text-gray-800'
                      }`}
                    >
                      {crop}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="mt-4">
                <Text className="text-gray-500 text-sm">
                  * You'll be able to add specific crop details and harvest times after registration.
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-8 shadow-sm">
              <View className="flex-row items-start mb-4">
                <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark" size={20} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium mb-1">
                    Privacy & Data Protection
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Your personal information is secure and will only be shared with verified platform members based on your preferences.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                  <Ionicons name="analytics" size={20} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium mb-1">
                    AI-Powered Insights
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    You'll receive market trends, price forecasts, and demand predictions for your crops.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Button
            className="bg-green-600 h-14 rounded-xl"
            onPress={handleSubmit}
          >
            <Text className="text-white text-lg font-medium">Complete Registration</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
} 