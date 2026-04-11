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
  Platform,
  Switch,
  Image
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import * as productsService from '../../services/products';

const CATEGORIES = ['GRAINS', 'VEGETABLES', 'FRUITS', 'DAIRY', 'MEAT', 'POULTRY', 'OTHER'];

type UnitType = 'kg' | 'ton' | 'liter' | 'piece' | 'box';
const UNITS: UnitType[] = ['kg', 'ton', 'liter', 'piece', 'box'];

export default function ListProductScreen() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'VEGETABLES', // Default category
    quantity: '',
    unit: 'kg' as UnitType, // Default unit
    basePrice: '',
    harvestDate: new Date(),
    availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days from now
    organicCertified: false
  });

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [showHarvestDatePicker, setShowHarvestDatePicker] = useState(false);
  const [showAvailableDatePicker, setShowAvailableDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Handle image picking
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Validate form fields
      if (!formData.name.trim()) {
        setError('Product name is required');
        return;
      }
      if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
        setError('Valid quantity is required');
        return;
      }
      if (!formData.basePrice || isNaN(Number(formData.basePrice)) || Number(formData.basePrice) <= 0) {
        setError('Valid price is required');
        return;
      }
      if (!location) {
        setError('Product location is required');
        return;
      }

      // Format data for API
      const productData: productsService.CreateProductDTO = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        basePrice: Number(formData.basePrice),
        images: images, // In a real app, you would upload images to storage and use the URLs
        harvestDate: formData.harvestDate.toISOString(),
        availableUntil: formData.availableUntil.toISOString(),
        location: location,
        organicCertified: formData.organicCertified
      };

      // Call API to create product
      const response = await productsService.createProduct(productData);
      
      // Show success message
      Alert.alert(
        'Success',
        'Your product has been listed successfully',
        [{ text: 'OK', onPress: () => router.push('/farmer') }]
      );
      
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error instanceof Error ? error.message : 'Failed to list product. Please try again.');
    } finally {
      setIsLoading(false);
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
          {/* Header */}
          <View className="flex-row items-center mt-16 mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center bg-green-100 mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#16a34a" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-green-800">
              List New Product
            </Text>
          </View>

          {/* Error message */}
          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}

          {/* Basic Information */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Product Information
              </Text>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Product Name*</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Description</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter product description"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Category*</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      className={`mr-2 py-3 px-4 rounded-xl ${
                        formData.category === category
                          ? 'bg-green-600'
                          : 'bg-gray-100 border border-gray-200'
                      }`}
                      onPress={() => setFormData(prev => ({ ...prev, category }))}
                    >
                      <Text
                        className={`${
                          formData.category === category
                            ? 'text-white font-medium'
                            : 'text-gray-800'
                        }`}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-700 mb-2">Quantity*</Text>
                  <TextInput
                    className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={formData.quantity}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
                  />
                </View>

                <View className="flex-1 ml-2">
                  <Text className="text-gray-700 mb-2">Unit*</Text>
                  <View className="flex-row flex-wrap">
                    {UNITS.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        className={`mr-2 mb-2 py-2 px-3 rounded-lg ${
                          formData.unit === unit
                            ? 'bg-green-100 border-green-500 border'
                            : 'bg-gray-50 border-gray-300 border'
                        }`}
                        onPress={() => setFormData(prev => ({ ...prev, unit }))}
                      >
                        <Text
                          className={`${
                            formData.unit === unit
                              ? 'text-green-800'
                              : 'text-gray-700'
                          }`}
                        >
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Price per {formData.unit}*</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter price"
                  keyboardType="numeric"
                  value={formData.basePrice}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, basePrice: text }))}
                />
              </View>
            </View>
          </Animated.View>

          {/* Additional Details */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Additional Details
              </Text>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Harvest Date</Text>
                <TouchableOpacity
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
                  onPress={() => setShowHarvestDatePicker(true)}
                >
                  <Text className="text-gray-800">
                    {formData.harvestDate.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={22} color="#16a34a" />
                </TouchableOpacity>
                {showHarvestDatePicker && (
                  <DateTimePicker
                    value={formData.harvestDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowHarvestDatePicker(false);
                      if (selectedDate) {
                        setFormData(prev => ({ ...prev, harvestDate: selectedDate }));
                      }
                    }}
                  />
                )}
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Available Until</Text>
                <TouchableOpacity
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
                  onPress={() => setShowAvailableDatePicker(true)}
                >
                  <Text className="text-gray-800">
                    {formData.availableUntil.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={22} color="#16a34a" />
                </TouchableOpacity>
                {showAvailableDatePicker && (
                  <DateTimePicker
                    value={formData.availableUntil}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowAvailableDatePicker(false);
                      if (selectedDate) {
                        setFormData(prev => ({ ...prev, availableUntil: selectedDate }));
                      }
                    }}
                  />
                )}
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Product Location*</Text>
                <TouchableOpacity
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
                  onPress={getLocation}
                  disabled={isLocationLoading}
                >
                  {isLocationLoading ? (
                    <ActivityIndicator size="small" color="#16a34a" />
                  ) : (
                    <>
                      <Text className="text-gray-800">
                        {location
                          ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`
                          : 'Set product location'}
                      </Text>
                      <Ionicons name="location-outline" size={22} color="#16a34a" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-700">Organic Certified</Text>
                <Switch
                  trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }}
                  thumbColor={formData.organicCertified ? '#16a34a' : '#f4f4f5'}
                  ios_backgroundColor="#cbd5e1"
                  onValueChange={() =>
                    setFormData(prev => ({
                      ...prev,
                      organicCertified: !prev.organicCertified,
                    }))
                  }
                  value={formData.organicCertified}
                />
              </View>
            </View>
          </Animated.View>

          {/* Product Images */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Product Images
              </Text>

              <View className="flex-row flex-wrap mb-4">
                {images.map((uri, index) => (
                  <View key={index} className="w-24 h-24 m-1 relative">
                    <Image
                      source={{ uri }}
                      className="w-full h-full rounded-lg"
                    />
                    <TouchableOpacity
                      className="absolute top-1 right-1 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                      onPress={() => setImages(images.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                <TouchableOpacity
                  className="w-24 h-24 m-1 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
                  onPress={pickImage}
                >
                  <Ionicons name="add" size={24} color="#16a34a" />
                  <Text className="text-gray-500 text-xs mt-1">Add Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`bg-green-600 py-4 rounded-xl items-center mb-8 ${isLoading ? 'opacity-70' : ''}`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-medium">List Product</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 