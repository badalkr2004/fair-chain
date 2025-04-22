import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import authService, { UserRole } from '../../services/auth';

type ConsumerType = 'END_USER' | 'RETAILER' | 'BULK_BUYER';

export default function ConsumerOnboarding() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    consumerType: 'END_USER' as ConsumerType,
    preferences: [] as string[],
  });

  // Location state with lat/lng format
  const [location, setLocation] = useState({
    lat: 0,
    lng: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectConsumerType = (type: ConsumerType) => {
    setFormData({ ...formData, consumerType: type });
  };

  // Get user's current location
  const getLocation = async () => {
    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please allow location access to continue');
        setIsLocationLoading(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: locationData.coords.latitude,
        lng: locationData.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const togglePreference = (preference: string) => {
    setFormData(prev => {
      const currentPreferences = [...prev.preferences];
      const index = currentPreferences.indexOf(preference);
      
      if (index > -1) {
        currentPreferences.splice(index, 1); // Remove if exists
      } else {
        currentPreferences.push(preference); // Add if doesn't exist
      }
      
      return { ...prev, preferences: currentPreferences };
    });
  };

  const validateForm = (): boolean => {
    setError(null);

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (location.lat === 0 && location.lng === 0) {
      setError('Please provide your location');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for API
      const signupData = {
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        role: UserRole.CONSUMER,
        phone: formData.phoneNumber,
        address: formData.address,
        location: {
          lat: location.lat,
          lng: location.lng
        },
        profileData: {
          type: formData.consumerType,
          preferences: formData.preferences
        }
      };
      
      // Call signup API
      await authService.signup(signupData);
      
      // Navigate to consumer dashboard on success
      router.replace('/consumer');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

          {/* Error message */}
          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}

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
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Password</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Create a password"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Confirm Password</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Confirm your password"
                  secureTextEntry
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Address</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter your address"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                />
              </View>

              <View className="mb-2">
                <Text className="text-gray-700 mb-2">Location</Text>
                <TouchableOpacity
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
                  onPress={getLocation}
                  disabled={isLocationLoading}
                >
                  {isLocationLoading ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                  ) : (
                    <>
                      <Text className="text-gray-800">
                        {location.lat !== 0
                          ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`
                          : 'Get current location'}
                      </Text>
                      <Ionicons name="location-outline" size={22} color="#2563eb" />
                    </>
                  )}
                </TouchableOpacity>
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
                    formData.consumerType === 'END_USER'
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                  onPress={() => handleSelectConsumerType('END_USER')}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.consumerType === 'END_USER'
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    Individual
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 p-4 rounded-lg mr-2 ${
                    formData.consumerType === 'RETAILER'
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                  onPress={() => handleSelectConsumerType('RETAILER')}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.consumerType === 'RETAILER'
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    Retailer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 p-4 rounded-lg ${
                    formData.consumerType === 'BULK_BUYER'
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                  onPress={() => handleSelectConsumerType('BULK_BUYER')}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.consumerType === 'BULK_BUYER'
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
                <TouchableOpacity
                  onPress={() => togglePreference('organic')}
                  className={`px-3 py-2 rounded-full ${
                    formData.preferences.includes('organic') 
                      ? 'bg-blue-100 border border-blue-300' 
                      : 'bg-gray-100 border border-gray-300'
                  }`}
                >
                  <Text className={`${
                    formData.preferences.includes('organic') 
                      ? 'text-blue-700' 
                      : 'text-gray-700'
                  }`}>
                    {formData.preferences.includes('organic') ? 'Selected' : 'Select'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-700">Prefer Local Produce</Text>
                <TouchableOpacity
                  onPress={() => togglePreference('local')}
                  className={`px-3 py-2 rounded-full ${
                    formData.preferences.includes('local') 
                      ? 'bg-blue-100 border border-blue-300' 
                      : 'bg-gray-100 border border-gray-300'
                  }`}
                >
                  <Text className={`${
                    formData.preferences.includes('local') 
                      ? 'text-blue-700' 
                      : 'text-gray-700'
                  }`}>
                    {formData.preferences.includes('local') ? 'Selected' : 'Select'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Prefer Seasonal Products</Text>
                <TouchableOpacity
                  onPress={() => togglePreference('seasonal')}
                  className={`px-3 py-2 rounded-full ${
                    formData.preferences.includes('seasonal') 
                      ? 'bg-blue-100 border border-blue-300' 
                      : 'bg-gray-100 border border-gray-300'
                  }`}
                >
                  <Text className={`${
                    formData.preferences.includes('seasonal') 
                      ? 'text-blue-700' 
                      : 'text-gray-700'
                  }`}>
                    {formData.preferences.includes('seasonal') ? 'Selected' : 'Select'}
                  </Text>
                </TouchableOpacity>
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

          <TouchableOpacity
            className={`bg-blue-600 py-4 rounded-xl items-center mb-8 ${isLoading ? 'opacity-70' : ''}`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-medium">Complete Registration</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
} 