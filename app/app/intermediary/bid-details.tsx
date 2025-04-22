import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import bidService from '../../services/bid';
import { formatDate, formatDateTime, getRelativeTimeString } from '../../utils/dateUtils';

export default function BidDetailsScreen() {
  const { id } = useLocalSearchParams();
  const bidId = id as string;
  
  const [bid, setBid] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bidId) {
      fetchBidDetails();
    } else {
      setError('Bid ID is missing');
      setIsLoading(false);
    }
  }, [bidId]);

  const fetchBidDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get bid details
      const response = await bidService.getBidById(bidId);
      
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        setBid(response.data);
      } else {
        setError('Bid not found');
      }
    } catch (error) {
      console.error('Error fetching bid details:', error);
      setError('Failed to load bid details. Please try again.');
      
      // Use mock data for development
      setBid(getMockBid());
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = () => {
    if (!bid) return;
    
    if (bid.status === 'COMPLETED' || bid.status === 'REJECTED' || bid.status === 'CANCELLED') {
      Alert.alert('Cannot Update', 'This bid is already finalized and cannot be updated.');
      return;
    }
    
    Alert.alert(
      'Update Bid Status',
      'What would you like to do with this bid?',
      [
        {
          text: 'Mark as Completed',
          onPress: () => updateBidStatus('COMPLETED')
        },
        {
          text: 'Cancel Bid',
          onPress: () => updateBidStatus('CANCELLED')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const updateBidStatus = async (status: string) => {
    try {
      setIsLoading(true);
      
      // Update the bid status
      await bidService.updateBidStatus(bidId, status);
      
      Alert.alert('Success', 'Bid status updated successfully');
      fetchBidDetails(); // Refresh the data
    } catch (error) {
      console.error('Error updating bid status:', error);
      Alert.alert('Error', 'Failed to update bid status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProduct = () => {
    if (!bid?.productId) return;
    router.push({
      pathname: '/consumer/product',
      params: { id: bid.productId }
    });
  };

  const handleCreateSupplyChain = () => {
    if (!bid) return;
    
    if (bid.status !== 'ACCEPTED') {
      Alert.alert('Cannot Create Supply Chain', 'You can only create a supply chain for accepted bids.');
      return;
    }
    
    router.push({
      pathname: '/intermediary/create-supply-chain',
      params: { bidId: bid.id }
    });
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'ACCEPTED': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      case 'CANCELLED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  // Mock data for development
  const getMockBid = () => {
    return {
      id: bidId || '1',
      productId: 'prod-123',
      product: {
        name: 'Organic Rice',
        category: 'Grains',
        images: ['https://via.placeholder.com/150']
      },
      farmerId: 'farmer-123',
      farmer: {
        name: 'John Farmer',
        location: 'Punjab, India',
        rating: 4.5
      },
      price: 25000,
      currency: 'INR',
      quantity: 500,
      unit: 'kg',
      serviceType: 'LOGISTICS',
      status: 'PENDING',
      description: 'Need transportation from farm to warehouse',
      terms: 'Delivery within 3 days, refrigerated transport required',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    };
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
          <Text className="text-xl font-bold">Bid Details</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-gray-600">Loading bid details...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="mt-4 text-lg font-medium text-red-500 text-center">{error}</Text>
          <TouchableOpacity
            className="mt-6 bg-blue-500 py-2 px-6 rounded-lg"
            onPress={fetchBidDetails}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {/* Bid Overview */}
          <Animated.View 
            entering={FadeIn.delay(100).springify()}
            className="bg-white m-4 rounded-xl shadow-sm overflow-hidden"
          >
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-bold">{bid.serviceType || 'Service'}</Text>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(bid.status)}`}>
                  <Text className="text-white text-xs font-medium">{formatStatus(bid.status)}</Text>
                </View>
              </View>
              
              <View className="flex-row mb-4">
                {bid.product?.images && bid.product.images[0] && (
                  <Image
                    source={{ uri: bid.product.images[0] }}
                    className="w-20 h-20 rounded-lg mr-4"
                    resizeMode="cover"
                  />
                )}
                
                <View className="flex-1">
                  <Text className="text-lg font-medium">{bid.product?.name || 'Product'}</Text>
                  <Text className="text-gray-600">{bid.product?.category || 'Category'}</Text>
                  <Text className="text-gray-600">
                    {bid.quantity || 0} {bid.unit || 'units'}
                  </Text>
                </View>
              </View>
              
              <View className="bg-gray-50 p-3 rounded-lg mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Bid Amount:</Text>
                  <Text className="font-bold">{bid.price} {bid.currency || 'INR'}</Text>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Status:</Text>
                  <Text className={`font-bold ${
                    bid.status === 'COMPLETED' ? 'text-green-600' : 
                    bid.status === 'REJECTED' || bid.status === 'CANCELLED' ? 'text-red-600' : 
                    bid.status === 'ACCEPTED' ? 'text-blue-600' : 
                    'text-yellow-600'
                  }`}>
                    {formatStatus(bid.status)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Placed On:</Text>
                  <Text className="font-medium">{formatDateTime(bid.createdAt)}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Expires:</Text>
                  <Text className="font-medium">{formatDateTime(bid.expiresAt)}</Text>
                </View>
              </View>
              
              <View className="mb-4">
                <Text className="font-bold mb-2">Farmer Information</Text>
                
                <View className="bg-gray-50 p-3 rounded-lg">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="person-outline" size={18} color="#666" />
                    <Text className="font-medium ml-2">{bid.farmer?.name || 'Unknown'}</Text>
                  </View>
                  
                  {bid.farmer?.location && (
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="location-outline" size={18} color="#666" />
                      <Text className="text-gray-600 ml-2">{bid.farmer.location}</Text>
                    </View>
                  )}
                  
                  {bid.farmer?.rating && (
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={18} color="#f59e0b" />
                      <Text className="text-gray-600 ml-2">{bid.farmer.rating} / 5</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {(bid.description || bid.terms) && (
                <View className="mb-4">
                  <Text className="font-bold mb-2">Bid Details</Text>
                  
                  <View className="bg-gray-50 p-3 rounded-lg">
                    {bid.description && (
                      <View className="mb-2">
                        <Text className="text-xs text-gray-500">Description</Text>
                        <Text className="text-gray-700">{bid.description}</Text>
                      </View>
                    )}
                    
                    {bid.terms && (
                      <View>
                        <Text className="text-xs text-gray-500">Terms & Conditions</Text>
                        <Text className="text-gray-700">{bid.terms}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              
              <View className="flex-row flex-wrap justify-between">
                {bid.status !== 'COMPLETED' && bid.status !== 'REJECTED' && bid.status !== 'CANCELLED' && (
                  <TouchableOpacity
                    className="bg-blue-500 px-3 py-2 rounded-lg flex-row items-center mb-2"
                    onPress={handleUpdateStatus}
                  >
                    <Ionicons name="refresh-outline" size={16} color="white" />
                    <Text className="text-white font-medium ml-1">Update Status</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  className="bg-green-500 px-3 py-2 rounded-lg flex-row items-center mb-2"
                  onPress={handleViewProduct}
                >
                  <Ionicons name="cube-outline" size={16} color="white" />
                  <Text className="text-white font-medium ml-1">View Product</Text>
                </TouchableOpacity>
                
                {bid.status === 'ACCEPTED' && (
                  <TouchableOpacity
                    className="bg-purple-500 px-3 py-2 rounded-lg flex-row items-center mb-2"
                    onPress={handleCreateSupplyChain}
                  >
                    <Ionicons name="git-branch-outline" size={16} color="white" />
                    <Text className="text-white font-medium ml-1">Create Supply Chain</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
          
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
