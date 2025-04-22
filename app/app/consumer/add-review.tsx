import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  Alert,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as reviewsService from '../../services/reviews';
import * as ordersService from '../../services/orders';

export default function AddReviewScreen() {
  const { productId } = useLocalSearchParams();
  
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    fetchPurchasedProducts();
  }, []);

  useEffect(() => {
    if (productId && products.length > 0) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [productId, products]);

  const fetchPurchasedProducts = async () => {
    try {
      setIsLoading(true);
      
      // Get products from completed orders
      const response = await ordersService.getPurchasedProducts();
      
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        setProducts(Array.isArray(response.data) ? response.data : []);
      } else {
        // Use mock data for development
        setProducts(getMockProducts());
      }
    } catch (error) {
      console.error('Error fetching purchased products:', error);
      // Use mock data for development
      setProducts(getMockProducts());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Please select a product to review');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a review comment');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const reviewData = {
        productId: selectedProduct.id,
        rating,
        comment
      };
      
      await reviewsService.addReview(reviewData);
      
      Alert.alert(
        'Success',
        'Your review has been submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setShowProductSelector(false);
  };

  // Mock data for development
  const getMockProducts = () => {
    return [
      {
        id: 'prod-123',
        name: 'Organic Rice',
        category: 'Grains',
        images: ['https://via.placeholder.com/150']
      },
      {
        id: 'prod-456',
        name: 'Fresh Tomatoes',
        category: 'Vegetables',
        images: ['https://via.placeholder.com/150']
      },
      {
        id: 'prod-789',
        name: 'Organic Apples',
        category: 'Fruits',
        images: ['https://via.placeholder.com/150']
      }
    ];
  };

  // Rating Stars Component
  const RatingSelector = () => {
    return (
      <View className="flex-row justify-center my-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            className="mx-1"
          >
            <Ionicons
              name={rating >= star ? "star" : "star-outline"}
              size={32}
              color="#f59e0b"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Write a Review</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-gray-600">Loading products...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          <Animated.View 
            entering={FadeIn.delay(100).springify()}
            className="bg-white rounded-xl shadow-sm overflow-hidden mb-4"
          >
            {/* Product Selector */}
            <View className="p-4 border-b border-gray-200">
              <Text className="font-bold text-lg mb-2">Select Product</Text>
              
              {selectedProduct ? (
                <TouchableOpacity 
                  onPress={() => setShowProductSelector(!showProductSelector)}
                  className="flex-row items-center"
                >
                  {selectedProduct.images && selectedProduct.images[0] ? (
                    <Image
                      source={{ uri: selectedProduct.images[0] }}
                      className="w-16 h-16 rounded-lg mr-3"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-16 h-16 bg-gray-200 rounded-lg mr-3 justify-center items-center">
                      <Ionicons name="image-outline" size={24} color="#999" />
                    </View>
                  )}
                  
                  <View className="flex-1">
                    <Text className="font-bold">{selectedProduct.name}</Text>
                    <Text className="text-gray-600">{selectedProduct.category}</Text>
                    <Text className="text-blue-500 mt-1">Change Product</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowProductSelector(true)}
                  className="bg-gray-100 p-4 rounded-lg flex-row items-center justify-center"
                >
                  <Ionicons name="add-circle-outline" size={24} color="#16a34a" />
                  <Text className="text-green-600 font-medium ml-2">Select a Product</Text>
                </TouchableOpacity>
              )}
              
              {/* Product List */}
              {showProductSelector && (
                <View className="mt-4 bg-gray-50 rounded-lg p-2">
                  {products.length === 0 ? (
                    <Text className="text-center text-gray-500 py-4">
                      No purchased products found
                    </Text>
                  ) : (
                    products.map((product) => (
                      <TouchableOpacity
                        key={product.id}
                        onPress={() => handleSelectProduct(product)}
                        className={`flex-row items-center p-2 mb-2 rounded-lg ${
                          selectedProduct?.id === product.id ? 'bg-green-100' : 'bg-white'
                        }`}
                      >
                        {product.images && product.images[0] ? (
                          <Image
                            source={{ uri: product.images[0] }}
                            className="w-12 h-12 rounded-lg mr-3"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-12 h-12 bg-gray-200 rounded-lg mr-3 justify-center items-center">
                            <Ionicons name="image-outline" size={20} color="#999" />
                          </View>
                        )}
                        
                        <View className="flex-1">
                          <Text className="font-medium">{product.name}</Text>
                          <Text className="text-gray-600 text-sm">{product.category}</Text>
                        </View>
                        
                        {selectedProduct?.id === product.id && (
                          <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>
            
            {/* Rating */}
            <View className="p-4 border-b border-gray-200">
              <Text className="font-bold text-lg mb-2 text-center">Your Rating</Text>
              <RatingSelector />
              <Text className="text-center text-gray-600">
                {rating === 1 ? 'Poor' : 
                 rating === 2 ? 'Fair' : 
                 rating === 3 ? 'Good' : 
                 rating === 4 ? 'Very Good' : 'Excellent'}
              </Text>
            </View>
            
            {/* Review Comment */}
            <View className="p-4">
              <Text className="font-bold text-lg mb-2">Your Review</Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 min-h-[120px] text-base"
                placeholder="Share your experience with this product..."
                multiline
                textAlignVertical="top"
                value={comment}
                onChangeText={setComment}
              />
              
              <TouchableOpacity
                className={`mt-4 py-3 rounded-lg flex-row justify-center items-center ${
                  isSubmitting || !selectedProduct || !comment.trim() 
                    ? 'bg-gray-300' 
                    : 'bg-green-500'
                }`}
                onPress={handleSubmit}
                disabled={isSubmitting || !selectedProduct || !comment.trim()}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="white" />
                    <Text className="text-white font-bold ml-2">Submit Review</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
