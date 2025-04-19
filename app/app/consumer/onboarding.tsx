import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type ConsumerType = 'individual' | 'retailer' | 'bulk_buyer';

export default function ConsumerOnboarding() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    location: '',
    consumerType: 'individual' as ConsumerType,
    organicPreference: false,
    localPreference: true,
  });

  const handleSelectConsumerType = (type: ConsumerType) => {
    setFormData({ ...formData, consumerType: type });
  };

  const handleSubmit = () => {
    // Here we would typically validate and submit the data to an API
    console.log('Submitting consumer form data:', formData);
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
              className="w-10 h-10 rounded-full items-center justify-center bg-blue-100 mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#2563eb" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-blue-800">
              Consumer Registration
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
                <Text className="text-gray-700 mb-2">Email Address</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>

              <View>
                <Text className="text-gray-700 mb-2">Location</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Consumer Type
              </Text>

              <View className="flex-row mb-4">
                <TouchableOpacity
                  className={`flex-1 p-4 rounded-lg mr-2 ${
                    formData.consumerType === 'individual'
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                  onPress={() => handleSelectConsumerType('individual')}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.consumerType === 'individual'
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    Individual
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 p-4 rounded-lg mr-2 ${
                    formData.consumerType === 'retailer'
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                  onPress={() => handleSelectConsumerType('retailer')}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.consumerType === 'retailer'
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    Retailer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 p-4 rounded-lg ${
                    formData.consumerType === 'bulk_buyer'
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                  onPress={() => handleSelectConsumerType('bulk_buyer')}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.consumerType === 'bulk_buyer'
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    Bulk Buyer
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-lg font-semibold text-gray-800 mb-4 mt-2">
                Preferences
              </Text>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-700">Prefer Organic Products</Text>
                <Switch
                  trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                  thumbColor={formData.organicPreference ? '#2563eb' : '#f4f4f5'}
                  ios_backgroundColor="#cbd5e1"
                  onValueChange={() =>
                    setFormData({
                      ...formData,
                      organicPreference: !formData.organicPreference,
                    })
                  }
                  value={formData.organicPreference}
                />
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Prefer Local Produce</Text>
                <Switch
                  trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                  thumbColor={formData.localPreference ? '#2563eb' : '#f4f4f5'}
                  ios_backgroundColor="#cbd5e1"
                  onValueChange={() =>
                    setFormData({
                      ...formData,
                      localPreference: !formData.localPreference,
                    })
                  }
                  value={formData.localPreference}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-8 shadow-sm">
              <View className="flex-row items-start mb-4">
                <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark" size={20} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium mb-1">
                    Transparent Supply Chain
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    See where your food comes from and how much of your money goes to each stakeholder.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                  <Ionicons name="leaf" size={20} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium mb-1">
                    Quality Assurance
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    All products on our platform follow quality standards and verification processes.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Button
            className="bg-blue-600 h-14 rounded-xl"
            onPress={handleSubmit}
          >
            <Text className="text-white text-lg font-medium">Complete Registration</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
} 