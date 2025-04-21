import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import traceabilityService from '../../services/traceability';
import produceService from '../../services/produce';

export default function RegisterExistingProductPage() {
  // State for produce list (existing products that can be registered for traceability)
  const [produces, setProduces] = useState<any[]>([]);
  const [filteredProduces, setFilteredProduces] = useState<any[]>([]);
  const [isLoadingProduces, setIsLoadingProduces] = useState(true);
  const [selectedProduceId, setSelectedProduceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    batchNumber: '',
    quantity: '',
    unit: 'kg',
    productionDate: new Date(),
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    origin: {
      latitude: 0,
      longitude: 0,
      name: ''
    },
    certifications: [] as string[],
    attachments: [] as string[]
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProductionPicker, setShowProductionPicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch the farmer's existing produce
  useEffect(() => {
    const fetchProduces = async () => {
      try {
        setIsLoadingProduces(true);
        const response = await produceService.getMyProduce();
        
        // Extract produce data from the response
        // Check for both possible response formats
        let produceList: any[] = [];
        
        if (response.data && response.data.produce) {
          produceList = response.data.produce;
        } else if (Array.isArray(response)) {
          produceList = response;
        } else if (response.produce && Array.isArray(response.produce)) {
          produceList = response.produce;
        }
        
        // Filter out products that might already be registered for traceability
        setProduces(produceList);
        setFilteredProduces(produceList);
      } catch (error) {
        console.error('Error fetching produces:', error);
        Alert.alert('Error', 'Failed to load your products. Please try again later.');
        // Set empty arrays to avoid undefined errors
        setProduces([]);
        setFilteredProduces([]);
      } finally {
        setIsLoadingProduces(false);
      }
    };

    fetchProduces();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProduces(produces);
    } else {
      const filtered = produces.filter(produce => 
        produce.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProduces(filtered);
    }
  }, [searchQuery, produces]);

  // Handle selecting an existing produce
  const handleSelectProduce = (produceId: string) => {
    setSelectedProduceId(produceId);
    
    // Find the selected produce to populate form fields
    const selected = produces.find(p => p.id === produceId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        name: selected.name,
        quantity: String(selected.quantity),
        unit: selected.unit,
        origin: {
          ...prev.origin,
          latitude: selected.location?.lat || 0,
          longitude: selected.location?.lng || 0,
          name: selected.location?.name || ''
        },
        certifications: selected.certifications || []
      }));
    }
  };

  // Get current location
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
      
      // Placeholder for location name
      const locationName = 'Current Location';
      
      setFormData(prev => ({
        ...prev,
        origin: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          name: locationName
        }
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Handle date changes
  const onProductionDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.productionDate;
    setShowProductionPicker(Platform.OS === 'ios');
    setFormData(prev => ({ ...prev, productionDate: currentDate }));
  };

  const onExpiryDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.expiryDate;
    setShowExpiryPicker(Platform.OS === 'ios');
    setFormData(prev => ({ ...prev, expiryDate: currentDate }));
  };

  // Validate form
  const validateForm = (): boolean => {
    setError(null);

    if (!selectedProduceId) {
      setError('Please select a product');
      return false;
    }

    if (!formData.batchNumber.trim()) {
      setError('Please enter a batch number');
      return false;
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('Please enter a valid quantity');
      return false;
    }

    if (formData.origin.latitude === 0 && formData.origin.longitude === 0) {
      setError('Please provide product origin location');
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for API
      const registrationData = {
        name: formData.name,
        produceId: selectedProduceId || undefined,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        batchNumber: formData.batchNumber,
        productionDate: formData.productionDate.toISOString(),
        expiryDate: formData.expiryDate.toISOString(),
        origin: formData.origin,
        certifications: formData.certifications,
        attachments: formData.attachments
      };

      // Register the product for traceability
      await traceabilityService.registerTraceableProduct(registrationData);
      
      Alert.alert(
        'Success',
        'Your product has been registered for traceability',
        [{ text: 'OK', onPress: () => router.push('/farmer') }]
      );
    } catch (error) {
      console.error('Error during product registration:', error);
      setError(error instanceof Error ? error.message : 'Failed to register product. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render product item
  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className={`bg-white p-4 rounded-lg border mb-2 ${
        selectedProduceId === item.id ? 'border-green-600' : 'border-gray-200'
      }`}
      onPress={() => handleSelectProduce(item.id)}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          {item.images && item.images[0] ? (
            <Image
              source={{ uri: item.images[0] }}
              className="w-12 h-12 rounded-md mr-3"
              resizeMode="cover"
            />
          ) : (
            <View className="w-12 h-12 rounded-md bg-gray-200 items-center justify-center mr-3">
              <Ionicons name="leaf-outline" size={20} color="#4b5563" />
            </View>
          )}
          <View className="flex-1">
            <Text className="font-medium text-gray-800">{item.name}</Text>
            <Text className="text-gray-500 text-sm">
              {`${item.quantity} ${item.unit} • ${item.category || 'No category'}`}
            </Text>
          </View>
        </View>
        {selectedProduceId === item.id && (
          <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
        )}
      </View>
    </TouchableOpacity>
  );

  // First step - Select a product
  const renderStep1 = () => (
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Select a Product to Register
        </Text>

        {/* Search bar */}
        <View className="bg-gray-50 rounded-lg px-3 py-2 mb-4 flex-row items-center border border-gray-200">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search your products"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {isLoadingProduces ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#16a34a" />
            <Text className="text-gray-500 mt-2">Loading your products...</Text>
          </View>
        ) : filteredProduces.length > 0 ? (
          <FlatList
            data={filteredProduces}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            className="max-h-96"
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="bg-gray-50 p-6 rounded-lg items-center">
            <Ionicons name="leaf" size={40} color="#9ca3af" />
            <Text className="text-gray-500 mt-2 mb-1 text-center">No products available</Text>
            <Text className="text-gray-400 text-sm text-center mb-4">
              You need to add products before you can register them for traceability
            </Text>
            <TouchableOpacity 
              className="bg-green-600 px-4 py-2 rounded-lg"
              onPress={() => router.push('/farmer/add-produce')}
            >
              <Text className="text-white font-medium">Add a Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {selectedProduceId && (
        <TouchableOpacity
          className="bg-green-600 py-4 rounded-lg items-center justify-center mb-4"
          onPress={() => setCurrentStep(2)}
        >
          <Text className="text-white font-semibold text-lg">
            Continue
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  // Second step - Add traceability details
  const renderStep2 = () => (
    <>
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-5">
            Traceability Information
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Batch Number / Lot ID</Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
              placeholder="Enter batch number"
              value={formData.batchNumber}
              onChangeText={(text) => setFormData({ ...formData, batchNumber: text })}
            />
          </View>

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 mb-2">Quantity</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                placeholder="Enter quantity"
                keyboardType="numeric"
                value={formData.quantity}
                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
              />
            </View>
            <View className="w-1/3">
              <Text className="text-gray-700 mb-2">Unit</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                value={formData.unit}
                onChangeText={(text) => setFormData({ ...formData, unit: text })}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Production Date</Text>
            <TouchableOpacity
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
              onPress={() => setShowProductionPicker(true)}
            >
              <Text className="text-gray-800">
                {formData.productionDate.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#4b5563" />
            </TouchableOpacity>
            {showProductionPicker && (
              <DateTimePicker
                value={formData.productionDate}
                mode="date"
                display="default"
                onChange={onProductionDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Expiry Date</Text>
            <TouchableOpacity
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
              onPress={() => setShowExpiryPicker(true)}
            >
              <Text className="text-gray-800">
                {formData.expiryDate.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#4b5563" />
            </TouchableOpacity>
            {showExpiryPicker && (
              <DateTimePicker
                value={formData.expiryDate}
                mode="date"
                display="default"
                onChange={onExpiryDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-5">
            Origin Information
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Origin Name</Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
              placeholder="Enter location name (e.g., Farm name)"
              value={formData.origin.name}
              onChangeText={(text) => setFormData({
                ...formData,
                origin: { ...formData.origin, name: text }
              })}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Origin Location</Text>
            <View className="flex-row">
              <TextInput
                className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200 flex-1 mr-2"
                placeholder="Use current location"
                editable={false}
                value={
                  formData.origin.latitude !== 0 && formData.origin.longitude !== 0
                    ? `Lat: ${formData.origin.latitude.toFixed(4)}, Lng: ${formData.origin.longitude.toFixed(4)}`
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
              * This location will be used to track the product's journey
            </Text>
          </View>
        </View>
      </Animated.View>

      <View className="flex-row mb-6">
        <TouchableOpacity
          className="bg-gray-200 py-4 rounded-lg items-center justify-center flex-1 mr-2"
          onPress={() => setCurrentStep(1)}
        >
          <Text className="text-gray-800 font-semibold">
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`py-4 rounded-lg items-center justify-center flex-1 ml-2 ${
            isLoading ? 'bg-gray-400' : 'bg-green-600'
          }`}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">
              Register Product
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

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
              Register Existing Product
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}

          {currentStep === 1 ? renderStep1() : renderStep2()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 