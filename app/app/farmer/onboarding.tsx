import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import authService, { UserRole } from '../../services/auth';

const cropTypes = [
  'Rice', 'Wheat', 'Corn', 'Potatoes', 
  'Tomatoes', 'Onions', 'Soybeans', 'Cotton'
];

export default function FarmerOnboarding() {
  // Main form data state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
    location: {
      latitude: 0,
      longitude: 0
    },
    farmSize: '',
    selectedCrops: [] as string[],
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // For multi-step form
  
  // Handle crop selection
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

      const location = await Location.getCurrentPositionAsync({});
      setFormData(prev => ({
        ...prev,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    // Clear previous errors
    setError(null);
    
    // Email validation
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password validation
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Basic info validation
    if (!formData.name) {
      setError('Full name is required');
      return false;
    }
    if (!formData.phone) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.address) {
      setError('Address is required');
      return false;
    }
    
    // Farm info validation
    if (!formData.farmSize || parseFloat(formData.farmSize) <= 0) {
      setError('Please enter a valid farm size');
      return false;
    }
    if (formData.selectedCrops.length === 0) {
      setError('Please select at least one crop type');
      return false;
    }
    if (formData.location.latitude === 0 && formData.location.longitude === 0) {
      setError('Please provide your farm location');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form inputs
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Prepare signup data
      const signupData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'FARMER' as 'FARMER' | 'INTERMEDIARY' | 'CONSUMER',
        phone: formData.phone,
        address: formData.address,
        location: formData.location,
        profileData: {
          farmSize: parseFloat(formData.farmSize),
          farmLocation: formData.address,
          farmCoordinates: formData.location,
          cropTypes: formData.selectedCrops,
          certifications: [], // Can add this feature later
          bankDetails: {} // Can add this feature later
        }
      };
      
      // Call signup API
      await authService.signup(signupData);
      
      // Navigate to dashboard on success
      router.replace('/farmer');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Next step handler
  const handleNextStep = () => {
    if (step === 1) {
      // Validate first step fields
      if (!formData.email || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword) {
        setError('Please complete all fields correctly');
        return;
      }
      setError(null);
      setStep(2);
    }
  };

  // Previous step handler
  const handlePreviousStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F8FAF5]"
    >
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

          {/* Progress Indicator */}
          <View className="flex-row justify-between mb-6">
            <View className="flex-row items-center">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}>
                <Text className="text-white font-bold">1</Text>
              </View>
              <Text className={`ml-2 ${step >= 1 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>Account</Text>
            </View>
            <View className="flex-1 h-1 mx-2 bg-gray-200">
              <View className={`h-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }} />
            </View>
            <View className="flex-row items-center">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}>
                <Text className="text-white font-bold">2</Text>
              </View>
              <Text className={`ml-2 ${step >= 2 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>Farm Details</Text>
            </View>
          </View>

          {/* Error message */}
          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}

          {step === 1 && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-5">
                  Account Information
                </Text>

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

                <TouchableOpacity
                  className="bg-green-600 py-3 rounded-lg items-center justify-center mt-4"
                  onPress={handleNextStep}
                >
                  <Text className="text-white font-semibold text-lg">Next</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {step === 2 && (
            <>
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
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 mb-2">Phone Number</Text>
                    <TextInput
                      className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 mb-2">Address</Text>
                    <TextInput
                      className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                      placeholder="Enter your address"
                      value={formData.address}
                      onChangeText={(text) => setFormData({ ...formData, address: text })}
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 mb-2">Farm Location</Text>
                    <View className="flex-row">
                      <TextInput
                        className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200 flex-1 mr-2"
                        placeholder="Use current location"
                        editable={false}
                        value={
                          formData.location.latitude !== 0 && formData.location.longitude !== 0
                            ? `Lat: ${formData.location.latitude.toFixed(4)}, Lng: ${formData.location.longitude.toFixed(4)}`
                            : ''
                        }
                      />
                      <TouchableOpacity
                        onPress={getLocation}
                        className="bg-green-100 rounded-lg px-3 items-center justify-center"
                        disabled={isLocationLoading}
                      >
                        {isLocationLoading ? (
                          <ActivityIndicator size="small" color="#16a34a" />
                        ) : (
                          <Ionicons name="location" size={24} color="#16a34a" />
                        )}
                      </TouchableOpacity>
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">
                      * Click the location icon to use your current location
                    </Text>
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

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="bg-gray-200 py-3 rounded-lg items-center justify-center mb-4 w-[48%]"
                  onPress={handlePreviousStep}
                >
                  <Text className="text-gray-800 font-semibold text-lg">Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-green-600 py-3 rounded-lg items-center justify-center mb-4 w-[48%]"
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-lg">Register</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 