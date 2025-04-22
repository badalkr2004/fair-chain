import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import bidService from '../../services/bid';
import produceService from '../../services/produce';
import { BidStatus } from '../../types/bid';

export default function PlaceBidScreen() {
  const { productId } = useLocalSearchParams();
  
  // Product details
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Bid form data
  const [bidData, setBidData] = useState({
    price: '',
    quantity: '',
    serviceType: 'LOGISTICS', // Default service type
    description: '',
    validUntil: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days from now
    terms: ''
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        if (!productId) {
          setError('Product ID is missing');
          setIsLoading(false);
          return;
        }
        
        const response = await produceService.getProduceById(productId as string);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Handle date change
  const onValidUntilChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || bidData.validUntil;
    setShowDatePicker(Platform.OS === 'ios');
    setBidData({ ...bidData, validUntil: currentDate });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate inputs
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const bidRequest = {
        productId: productId as string,
        price: parseFloat(bidData.price),
        quantity: parseFloat(bidData.quantity),
        serviceType: bidData.serviceType,
        description: bidData.description,
        validUntil: bidData.validUntil.toISOString(),
        terms: bidData.terms
      };
      
      await bidService.createBid(bidRequest);
      
      Alert.alert(
        'Bid Placed Successfully',
        'Your bid has been sent to the farmer for review.',
        [{ text: 'OK', onPress: () => router.push('/intermediary') }]
      );
    } catch (error) {
      console.error('Error placing bid:', error);
      setError('Failed to place bid. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    setError(null);
    
    if (!bidData.price || parseFloat(bidData.price) <= 0) {
      setError('Please enter a valid price');
      return false;
    }
    
    if (!bidData.quantity || parseFloat(bidData.quantity) <= 0) {
      setError('Please enter a valid quantity');
      return false;
    }
    
    if (product && parseFloat(bidData.quantity) > product.quantity) {
      setError(`Quantity cannot exceed available amount (${product.quantity} ${product.unit})`);
      return false;
    }
    
    if (!bidData.description.trim()) {
      setError('Please provide a description of your service');
      return false;
    }
    
    // Ensure validUntil is in the future
    if (bidData.validUntil <= new Date()) {
      setError('Validity date must be in the future');
      return false;
    }
    
    return true;
  };

  // Service type options
  const serviceTypes = [
    { label: 'Logistics', value: 'LOGISTICS' },
    { label: 'Storage', value: 'STORAGE' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Aggregation', value: 'AGGREGATION' }
  ];

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAF5]">
        <ActivityIndicator size="large" color="#d97706" />
        <Text className="mt-4 text-gray-600">Loading product details...</Text>
      </View>
    );
  }

  if (error && !product) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAF5] px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-gray-800 text-lg font-medium">{error}</Text>
        <TouchableOpacity
          className="mt-6 bg-amber-600 py-3 px-6 rounded-lg"
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

          {/* Product Info */}
          {product && (
            <View className="bg-white rounded-xl overflow-hidden mb-6 shadow-sm">
              {product.images && product.images.length > 0 ? (
                <Image
                  source={{ uri: product.images[0] }}
                  style={{ width: '100%', height: 160 }}
                  resizeMode="cover"
                />
              ) : (
                <View className="h-40 bg-gray-200 items-center justify-center">
                  <Ionicons name="image-outline" size={40} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">No image available</Text>
                </View>
              )}
              <View className="p-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-xl font-semibold text-gray-800">{product.name}</Text>
                  <Text className="text-amber-600 font-medium">₹{product.basePrice}/{product.unit}</Text>
                </View>
                <Text className="text-gray-600 mb-2">Quantity: {product.quantity} {product.unit}</Text>
                <Text className="text-gray-600 mb-1">Category: {product.category}</Text>
                <Text className="text-gray-600">Available until: {new Date(product.availableUntil).toLocaleDateString()}</Text>
              </View>
            </View>
          )}

          {/* Error message */}
          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}

          {/* Bid Form */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-5">
              Bid Details
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Offered Price (₹/{product?.unit})</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                placeholder="Enter your price offer"
                keyboardType="numeric"
                value={bidData.price}
                onChangeText={(text) => setBidData({ ...bidData, price: text })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Quantity ({product?.unit})</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                placeholder={`Enter quantity (max ${product?.quantity} ${product?.unit})`}
                keyboardType="numeric"
                value={bidData.quantity}
                onChangeText={(text) => setBidData({ ...bidData, quantity: text })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Service Type</Text>
              <View className="flex-row flex-wrap">
                {serviceTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    className={`mr-2 mb-2 py-2 px-4 rounded-lg ${
                      bidData.serviceType === type.value
                        ? 'bg-amber-600'
                        : 'bg-gray-200'
                    }`}
                    onPress={() => setBidData({ ...bidData, serviceType: type.value })}
                  >
                    <Text
                      className={`${
                        bidData.serviceType === type.value
                          ? 'text-white'
                          : 'text-gray-800'
                      } font-medium`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Description of Service</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                placeholder="Describe your services in detail"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={bidData.description}
                onChangeText={(text) => setBidData({ ...bidData, description: text })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Bid Valid Until</Text>
              <TouchableOpacity
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row justify-between items-center"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-gray-800">
                  {bidData.validUntil.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#4b5563" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={bidData.validUntil}
                  mode="date"
                  display="default"
                  onChange={onValidUntilChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Additional Terms (Optional)</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-lg text-gray-800 border border-gray-200"
                placeholder="Add any additional terms or conditions"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={bidData.terms}
                onChangeText={(text) => setBidData({ ...bidData, terms: text })}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`py-4 rounded-lg items-center mb-8 ${
              isSubmitting ? 'bg-amber-400' : 'bg-amber-600'
            }`}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">Place Bid</Text>
            )}
          </TouchableOpacity>

          {/* Info Section */}
          <View className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <View className="flex-row items-start mb-4">
              <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
                <Ionicons name="information-circle" size={20} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium mb-1">
                  How Bidding Works
                </Text>
                <Text className="text-gray-600 text-sm">
                  Your bid will be sent to the farmer who can accept or reject it. Once accepted, a contract will be generated and you'll be notified.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
                <Ionicons name="time" size={20} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium mb-1">
                  Bid Validity
                </Text>
                <Text className="text-gray-600 text-sm">
                  Your bid will remain active until the specified date or until the farmer responds. You can cancel your bid anytime before it's accepted.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 