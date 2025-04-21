import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Image,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as wishlistService from '../../services/wishlist';
import * as cartService from '../../services/cart';
// Import formatDate function or create a local one
const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function WishlistScreen() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wishlist
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get wishlist items
      const response = await wishlistService.getWishlist();
      
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        setWishlistItems(Array.isArray(response.data) ? response.data : []);
      } else {
        setWishlistItems([]);
        // Use mock data for development
        setWishlistItems(getMockWishlistItems());
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to load wishlist. Please try again.');
      // Use mock data for development
      setWishlistItems(getMockWishlistItems());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchWishlist();
  };

  const handleViewDetails = (productId: string) => {
    router.push({
      pathname: '/consumer/product-details',
      params: { id: productId }
    });
  };

  const handleRemoveFromWishlist = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your wishlist?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromWishlist(itemId)
        }
      ]
    );
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      setIsLoading(true);
      await wishlistService.removeFromWishlist(itemId);
      fetchWishlist();
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      Alert.alert('Error', 'Failed to remove item from wishlist. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: any) => {
    try {
      await cartService.addToCart({
        productId: product.id,
        quantity: 1
      });
      
      Alert.alert(
        'Added to Cart',
        `${product.name} has been added to your cart.`,
        [
          {
            text: 'Continue Shopping',
            style: 'cancel'
          },
          {
            text: 'View Cart',
            onPress: () => router.push('/consumer/cart')
          }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  // Render a wishlist item
  const renderWishlistItem = (item: any, index: number) => {
    const product = item.product;
    
    return (
      <Animated.View 
        key={item.id} 
        entering={FadeInDown.delay(index * 100).springify()}
        className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
      >
        <TouchableOpacity onPress={() => handleViewDetails(product.id)}>
          <View className="flex-row">
            {product.images && product.images[0] ? (
              <Image
                source={{ uri: product.images[0] }}
                className="w-24 h-24 rounded-tl-xl rounded-bl-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 bg-gray-200 justify-center items-center rounded-tl-xl rounded-bl-xl">
                <Ionicons name="image-outline" size={24} color="#999" />
              </View>
            )}
            
            <View className="flex-1 p-3">
              <View className="flex-row justify-between items-start">
                <Text className="font-bold text-base flex-1 mr-2">{product.name}</Text>
                <TouchableOpacity onPress={() => handleRemoveFromWishlist(item.id)}>
                  <Ionicons name="close-circle" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
              
              <View className="flex-row items-center mt-1">
                <Ionicons name="pricetag-outline" size={14} color="#666" />
                <Text className="text-gray-600 ml-1">
                  {product.price ? `₹${product.price} / ${product.unit}` : 'Price on request'}
                </Text>
              </View>
              
              <View className="flex-row items-center mt-1">
                <Ionicons name="person-outline" size={14} color="#666" />
                <Text className="text-gray-600 ml-1">
                  {product.farmer?.name || 'Unknown farmer'}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-xs text-gray-500">
                  Added on {formatDate(item.createdAt)}
                </Text>
                
                <TouchableOpacity
                  className="bg-green-500 px-3 py-1 rounded-lg flex-row items-center"
                  onPress={() => handleAddToCart(product)}
                >
                  <Ionicons name="cart-outline" size={14} color="white" />
                  <Text className="text-white font-medium ml-1">Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Mock data for development
  const getMockWishlistItems = () => {
    return [
      {
        id: '1',
        productId: 'prod-123',
        userId: 'user-1',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        product: {
          id: 'prod-123',
          name: 'Organic Rice',
          category: 'Grains',
          price: 50,
          unit: 'kg',
          images: ['https://via.placeholder.com/150'],
          farmer: {
            name: 'John Farmer'
          }
        }
      },
      {
        id: '2',
        productId: 'prod-456',
        userId: 'user-1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        product: {
          id: 'prod-456',
          name: 'Fresh Tomatoes',
          category: 'Vegetables',
          price: 30,
          unit: 'kg',
          images: ['https://via.placeholder.com/150'],
          farmer: {
            name: 'Alice Grower'
          }
        }
      },
      {
        id: '3',
        productId: 'prod-789',
        userId: 'user-1',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        product: {
          id: 'prod-789',
          name: 'Organic Apples',
          category: 'Fruits',
          price: 120,
          unit: 'kg',
          images: ['https://via.placeholder.com/150'],
          farmer: {
            name: 'Robert Planter'
          }
        }
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
          <Text className="text-xl font-bold">My Wishlist</Text>
          <TouchableOpacity onPress={() => router.push('/consumer/cart')}>
            <Ionicons name="cart-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Content */}
      {isLoading && !isRefreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-gray-600">Loading wishlist...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {error ? (
            <View className="py-8 px-4 bg-red-50 rounded-xl mb-4">
              <Text className="text-red-500 text-center">{error}</Text>
              <TouchableOpacity
                className="mt-4 bg-red-500 py-2 px-4 rounded-lg self-center"
                onPress={fetchWishlist}
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : wishlistItems.length === 0 ? (
            <View className="py-12 px-4 bg-gray-50 rounded-xl items-center">
              <Ionicons name="heart-outline" size={64} color="#ccc" />
              <Text className="text-lg font-medium text-gray-600 mt-4 text-center">
                Your wishlist is empty
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                Save your favorite products to your wishlist for easy access later.
              </Text>
              <TouchableOpacity
                className="mt-6 bg-green-500 py-2 px-6 rounded-lg"
                onPress={() => router.push('/consumer/marketplace')}
              >
                <Text className="text-white font-medium">Browse Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            wishlistItems.map((item, index) => 
              renderWishlistItem(item, index)
            )
          )}
          
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
