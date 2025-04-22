import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import authService, { UserRole } from '../../services/auth';

// Intermediary type options that match backend enum
enum IntermediaryType {
  LOGISTICS = 'LOGISTICS',
  AGGREGATOR = 'AGGREGATOR',
  STORAGE = 'STORAGE',
  PROCESSOR = 'PROCESSOR'
}

export default function IntermediaryOnboarding() {
  // Personal information state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });

  // Business information state
  const [businessInfo, setBusinessInfo] = useState({
    type: IntermediaryType.LOGISTICS,
    serviceAreas: [''],
    licenseNumber: '',
    services: [''],
    capacity: {
      storage: '',
      transport: '',
      processing: ''
    }
  });

  // Intermediary types and services for form selection
  const intermediaryTypes = [
    { label: 'Logistics', value: IntermediaryType.LOGISTICS },
    { label: 'Aggregator', value: IntermediaryType.AGGREGATOR },
    { label: 'Storage', value: IntermediaryType.STORAGE },
    { label: 'Processor', value: IntermediaryType.PROCESSOR }
  ];

  const serviceOptions = {
    [IntermediaryType.LOGISTICS]: ['Transportation', 'Last-mile delivery', 'Cold Chain'],
    [IntermediaryType.AGGREGATOR]: ['Collection', 'Sorting', 'Grading', 'Packaging'],
    [IntermediaryType.STORAGE]: ['Warehouse', 'Cold Storage', 'Controlled Atmosphere'],
    [IntermediaryType.PROCESSOR]: ['Cleaning', 'Processing', 'Packaging', 'Value Addition']
  };

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // For multi-step form
  
  // Location state formatted to match backend requirements and farmer onboarding
  const [location, setLocation] = useState({
    lat: 0,
    lng: 0
  });

  // Set intermediary type
  const handleSelectType = (type: IntermediaryType) => {
    setBusinessInfo(prev => ({
      ...prev,
      type: type,
      // Reset services when type changes
      services: []
    }));
  };

  // Toggle service selection
  const toggleService = (service: string) => {
    setBusinessInfo(prev => {
      if (prev.services.includes(service)) {
        return {
          ...prev,
          services: prev.services.filter(s => s !== service)
        };
      } else {
        return {
          ...prev,
          services: [...prev.services, service]
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

  // Validate form data for current step
  const validateCurrentStep = (): boolean => {
    setError(null);

    if (step === 1) {
      // Validate personal information
      if (!personalInfo.name.trim()) {
        setError('Name is required');
        return false;
      }
      if (!personalInfo.email.trim()) {
        setError('Email is required');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!personalInfo.password) {
        setError('Password is required');
        return false;
      }
      if (personalInfo.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (personalInfo.password !== personalInfo.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!personalInfo.phone.trim()) {
        setError('Phone number is required');
        return false;
      }
      if (!personalInfo.address.trim()) {
        setError('Address is required');
        return false;
      }
    } else if (step === 2) {
      // Validate business information
      if (businessInfo.services.length === 0) {
        setError('Please select at least one service');
        return false;
      }
      if (!businessInfo.serviceAreas || businessInfo.serviceAreas.length === 0 || !businessInfo.serviceAreas[0]) {
        setError('Please enter at least one service area');
        return false;
      }
      if (location.lat === 0 && location.lng === 0) {
        setError('Please provide your location');
        return false;
      }
    }

    return true;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setStep(2);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    setStep(1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Prepare data for API
      const signupData = {
        email: personalInfo.email,
        password: personalInfo.password,
        name: personalInfo.name,
        role: UserRole.INTERMEDIARY,
        phone: personalInfo.phone,
        address: personalInfo.address,
        location: {
          latitude: location.lat,
          longitude: location.lng
        }, // Convert to format expected by SignupData interface
        profileData: {
          type: businessInfo.type,
          serviceAreas: businessInfo.serviceAreas.filter(area => area.trim() !== ''),
          capacity: {
            storage: businessInfo.capacity.storage,
            transport: businessInfo.capacity.transport,
            processing: businessInfo.capacity.processing
          },
          services: businessInfo.services,
          licenseNumber: businessInfo.licenseNumber
        }
      };
      
      // Call signup API
      await authService.signup(signupData);
      
      // Navigate to intermediary dashboard on success
      router.replace('/intermediary');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to update service areas
  const updateServiceAreas = (text: string) => {
    const areas = text.split(',').map(area => area.trim());
    setBusinessInfo(prev => ({
      ...prev,
      serviceAreas: areas
    }));
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
              className="w-10 h-10 rounded-full items-center justify-center bg-amber-100 mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#d97706" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-amber-800">
              Intermediary Registration
            </Text>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row justify-between mb-6">
            <View className="flex-row items-center">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= 1 ? 'bg-amber-600' : 'bg-gray-300'}`}>
                <Text className="text-white font-bold">1</Text>
              </View>
              <Text className={`ml-2 ${step >= 1 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>Account</Text>
            </View>
            <View className="flex-1 h-1 mx-2 bg-gray-200">
              <View className={`h-full ${step >= 2 ? 'bg-amber-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }} />
            </View>
            <View className="flex-row items-center">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= 2 ? 'bg-amber-600' : 'bg-gray-300'}`}>
                <Text className="text-white font-bold">2</Text>
              </View>
              <Text className={`ml-2 ${step >= 2 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>Business</Text>
            </View>
          </View>

          {/* Error message */}
          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}

          {/* Step 1: Personal Information */}
          {step === 1 && (
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
                    value={personalInfo.name}
                    onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, name: text }))}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2">Email Address</Text>
                  <TextInput
                    className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={personalInfo.email}
                    onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, email: text }))}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2">Password</Text>
                  <TextInput
                    className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                    placeholder="Create a password"
                    secureTextEntry
                    value={personalInfo.password}
                    onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, password: text }))}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2">Confirm Password</Text>
                  <TextInput
                    className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                    placeholder="Confirm your password"
                    secureTextEntry
                    value={personalInfo.confirmPassword}
                    onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, confirmPassword: text }))}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2">Phone Number</Text>
                  <TextInput
                    className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    value={personalInfo.phone}
                    onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, phone: text }))}
                  />
                </View>

                <View>
                  <Text className="text-gray-700 mb-2">Address</Text>
                  <TextInput
                    className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                    placeholder="Enter your address"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={personalInfo.address}
                    onChangeText={(text) => setPersonalInfo(prev => ({ ...prev, address: text }))}
                  />
                </View>
              </View>

              <TouchableOpacity
                className="bg-amber-600 py-4 rounded-xl items-center mb-8 shadow-sm"
                onPress={handleNextStep}
              >
                <Text className="text-white font-semibold text-lg">Next</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Step 2: Business Information */}
          {step === 2 && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-5">
                  Business Details
                </Text>

                <Text className="text-gray-700 mb-3 font-medium">Select Business Type</Text>
                <View className="flex-row flex-wrap mb-6">
                  {intermediaryTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      className={`mr-2 mb-2 py-3 px-4 rounded-xl ${
                        businessInfo.type === type.value
                          ? 'bg-amber-600'
                          : 'bg-gray-100 border border-gray-200'
                      }`}
                      onPress={() => handleSelectType(type.value)}
                    >
                      <Text
                        className={`text-center ${
                          businessInfo.type === type.value
                            ? 'text-white font-medium'
                            : 'text-gray-800'
                        }`}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text className="text-gray-700 mb-3 font-medium">Services Offered</Text>
                <View className="flex-row flex-wrap mb-6">
                  {serviceOptions[businessInfo.type].map((service) => (
                    <TouchableOpacity
                      key={service}
                      className={`mr-2 mb-2 py-2 px-4 rounded-lg ${
                        businessInfo.services.includes(service)
                          ? 'bg-amber-100 border-amber-500 border'
                          : 'bg-gray-50 border-gray-300 border'
                      }`}
                      onPress={() => toggleService(service)}
                    >
                      <Text
                        className={`${
                          businessInfo.services.includes(service)
                            ? 'text-amber-800'
                            : 'text-gray-700'
                        }`}
                      >
                        {service}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2">Business Location</Text>
                  <TouchableOpacity
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
                    onPress={getLocation}
                    disabled={isLocationLoading}
                  >
                    {isLocationLoading ? (
                      <ActivityIndicator size="small" color="#d97706" />
                    ) : (
                      <>
                        <Text className="text-gray-800">
                          {location.lat !== 0
                            ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`
                            : 'Get current location'}
                        </Text>
                        <Ionicons name="location-outline" size={22} color="#d97706" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2">
                    Service Areas (Separate with commas)
                  </Text>
                  <TextInput
                    className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                    placeholder="e.g. Delhi, Mumbai, Bangalore"
                    value={businessInfo.serviceAreas.join(', ')}
                    onChangeText={updateServiceAreas}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2">License Number (Optional)</Text>
                  <TextInput
                    className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                    placeholder="Enter business license number"
                    value={businessInfo.licenseNumber}
                    onChangeText={(text) => setBusinessInfo(prev => ({ ...prev, licenseNumber: text }))}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 mb-2 font-medium">Capacity Details</Text>
                  
                  {businessInfo.type === IntermediaryType.STORAGE && (
                    <View className="mb-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <Text className="text-gray-700 mb-2">Storage Capacity (tons)</Text>
                      <TextInput
                        className="bg-white p-3 rounded-lg text-gray-800 border border-gray-200"
                        placeholder="e.g. 500"
                        keyboardType="numeric"
                        value={businessInfo.capacity.storage}
                        onChangeText={(text) => setBusinessInfo(prev => ({
                          ...prev,
                          capacity: { ...prev.capacity, storage: text }
                        }))}
                      />
                    </View>
                  )}
                  
                  {businessInfo.type === IntermediaryType.LOGISTICS && (
                    <View className="mb-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <Text className="text-gray-700 mb-2">Transport Capacity (tons)</Text>
                      <TextInput
                        className="bg-white p-3 rounded-lg text-gray-800 border border-gray-200"
                        placeholder="e.g. 20"
                        keyboardType="numeric"
                        value={businessInfo.capacity.transport}
                        onChangeText={(text) => setBusinessInfo(prev => ({
                          ...prev,
                          capacity: { ...prev.capacity, transport: text }
                        }))}
                      />
                    </View>
                  )}
                  
                  {businessInfo.type === IntermediaryType.PROCESSOR && (
                    <View className="mb-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <Text className="text-gray-700 mb-2">Processing Capacity (tons/day)</Text>
                      <TextInput
                        className="bg-white p-3 rounded-lg text-gray-800 border border-gray-200"
                        placeholder="e.g. 10"
                        keyboardType="numeric"
                        value={businessInfo.capacity.processing}
                        onChangeText={(text) => setBusinessInfo(prev => ({
                          ...prev,
                          capacity: { ...prev.capacity, processing: text }
                        }))}
                      />
                    </View>
                  )}

                  {businessInfo.type === IntermediaryType.AGGREGATOR && (
                    <View className="mb-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <Text className="text-gray-700 mb-2">Collection Capacity (tons/week)</Text>
                      <TextInput
                        className="bg-white p-3 rounded-lg text-gray-800 border border-gray-200"
                        placeholder="e.g. 50"
                        keyboardType="numeric"
                        value={businessInfo.capacity.storage}
                        onChangeText={(text) => setBusinessInfo(prev => ({
                          ...prev,
                          capacity: { ...prev.capacity, storage: text }
                        }))}
                      />
                    </View>
                  )}
                </View>
              </View>

              <View className="flex-row mb-8">
                <TouchableOpacity
                  className="bg-gray-200 py-4 rounded-xl items-center flex-1 mr-2 shadow-sm"
                  onPress={handlePreviousStep}
                >
                  <Text className="text-gray-700 font-semibold">Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`py-4 rounded-xl items-center flex-1 ml-2 shadow-sm ${
                    isLoading ? 'bg-amber-400' : 'bg-amber-600'
                  }`}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold">Register</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          <Animated.View 
            entering={FadeInDown.delay(400).duration(500)}
            className="bg-white rounded-xl p-6 shadow-sm mb-8"
          >
            <View className="flex-row items-start mb-4">
              <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={24} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium mb-1">
                  Verified Business
                </Text>
                <Text className="text-gray-600">
                  Your business details will be verified to ensure platform reliability and build trust with farmers and consumers.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mr-3">
                <Ionicons name="lock-closed" size={24} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium mb-1">
                  Data Protection
                </Text>
                <Text className="text-gray-600">
                  Your information is securely stored and shared only with relevant stakeholders for business purposes.
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 