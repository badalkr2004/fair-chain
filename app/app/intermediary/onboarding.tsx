import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type IntermediaryType = 'logistics' | 'storage' | 'processor' | 'aggregator';

export default function IntermediaryOnboarding() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    phoneNumber: '',
    email: '',
    location: '',
    businessType: 'logistics' as IntermediaryType,
    licenseNumber: '',
    experienceYears: '',
    servicePinCodes: '',
  });

  const handleSelectType = (type: IntermediaryType) => {
    setFormData({ ...formData, businessType: type });
  };

  const handleSubmit = () => {
    // Here we would typically validate and submit the data to an API
    console.log('Submitting intermediary form data:', formData);
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
              className="w-10 h-10 rounded-full items-center justify-center bg-amber-100 mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#d97706" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-amber-800">
              Intermediary Registration
            </Text>
          </View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Business Information
              </Text>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Business Name</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter your business name"
                  value={formData.businessName}
                  onChangeText={(text) => setFormData({ ...formData, businessName: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Contact Person Name</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter contact person's name"
                  value={formData.contactName}
                  onChangeText={(text) => setFormData({ ...formData, contactName: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Phone Number</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Email Address</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>

              <View>
                <Text className="text-gray-700 mb-2">Business Location</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter business location"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Business Type
              </Text>

              <View className="flex-row mb-4">
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg mr-2 ${
                    formData.businessType === 'logistics'
                      ? 'bg-amber-600'
                      : 'bg-gray-200'
                  }`}
                  onPress={() => handleSelectType('logistics')}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.businessType === 'logistics'
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    Logistics
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg mr-2 ${
                    formData.businessType === 'storage'
                      ? 'bg-amber-600'
                      : 'bg-gray-200'
                  }`}
                  onPress={() => handleSelectType('storage')}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.businessType === 'storage'
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    Storage
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row mb-5">
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg mr-2 ${
                    formData.businessType === 'processor'
                      ? 'bg-amber-600'
                      : 'bg-gray-200'
                  }`}
                  onPress={() => handleSelectType('processor')}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.businessType === 'processor'
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    Processor
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg ${
                    formData.businessType === 'aggregator'
                      ? 'bg-amber-600'
                      : 'bg-gray-200'
                  }`}
                  onPress={() => handleSelectType('aggregator')}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.businessType === 'aggregator'
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    Aggregator
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">License Number (Optional)</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter business license number"
                  value={formData.licenseNumber}
                  onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Years of Experience</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter years of experience"
                  keyboardType="numeric"
                  value={formData.experienceYears}
                  onChangeText={(text) => setFormData({ ...formData, experienceYears: text })}
                />
              </View>

              <View>
                <Text className="text-gray-700 mb-2">Service Areas (PIN Codes)</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter PIN codes separated by commas"
                  value={formData.servicePinCodes}
                  onChangeText={(text) => setFormData({ ...formData, servicePinCodes: text })}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-8 shadow-sm">
              <View className="flex-row items-start mb-4">
                <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark" size={20} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium mb-1">
                    Verified Business
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Your business details will be verified to ensure platform reliability and build trust with farmers and consumers.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
                  <Ionicons name="analytics" size={20} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium mb-1">
                    Transparent Revenue Model
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Our platform ensures fair profit distribution. Intermediaries receive their share transparently for the value they add.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Button
            className="bg-amber-600 h-14 rounded-xl"
            onPress={handleSubmit}
          >
            <Text className="text-white text-lg font-medium">Complete Registration</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
} 