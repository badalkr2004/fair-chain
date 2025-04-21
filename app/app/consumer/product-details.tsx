import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Share, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as productsService from '../../services/products';
import * as cartService from '../../services/cart';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import VerificationButton from '../../components/VerificationButton';

interface Farmer {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  farmSize: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  farmerId: string;
  category: string;
  quantity: number;
  unit: string;
  basePrice: number;
  finalPrice: number;
  images: string[];
  harvestDate: string;
  availableUntil: string;
  status: 'LISTED' | 'SOLD' | 'EXPIRED';
  location: {
    lat: number;
    lng: number;
  };
  organicCertified: boolean;
  createdAt: string;
  updatedAt: string;
  farmer: Farmer;
}

interface ProductResponse {
  product: Product;
}

export default function ProductDetails() {
  const params = useLocalSearchParams();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setIsLoading(true);
      if (!productId) {
        setError('Product ID is missing');
        return;
      }

      const response = await productsService.getProductById(productId) as ProductResponse;
      if (response && response.product) {
        setProduct(response.product);
        setError(null);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      setError('Failed to load product details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.quantity) {
      setQuantity(quantity + 1);
    } else {
      Alert.alert('Maximum Quantity', 'You have reached the maximum available quantity for this product.');
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    
    try {
      await cartService.addToCart({
        productId: product.id,
        quantity: quantity
      });
      Alert.alert(
        'Added to Cart',
        `${product.name} has been added to your cart.`,
        [
          { text: 'Continue Shopping', onPress: () => {} },
          { text: 'View Cart', onPress: () => router.push('/consumer/cart' as any) }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart. Please try again.');
    }
  };

  const buyNow = async () => {
    if (!product) return;
    
    try {
      await cartService.addToCart({
        productId: product.id,
        quantity: quantity
      });
      router.push('/consumer/cart' as any);
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
      Alert.alert('Error', 'Failed to process your request. Please try again.');
    }
  };

  const shareProduct = async () => {
    if (!product) return;
    
    try {
      await Share.share({
        message: `Check out this product: ${product.name} - ${product.description} - Available on FairChain App`,
        title: product.name
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const navigateToFarmerProfile = () => {
    if (!product) return;
    
    router.push({
      pathname: '/consumer/farmer-profile',
      params: { farmerId: product.farmerId }
    } as any);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAF5]">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading product details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={56} color="#ef4444" />
        <Text className="text-xl font-medium text-red-500 mt-4">{error || 'Product not found'}</Text>
        <Text className="text-gray-500 text-center mt-2 mb-6">
          We couldn't find the product you're looking for. It may have been removed or is no longer available.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 py-3 px-6 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1553787499-6f9133242821?w=600&auto=format&fit=crop'];

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-16 px-6 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row">
          <TouchableOpacity onPress={shareProduct} className="p-2 mr-2">
            <Ionicons name="share-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Image Gallery */}
        <View className="relative w-full h-72">
          <Image
            source={{ uri: productImages[selectedImageIndex] }}
            className="w-full h-full"
            resizeMode="cover"
          />
          
          {product.organicCertified && (
            <View className="absolute top-4 right-4 bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 font-medium">Organic</Text>
            </View>
          )}
          
          {/* Image navigation dots */}
          {productImages.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
              {productImages.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  className={`w-2 h-2 rounded-full mx-1 ${selectedImageIndex === index ? 'bg-blue-500' : 'bg-gray-300'}`}
                />
              ))}
            </View>
          )}
        </View>
        
        {/* Image thumbnails */}
        {productImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12 }}
          >
            {productImages.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                className={`mr-2 border-2 rounded-md overflow-hidden ${
                  selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <Image
                  source={{ uri: image }}
                  style={{ width: 60, height: 60 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        {/* Product Info */}
        <View className="px-6 py-4">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className="text-2xl font-bold text-gray-800">{product.name}</Text>
              <Text className="text-gray-500 mt-1">{product.category}</Text>
            </View>
            
            <View className="bg-blue-50 px-3 py-2 rounded-lg">
              <Text className="text-blue-700 font-bold text-xl">₹{product.finalPrice}/{product.unit}</Text>
              {product.finalPrice < product.basePrice && (
                <Text className="text-gray-500 text-sm line-through">₹{product.basePrice}</Text>
              )}
            </View>
          </View>
          
          {/* Quantity available */}
          <View className="flex-row items-center mt-4">
            <Ionicons name="cube-outline" size={18} color="#6b7280" />
            <Text className="ml-2 text-gray-600">
              {product.quantity} {product.unit} available
            </Text>
          </View>
          
          {/* Verification button */}
          <VerificationButton productId={product.id} />
          
          {/* Product description */}
          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Description</Text>
            <Text className="text-gray-600 leading-6">
              {product.description || `Fresh ${product.name} sourced directly from the farm. No middlemen, ensuring fair prices and maximum freshness.`}
            </Text>
          </View>
          
          {/* Farmer information */}
          <TouchableOpacity
            className="mt-6 bg-gray-50 p-4 rounded-xl flex-row items-center"
            onPress={navigateToFarmerProfile}
          >
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
              <Ionicons name="person" size={24} color="#3b82f6" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-gray-800 font-medium">{product.farmer?.name || 'Direct from Farmer'}</Text>
              <Text className="text-gray-500 text-sm">Farm Size: {product.farmer?.farmSize || '~'} acres</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          {/* Traceability information */}
          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Traceability</Text>
            
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
                  <Ionicons name="calendar-outline" size={16} color="#10b981" />
                </View>
                <View className="ml-3">
                  <Text className="text-gray-600 text-sm">Harvested on</Text>
                  <Text className="text-gray-800">{formatDate(product.harvestDate)}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                  <Ionicons name="location-outline" size={16} color="#3b82f6" />
                </View>
                <View className="ml-3">
                  <Text className="text-gray-600 text-sm">Farm location</Text>
                  <Text className="text-gray-800">
                    {product.location ? 'Verified location' : 'Location information not available'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center">
                  <MaterialCommunityIcons name="leaf" size={16} color="#f59e0b" />
                </View>
                <View className="ml-3">
                  <Text className="text-gray-600 text-sm">Certification</Text>
                  <Text className="text-gray-800">
                    {product.organicCertified ? 'Organic Certified' : 'Standard Quality'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Price breakdown */}
          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Price Breakdown</Text>
            
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Farmer's share (70%)</Text>
                <Text className="text-gray-800">₹{(product.finalPrice * 0.7).toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Transport cost (15%)</Text>
                <Text className="text-gray-800">₹{(product.finalPrice * 0.15).toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Platform fee (10%)</Text>
                <Text className="text-gray-800">₹{(product.finalPrice * 0.1).toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Other costs (5%)</Text>
                <Text className="text-gray-800">₹{(product.finalPrice * 0.05).toFixed(2)}</Text>
              </View>
              <View className="border-t border-gray-200 mt-2 pt-2 flex-row justify-between">
                <Text className="text-gray-800 font-medium">Total price</Text>
                <Text className="text-blue-700 font-bold">₹{product.finalPrice.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom purchase section */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 border-t border-gray-200 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={decreaseQuantity}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="remove" size={20} color="#4b5563" />
          </TouchableOpacity>
          
          <Text className="mx-4 text-lg font-medium text-gray-800">{quantity}</Text>
          
          <TouchableOpacity
            onPress={increaseQuantity}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="add" size={20} color="#4b5563" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row">
          <TouchableOpacity
            onPress={addToCart}
            className="bg-blue-100 py-3 px-4 rounded-l-lg"
          >
            <Text className="text-blue-700 font-medium">Add to Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={buyNow}
            className="bg-blue-600 py-3 px-4 rounded-r-lg"
          >
            <Text className="text-white font-medium">Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 