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

export default function EditReviewScreen() {
  const { id } = useLocalSearchParams();
  const reviewId = id as string;
  
  const [review, setReview] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reviewId) {
      fetchReview();
    } else {
      Alert.alert('Error', 'Review ID is missing');
      router.back();
    }
  }, [reviewId]);

  const fetchReview = async () => {
    try {
      setIsLoading(true);
      
      // Get review details
      const response = await reviewsService.getReviewById(reviewId);
      
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        setReview(response.data);
        setRating(response.data.rating);
        setComment(response.data.comment);
      } else {
        // Use mock data for development
        const mockReview = getMockReview();
        setReview(mockReview);
        setRating(mockReview.rating);
        setComment(mockReview.comment);
      }
    } catch (error) {
      console.error('Error fetching review:', error);
      // Use mock data for development
      const mockReview = getMockReview();
      setReview(mockReview);
      setRating(mockReview.rating);
      setComment(mockReview.comment);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a review comment');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const reviewData = {
        rating,
        comment
      };
      
      await reviewsService.updateReview(reviewId, reviewData);
      
      Alert.alert(
        'Success',
        'Your review has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating review:', error);
      Alert.alert('Error', 'Failed to update review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock data for development
  const getMockReview = () => {
    return {
      id: reviewId,
      productId: 'prod-123',
      product: {
        name: 'Organic Rice',
        category: 'Grains',
        images: ['https://via.placeholder.com/150']
      },
      userId: 'current-user',
      user: {
        name: 'You'
      },
      rating: 4,
      comment: 'Very good quality rice. Packaging was excellent and delivery was prompt.',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    };
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
          <Text className="text-xl font-bold">Edit Review</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-gray-600">Loading review...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          <Animated.View 
            entering={FadeIn.delay(100).springify()}
            className="bg-white rounded-xl shadow-sm overflow-hidden mb-4"
          >
            {/* Product Info */}
            <View className="p-4 border-b border-gray-200">
              <Text className="font-bold text-lg mb-2">Product</Text>
              
              <View className="flex-row items-center">
                {review.product?.images && review.product.images[0] ? (
                  <Image
                    source={{ uri: review.product.images[0] }}
                    className="w-16 h-16 rounded-lg mr-3"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-16 h-16 bg-gray-200 rounded-lg mr-3 justify-center items-center">
                    <Ionicons name="image-outline" size={24} color="#999" />
                  </View>
                )}
                
                <View className="flex-1">
                  <Text className="font-bold">{review.product?.name || 'Product'}</Text>
                  <Text className="text-gray-600">{review.product?.category || 'Category'}</Text>
                </View>
              </View>
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
                  isSubmitting || !comment.trim() 
                    ? 'bg-gray-300' 
                    : 'bg-green-500'
                }`}
                onPress={handleSubmit}
                disabled={isSubmitting || !comment.trim()}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color="white" />
                    <Text className="text-white font-bold ml-2">Update Review</Text>
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
