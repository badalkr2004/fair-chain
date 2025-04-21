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
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as reviewsService from '../../services/reviews';
import { formatDate } from '../../utils/dateUtils';

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      
      if (activeTab === 'all') {
        const response = await reviewsService.getAllReviews();
        if (response && typeof response === 'object' && 'data' in response && response.data) {
          setReviews(Array.isArray(response.data) ? response.data : []);
        } else {
          // Use mock data for development
          setReviews(getMockReviews());
        }
      } else {
        const response = await reviewsService.getMyReviews();
        if (response && typeof response === 'object' && 'data' in response && response.data) {
          setMyReviews(Array.isArray(response.data) ? response.data : []);
        } else {
          // Use mock data for development
          setMyReviews(getMockMyReviews());
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Use mock data for development
      if (activeTab === 'all') {
        setReviews(getMockReviews());
      } else {
        setMyReviews(getMockMyReviews());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReview = () => {
    router.push('/consumer/add-review');
  };

  const handleEditReview = (reviewId: string) => {
    router.push({
      pathname: '/consumer/edit-review',
      params: { id: reviewId }
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReview(reviewId)
        }
      ]
    );
  };

  const deleteReview = async (reviewId: string) => {
    try {
      setIsLoading(true);
      await reviewsService.deleteReview(reviewId);
      Alert.alert('Success', 'Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      Alert.alert('Error', 'Failed to delete review. Please try again.');
      setIsLoading(false);
    }
  };

  const handleViewProduct = (productId: string) => {
    router.push({
      pathname: '/consumer/product-details',
      params: { id: productId }
    });
  };

  // Render a review card
  const renderReviewCard = (review: any, index: number, isMyReview: boolean = false) => {
    return (
      <Animated.View 
        key={review.id} 
        entering={FadeInDown.delay(index * 100).springify()}
        className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
      >
        <View className="p-4">
          <View className="flex-row mb-3">
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
              <Text className="font-bold text-lg">{review.product?.name || 'Product'}</Text>
              <Text className="text-gray-600">{review.product?.category || 'Category'}</Text>
              <TouchableOpacity 
                onPress={() => handleViewProduct(review.productId)}
                className="mt-1"
              >
                <Text className="text-blue-500">View Product</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="flex-row items-center mb-2">
            <RatingStars rating={review.rating} />
            <Text className="ml-2 text-gray-600">{review.rating}/5</Text>
          </View>
          
          <Text className="text-gray-800 mb-3">{review.comment}</Text>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="person-circle-outline" size={18} color="#666" />
              <Text className="text-gray-600 ml-1">
                {review.user?.name || 'Anonymous'}
              </Text>
            </View>
            
            <Text className="text-gray-500 text-xs">
              {formatDate(review.createdAt)}
            </Text>
          </View>
          
          {isMyReview && (
            <View className="flex-row mt-3 justify-end">
              <TouchableOpacity
                className="bg-blue-500 px-3 py-1 rounded-lg flex-row items-center mr-2"
                onPress={() => handleEditReview(review.id)}
              >
                <Ionicons name="create-outline" size={16} color="white" />
                <Text className="text-white font-medium ml-1">Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-red-500 px-3 py-1 rounded-lg flex-row items-center"
                onPress={() => handleDeleteReview(review.id)}
              >
                <Ionicons name="trash-outline" size={16} color="white" />
                <Text className="text-white font-medium ml-1">Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  // Rating Stars Component
  const RatingStars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <View className="flex-row">
        {[...Array(fullStars)].map((_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={18} color="#f59e0b" />
        ))}
        
        {halfStar && (
          <Ionicons name="star-half" size={18} color="#f59e0b" />
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <Ionicons key={`empty-${i}`} name="star-outline" size={18} color="#f59e0b" />
        ))}
      </View>
    );
  };

  // Mock data for development
  const getMockReviews = () => {
    return [
      {
        id: '1',
        productId: 'prod-123',
        product: {
          name: 'Organic Rice',
          category: 'Grains',
          images: ['https://via.placeholder.com/150']
        },
        userId: 'user-1',
        user: {
          name: 'John Consumer'
        },
        rating: 4.5,
        comment: 'Excellent quality rice! Very fresh and tasty. Will definitely buy again.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        productId: 'prod-456',
        product: {
          name: 'Fresh Tomatoes',
          category: 'Vegetables',
          images: ['https://via.placeholder.com/150']
        },
        userId: 'user-2',
        user: {
          name: 'Alice Buyer'
        },
        rating: 5,
        comment: 'These tomatoes are amazing! So juicy and flavorful. The farmer really knows what they\'re doing.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        productId: 'prod-789',
        product: {
          name: 'Organic Apples',
          category: 'Fruits',
          images: ['https://via.placeholder.com/150']
        },
        userId: 'user-3',
        user: {
          name: 'Robert Customer'
        },
        rating: 3,
        comment: 'Good apples, but some were bruised during delivery. Otherwise the taste is good.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  };

  const getMockMyReviews = () => {
    return [
      {
        id: '4',
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
      },
      {
        id: '5',
        productId: 'prod-789',
        product: {
          name: 'Organic Apples',
          category: 'Fruits',
          images: ['https://via.placeholder.com/150']
        },
        userId: 'current-user',
        user: {
          name: 'You'
        },
        rating: 5,
        comment: 'Best apples I\'ve ever had! So crisp and sweet. Will definitely order again.',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
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
          <Text className="text-xl font-bold">Reviews</Text>
          <TouchableOpacity onPress={handleAddReview}>
            <Ionicons name="add-circle" size={24} color="#16a34a" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === 'all' ? 'border-b-2 border-green-500' : ''}`}
          onPress={() => setActiveTab('all')}
        >
          <Text className={`text-center font-medium ${activeTab === 'all' ? 'text-green-500' : 'text-gray-600'}`}>
            All Reviews
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === 'my' ? 'border-b-2 border-green-500' : ''}`}
          onPress={() => setActiveTab('my')}
        >
          <Text className={`text-center font-medium ${activeTab === 'my' ? 'text-green-500' : 'text-gray-600'}`}>
            My Reviews
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-gray-600">Loading reviews...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4">
          {activeTab === 'all' ? (
            reviews.length === 0 ? (
              <View className="py-12 px-4 bg-gray-50 rounded-xl items-center">
                <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
                <Text className="text-lg font-medium text-gray-600 mt-4 text-center">
                  No reviews yet
                </Text>
                <Text className="text-gray-500 text-center mt-2">
                  Be the first to review a product!
                </Text>
                <TouchableOpacity
                  className="mt-6 bg-green-500 py-2 px-6 rounded-lg"
                  onPress={handleAddReview}
                >
                  <Text className="text-white font-medium">Write a Review</Text>
                </TouchableOpacity>
              </View>
            ) : (
              reviews.map((review, index) => renderReviewCard(review, index))
            )
          ) : (
            myReviews.length === 0 ? (
              <View className="py-12 px-4 bg-gray-50 rounded-xl items-center">
                <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
                <Text className="text-lg font-medium text-gray-600 mt-4 text-center">
                  You haven't written any reviews yet
                </Text>
                <Text className="text-gray-500 text-center mt-2">
                  Share your experience with products you've purchased!
                </Text>
                <TouchableOpacity
                  className="mt-6 bg-green-500 py-2 px-6 rounded-lg"
                  onPress={handleAddReview}
                >
                  <Text className="text-white font-medium">Write a Review</Text>
                </TouchableOpacity>
              </View>
            ) : (
              myReviews.map((review, index) => renderReviewCard(review, index, true))
            )
          )}
          
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
