import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import produceService from '../../services/produce';

// Product categories
const categories = [
  'GRAINS',
  'VEGETABLES',
  'FRUITS',
  'DAIRY',
  'MEAT',
  'POULTRY',
  'OTHER'  // Changed from 'OTHERS' to match the schema
];

// Units
const units = [
  'kg',
  'g',
  'ton',
  'lb',
  'pieces',
  'dozen',
  'box'
];

// Certifications
const certificationOptions = [
  'Organic',
  'Non-GMO',
  'Fair Trade',
  'Rainforest Alliance',
  'Local',
  'Pesticide-Free'
];

export default function AddProducePage() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0],
    quantity: '',
    unit: units[0],
    basePrice: '',  // Changed from price to basePrice to match controller
    description: '',
    harvestDate: new Date(),
    availableUntil: new Date(new Date().setMonth(new Date().getMonth() + 3)),  // Changed from expiryDate to availableUntil
    organicCertified: false,  // Added to match controller
    certifications: [] as string[],
    images: [] as string[],
    location: {
      latitude: 0,
      longitude: 0
    }
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHarvestPicker, setShowHarvestPicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  // Toggle certifications
  const toggleCertification = (cert: string) => {
    if (cert === 'Organic') {
      // Toggle organicCertified flag for the main certification
      setFormData(prev => ({
        ...prev,
        organicCertified: !prev.organicCertified
      }));
    }
    
    setFormData(prev => {
      if (prev.certifications.includes(cert)) {
        return {
          ...prev,
          certifications: prev.certifications.filter(c => c !== cert)
        };
      } else {
        return {
          ...prev,
          certifications: [...prev.certifications, cert]
        };
      }
    });
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

  // Pick images
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Here you would typically upload the image to your server and get a URL
        // For now, we'll just use the local URI as a placeholder
        const imageUri = result.assets[0].uri;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageUri]
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Handle date changes
  const onHarvestDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.harvestDate;
    setShowHarvestPicker(Platform.OS === 'ios');
    setFormData(prev => ({ ...prev, harvestDate: currentDate }));
  };

  const onExpiryDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.availableUntil;
    setShowExpiryPicker(Platform.OS === 'ios');
    setFormData(prev => ({ ...prev, availableUntil: currentDate }));
  };

  // Validate form
  const validateForm = (): boolean => {
    setError(null);

    if (!formData.name.trim()) {
      setError('Please enter a product name');
      return false;
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('Please enter a valid quantity');
      return false;
    }

    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      setError('Please enter a valid price');
      return false;
    }

    if (formData.location.latitude === 0 && formData.location.longitude === 0) {
      setError('Please provide your product location');
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
      // Prepare data for API according to service interface
      const produceData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        price: parseFloat(formData.basePrice),
        harvestDate: formData.harvestDate.toISOString(),
        expiryDate: formData.availableUntil.toISOString(),
        certifications: formData.certifications,
        images: formData.images,
        location: {
          latitude: formData.location.latitude,
          longitude: formData.location.longitude
        }
      };

      // Call API
      await produceService.addProduce(produceData);
      Alert.alert(
        'Success',
        'Your product has been added successfully',
        [{ text: 'OK', onPress: () => router.push('/farmer') }]
      );
    } catch (error) {
      console.error('Error adding produce:', error);
      setError(error instanceof Error ? error.message : 'Failed to add product. Please try again.');
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
          <View className="flex-row items-center mt-16 mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center bg-green-100 mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#16a34a" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-green-800">
              Add New Product
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Basic Information
              </Text>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Product Name</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Category</Text>
                <View className="bg-gray-50 rounded-lg border border-gray-200">
                  <Picker
                    selectedValue={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    style={{ height: 50 }}
                  >
                    {categories.map((category) => (
                      <Picker.Item key={category} label={category} value={category} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Description</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Describe your product"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Quantity & Pricing
              </Text>

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
                  <View className="bg-gray-50 rounded-lg border border-gray-200">
                    <Picker
                      selectedValue={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                      style={{ height: 50 }}
                    >
                      {units.map((unit) => (
                        <Picker.Item key={unit} label={unit} value={unit} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Price per {formData.unit} (₹)</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Enter price"
                  keyboardType="numeric"
                  value={formData.basePrice}
                  onChangeText={(text) => setFormData({ ...formData, basePrice: text })}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Dates & Location
              </Text>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Harvest Date</Text>
                <TouchableOpacity
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
                  onPress={() => setShowHarvestPicker(true)}
                >
                  <Text className="text-gray-800">
                    {formData.harvestDate.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#4b5563" />
                </TouchableOpacity>
                {showHarvestPicker && (
                  <DateTimePicker
                    value={formData.harvestDate}
                    mode="date"
                    display="default"
                    onChange={onHarvestDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Available Until</Text>
                <TouchableOpacity
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
                  onPress={() => setShowExpiryPicker(true)}
                >
                  <Text className="text-gray-800">
                    {formData.availableUntil.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#4b5563" />
                </TouchableOpacity>
                {showExpiryPicker && (
                  <DateTimePicker
                    value={formData.availableUntil}
                    mode="date"
                    display="default"
                    onChange={onExpiryDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Product Location</Text>
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
                        {formData.location.latitude !== 0
                          ? `Lat: ${formData.location.latitude.toFixed(4)}, Lng: ${formData.location.longitude.toFixed(4)}`
                          : 'Get current location'}
                      </Text>
                      <Ionicons name="location-outline" size={20} color="#4b5563" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Certifications
              </Text>

              <View className="flex-row flex-wrap">
                {certificationOptions.map((cert) => (
                  <TouchableOpacity
                    key={cert}
                    className={`mr-2 mb-2 py-2 px-4 rounded-full border ${
                      cert === 'Organic' && formData.organicCertified || 
                      formData.certifications.includes(cert)
                        ? 'bg-green-100 border-green-500'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    onPress={() => toggleCertification(cert)}
                  >
                    <Text
                      className={`${
                        cert === 'Organic' && formData.organicCertified || 
                        formData.certifications.includes(cert)
                          ? 'text-green-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {cert}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Product Images
              </Text>

              <View className="flex-row flex-wrap">
                {formData.images.map((image, index) => (
                  <View key={index} className="relative mr-2 mb-2">
                    <Image
                      source={{ uri: image }}
                      className="w-20 h-20 rounded-lg"
                    />
                    <TouchableOpacity
                      className="absolute top-1 right-1 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center border border-dashed border-gray-300 mr-2 mb-2"
                  onPress={pickImage}
                >
                  <Ionicons name="add" size={24} color="#4b5563" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700).duration(500)}>
            <TouchableOpacity
              className={`py-4 px-6 rounded-xl ${
                isLoading ? 'bg-green-300' : 'bg-green-500'
              } items-center mb-8`}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Add Product
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 