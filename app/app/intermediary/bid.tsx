import React, { useState, useEffect } from 'react';
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
  Image
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as productsService from '../../services/products';
import * as bidsService from '../../services/bids';
import authService from '../../services/auth';

// Service type options
const SERVICE_TYPES = ['TRANSPORT', 'STORAGE', 'PROCESSING', 'AGGREGATION'];

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  basePrice: number;
  images: string[];
  farmer: {
    name: string;
    id: string;
  };
}

interface ProductResponse {
  product: Product;
}

export default function BidScreen() {
  const params = useLocalSearchParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    price: '',
    quantity: '',
    serviceType: 'TRANSPORT',
    description: '',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    terms: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchProductDetails();
    loadUser();
  }, [productId]);

  const loadUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const fetchProductDetails = async () => {
    try {
      setIsProductLoading(true);
      if (!productId) {
        setError('Product ID is missing');
        return;
      }

      try {
        const response = await productsService.getProductById(productId) as unknown as ProductResponse;
        if (response && response.product) {
          setProduct(response.product);
          // Initialize quantity with product's available quantity
          setFormData(prev => ({
            ...prev,
            quantity: response.product.quantity.toString()
          }));
          setError(null);
        } else {
          setError('Product not found');
        }
      } catch (error) {
        console.error('Error parsing product response:', error);
        setError('Failed to load product details. Invalid response format.');
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      setError('Failed to load product details. Please try again.');
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleSelectServiceType = (type: string) => {
    setFormData({ ...formData, serviceType: type });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Validate form fields
      if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
        setError('Valid price is required');
        return;
      }
      if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
        setError('Valid quantity is required');
        return;
      }
      if (product && Number(formData.quantity) > product.quantity) {
        setError(`Quantity cannot exceed available amount (${product.quantity} ${product.unit}s)`);
        return;
      }
      if (!formData.description.trim()) {
        setError('Service description is required');
        return;
      }

      // Format data for API
      const bidData: bidsService.CreateBidDTO = {
        productId,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        serviceType: formData.serviceType,
        description: formData.description,
        validUntil: formData.validUntil.toISOString(),
        terms: formData.terms.trim() || undefined
      };

      // Call API to create bid
      await bidsService.createBid(bidData);
      
      // Show success message
      Alert.alert(
        'Success',
        'Your bid has been placed successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
    } catch (error) {
      console.error('Error creating bid:', error);
      setError(error instanceof Error ? error.message : 'Failed to place bid. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isProductLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAF5]">
        <ActivityIndicator size="large" color="#d97706" />
        <Text className="mt-4 text-gray-600">Loading product details...</Text>
      </View>
    );
  }

  if (error && !product) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={56} color="#ef4444" />
        <Text className="text-xl font-medium text-red-500 mt-4">{error}</Text>
        <Text className="text-gray-500 text-center mt-2 mb-6">
          We couldn't find the product you're looking for. It may have been removed or is no longer available.
        </Text>
        <TouchableOpacity
          className="bg-amber-500 py-3 px-6 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
              className="w-10 h-10 rounded-full items-center justify-center bg-amber-100 mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#d97706" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-amber-800">
              Place a Bid
            </Text>
          </View>

          {/* Error message */}
          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}

          {/* Product Info */}
          {product && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  Product Information
                </Text>
                
                <View className="flex-row mb-4">
                  <Image
                    source={product.images && product.images.length > 0 
                      ? { uri: product.images[0] } 
                      : require('../../assets/images/placeholder.png')
                    }
                    className="w-20 h-20 rounded-lg mr-4"
                    style={{ width: 80, height: 80, borderRadius: 8, marginRight: 16 }}
                  />
                  <View className="flex-1">
                    <Text className="text-amber-800 font-semibold text-lg">{product.name}</Text>
                    <Text className="text-gray-600">{product.category}</Text>
                    <Text className="text-gray-700 mt-1">
                      {product.quantity} {product.unit}s available
                    </Text>
                    <Text className="text-amber-600 font-medium mt-1">
                      ${product.basePrice}/{product.unit}
                    </Text>
                  </View>
                </View>

                {product.description && (
                  <Text className="text-gray-700 mb-2">{product.description}</Text>
                )}

                <View className="flex-row items-center mt-2">
                  <Ionicons name="person-circle-outline" size={20} color="#d97706" />
                  <Text className="text-amber-700 ml-2">Farmer: {product.farmer.name}</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Bid Form */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-5">
                Your Bid Details
              </Text>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Your Price per {product?.unit}*</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder={`Enter your bid price (current: $${product?.basePrice})`}
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Quantity*</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder={`Enter quantity (max: ${product?.quantity})`}
                  keyboardType="numeric"
                  value={formData.quantity}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Service Type*</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                  {SERVICE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      className={`mr-2 py-3 px-4 rounded-xl ${
                        formData.serviceType === type
                          ? 'bg-amber-600'
                          : 'bg-gray-100 border border-gray-200'
                      }`}
                      onPress={() => handleSelectServiceType(type)}
                    >
                      <Text
                        className={`${
                          formData.serviceType === type
                            ? 'text-white font-medium'
                            : 'text-gray-800'
                        }`}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Service Description*</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Describe your services and why the farmer should accept your bid"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Valid Until</Text>
                <TouchableOpacity
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text className="text-gray-800">
                    {formData.validUntil.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={22} color="#d97706" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={formData.validUntil}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setFormData(prev => ({ ...prev, validUntil: selectedDate }));
                      }
                    }}
                  />
                )}
              </View>

              <View className="mb-2">
                <Text className="text-gray-700 mb-2">Additional Terms (Optional)</Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                  placeholder="Any additional terms or conditions for your bid"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={formData.terms}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, terms: text }))}
                />
              </View>
            </View>
          </Animated.View>

          {/* Bid Summary */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Bid Summary
              </Text>

              {product && formData.price && formData.quantity && (
                <View className="bg-gray-50 p-4 rounded-lg">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700">Unit price:</Text>
                    <Text className="text-gray-900 font-medium">${formData.price}/{product.unit}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700">Quantity:</Text>
                    <Text className="text-gray-900 font-medium">{formData.quantity} {product.unit}s</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700">Service:</Text>
                    <Text className="text-gray-900 font-medium">{formData.serviceType}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700">Valid until:</Text>
                    <Text className="text-gray-900 font-medium">{formData.validUntil.toLocaleDateString()}</Text>
                  </View>
                  <View className="border-t border-gray-300 my-2" />
                  <View className="flex-row justify-between">
                    <Text className="text-gray-800 font-semibold">Total value:</Text>
                    <Text className="text-amber-700 font-bold">
                      ${(Number(formData.price) * Number(formData.quantity)).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`bg-amber-600 py-4 rounded-xl items-center mb-8 ${isLoading ? 'opacity-70' : ''}`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-medium">Place Bid</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 