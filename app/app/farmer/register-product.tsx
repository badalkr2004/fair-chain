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
  Switch
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import traceabilityService from '../../services/traceability';
import produceService from '../../services/produce';

export default function RegisterProductPage() {
  // State for produce list (products that can be registered for traceability)
  const [produces, setProduces] = useState<any[]>([]);
  const [isLoadingProduces, setIsLoadingProduces] = useState(true);
  const [selectedProduceId, setSelectedProduceId] = useState<string | null>(null);

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
    attachments: [] as string[],
    fromExistingProduce: false
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProductionPicker, setShowProductionPicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  // Fetch the farmer's existing produce
  useEffect(() => {
    const fetchProduces = async () => {
      try {
        const response = await produceService.getMyProduce();
        setProduces(response.products || []);
      } catch (error) {
        console.error('Error fetching produces:', error);
        Alert.alert('Error', 'Failed to load your products');
      } finally {
        setIsLoadingProduces(false);
      }
    };

    fetchProduces();
  }, []);

  // Toggle between create new or select existing produce
  const toggleFromExisting = () => {
    setFormData(prev => ({ 
      ...prev, 
      fromExistingProduce: !prev.fromExistingProduce 
    }));
    
    // Reset selection
    setSelectedProduceId(null);
  };

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
      
      // Get location name from coordinates (this would typically use a geocoding service)
      // For demo purposes, we'll use a placeholder
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

    if (!formData.name.trim()) {
      setError('Please enter a product name');
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
        produceId: formData.fromExistingProduce && selectedProduceId ? selectedProduceId : undefined,
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
      
      // Show success message and navigate back
      Alert.alert(
        'Success',
        'Your product has been registered for traceability',
        [{ text: 'OK', onPress: () => router.push('/farmer') }]
      );
    } catch (error) {
      console.error('Error registering product:', error);
      setError(error instanceof Error ? error.message : 'Failed to register product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render option for produce selection
  const renderProduceOption = (produce: any) => (
    <TouchableOpacity
      key={produce.id}
      className={`bg-white p-4 rounded-lg border mb-2 ${
        selectedProduceId === produce.id ? 'border-green-600' : 'border-gray-200'
      }`}
      onPress={() => handleSelectProduce(produce.id)}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="font-medium text-gray-800">{produce.name}</Text>
          <Text className="text-gray-500 text-sm">
            {`${produce.quantity} ${produce.unit} • ${produce.category}`}
          </Text>
        </View>
        {selectedProduceId === produce.id && (
          <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
        )}
      </View>
    </TouchableOpacity>
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
              Register for Traceability
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Product Source
              </Text>
              
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-700">Use existing product?</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#d1fae5" }}
                  thumbColor={formData.fromExistingProduce ? "#16a34a" : "#f4f3f4"}
                  onValueChange={toggleFromExisting}
                  value={formData.fromExistingProduce}
                />
              </View>

              {formData.fromExistingProduce ? (
                <>
                  <Text className="text-gray-700 mb-2">Select a product:</Text>
                  {isLoadingProduces ? (
                    <ActivityIndicator size="small" color="#16a34a" />
                  ) : produces.length > 0 ? (
                    produces.map(renderProduceOption)
                  ) : (
                    <View className="bg-gray-50 p-4 rounded-lg items-center">
                      <Text className="text-gray-500">No products available</Text>
                      <TouchableOpacity 
                        className="mt-2"
                        onPress={() => router.push('/farmer/add-produce')}
                      >
                        <Text className="text-green-600 font-medium">Add a product first</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <View className="mb-4">
                  <Text className="text-gray-700 mb-2">Product Name</Text>
                  <TextInput
                    className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>
              )}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
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
                    editable={!formData.fromExistingProduce || !selectedProduceId}
                  />
                </View>
                <View className="w-1/3">
                  <Text className="text-gray-700 mb-2">Unit</Text>
                  <TextInput
                    className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                    value={formData.unit}
                    onChangeText={(text) => setFormData({ ...formData, unit: text })}
                    editable={!formData.fromExistingProduce || !selectedProduceId}
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

          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
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
                  editable={!formData.fromExistingProduce || !selectedProduceId}
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
                    disabled={isLocationLoading || Boolean(formData.fromExistingProduce && selectedProduceId)}
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

          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-8 shadow-sm">
              <View className="flex-row items-start mb-4">
                <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark" size={20} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium mb-1">
                    Supply Chain Visibility
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Registering your product enables complete traceability through the supply chain, enhancing transparency and trust.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                  <Ionicons name="qr-code" size={20} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium mb-1">
                    QR Code Generation
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    A unique QR code will be generated for your product, enabling buyers to verify authenticity and track product journey.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <TouchableOpacity
            className={`py-4 rounded-lg items-center justify-center mb-4 ${
              isLoading || (formData.fromExistingProduce && !selectedProduceId) 
                ? 'bg-gray-400' 
                : 'bg-green-600'
            }`}
            onPress={() => {
              if (!isLoading && !(formData.fromExistingProduce && !selectedProduceId)) {
                handleSubmit();
              }
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                Register Product
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 