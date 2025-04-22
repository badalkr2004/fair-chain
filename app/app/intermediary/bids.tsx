import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import bidService from '../../services/bid';
import { formatDate, formatDateTime, getRelativeTimeString } from '../../utils/dateUtils';

export default function BidsScreen() {
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  // Fetch bids
  useEffect(() => {
    fetchBids();
  }, [filter]);

  const fetchBids = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get bids for the intermediary
      const response = await bidService.getMyBids(filter !== 'ALL' ? filter : undefined);
      
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        setBids(Array.isArray(response.data) ? response.data : []);
      } else {
        setBids([]);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
      setError('Failed to load bids. Please try again.');
      // Use mock data for development
      setBids(getMockBids());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchBids();
  };

  const handleViewDetails = (bidId: string) => {
    router.push({
      pathname: '/intermediary/bid-details',
      params: { id: bidId }
    });
  };

  const handleUpdateStatus = (bidId: string, currentStatus: string) => {
    if (currentStatus === 'ACCEPTED' || currentStatus === 'REJECTED' || currentStatus === 'COMPLETED') {
      Alert.alert('Cannot Update', 'This bid is already finalized and cannot be updated.');
      return;
    }
    
    Alert.alert(
      'Update Bid Status',
      'What would you like to do with this bid?',
      [
        {
          text: 'Mark as Completed',
          onPress: () => updateBidStatus(bidId, 'COMPLETED')
        },
        {
          text: 'Cancel Bid',
          onPress: () => updateBidStatus(bidId, 'CANCELLED')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const updateBidStatus = async (bidId: string, status: string) => {
    try {
      setIsLoading(true);
      
      // Update the bid status
      await bidService.updateBidStatus(bidId, status);
      
      Alert.alert('Success', 'Bid status updated successfully');
      fetchBids(); // Refresh the list
    } catch (error) {
      console.error('Error updating bid status:', error);
      Alert.alert('Error', 'Failed to update bid status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render a bid card
  const renderBidCard = (bid: any, index: number) => {
    return (
      <Animated.View 
        key={bid.id} 
        entering={FadeInDown.delay(index * 100).springify()}
        className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
      >
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">{bid.serviceType || 'Service'}</Text>
            <View className={`px-2 py-1 rounded-full ${getStatusColor(bid.status)}`}>
              <Text className="text-white text-xs font-medium">{formatStatus(bid.status)}</Text>
            </View>
          </View>
          
          <View className="flex-row mb-3">
            {bid.product?.images && bid.product.images[0] && (
              <Image
                source={{ uri: bid.product.images[0] }}
                className="w-16 h-16 rounded-lg mr-3"
                resizeMode="cover"
              />
            )}
            
            <View className="flex-1">
              <Text className="font-medium">{bid.product?.name || 'Product'}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="cash-outline" size={14} color="#666" />
                <Text className="text-gray-600 ml-1">
                  {bid.price ? `${bid.price} ${bid.currency || 'INR'}` : 'N/A'}
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                <Ionicons name="cube-outline" size={14} color="#666" />
                <Text className="text-gray-600 ml-1">
                  {bid.quantity} {bid.unit || 'units'}
                </Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-xs text-gray-500">Farmer</Text>
              <Text className="font-medium">{bid.farmer?.name || 'Unknown'}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">Placed</Text>
              <Text className="font-medium">{formatDate(bid.createdAt)}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">Expires</Text>
              <Text className="font-medium">{getRelativeTimeString(bid.expiresAt)}</Text>
            </View>
          </View>
          
          {bid.description && (
            <View className="mb-3">
              <Text className="text-gray-600 text-sm">{bid.description}</Text>
            </View>
          )}
          
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
              onPress={() => handleViewDetails(bid.id.toString())}
            >
              <Ionicons name="information-circle-outline" size={16} color="white" />
              <Text className="text-white font-medium ml-1">Details</Text>
            </TouchableOpacity>
            
            {(bid.status === 'PENDING' || bid.status === 'ACCEPTED') && (
              <TouchableOpacity
                className="bg-green-500 px-4 py-2 rounded-lg flex-row items-center"
                onPress={() => handleUpdateStatus(bid.id.toString(), bid.status)}
              >
                <Ionicons name="refresh-outline" size={16} color="white" />
                <Text className="text-white font-medium ml-1">Update Status</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    );
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

  // Filter options
  const filterOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  // Mock data for development
  const getMockBids = () => {
    return [
      {
        id: '1',
        productId: 'prod-123',
        product: {
          name: 'Organic Rice',
          category: 'Grains',
          images: ['https://via.placeholder.com/150']
        },
        farmerId: 'farmer-123',
        farmer: {
          name: 'John Farmer'
        },
        price: 25000,
        currency: 'INR',
        quantity: 500,
        unit: 'kg',
        serviceType: 'LOGISTICS',
        status: 'PENDING',
        description: 'Need transportation from farm to warehouse',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        id: '2',
        productId: 'prod-456',
        product: {
          name: 'Premium Wheat',
          category: 'Grains',
          images: ['https://via.placeholder.com/150']
        },
        farmerId: 'farmer-456',
        farmer: {
          name: 'Alice Grower'
        },
        price: 15000,
        currency: 'INR',
        quantity: 300,
        unit: 'kg',
        serviceType: 'STORAGE',
        status: 'ACCEPTED',
        description: 'Need storage for 2 months',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
      {
        id: '3',
        productId: 'prod-789',
        product: {
          name: 'Fresh Vegetables',
          category: 'Vegetables',
          images: ['https://via.placeholder.com/150']
        },
        farmerId: 'farmer-789',
        farmer: {
          name: 'Robert Planter'
        },
        price: 8000,
        currency: 'INR',
        quantity: 100,
        unit: 'kg',
        serviceType: 'PROCESSING',
        status: 'COMPLETED',
        description: 'Need cleaning and packaging',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
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
          <Text className="text-xl font-bold">My Bids</Text>
          <TouchableOpacity onPress={() => router.push('/intermediary/place-bid')}>
            <Ionicons name="add-circle" size={24} color="#16a34a" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Filter Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="bg-white py-2 px-2 border-b border-gray-200"
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            className={`px-4 py-2 rounded-full mr-2 ${filter === option.value ? 'bg-green-500' : 'bg-gray-200'}`}
            onPress={() => setFilter(option.value)}
          >
            <Text className={`font-medium ${filter === option.value ? 'text-white' : 'text-gray-800'}`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Content */}
      {isLoading && !isRefreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-gray-600">Loading bids...</Text>
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
                onPress={fetchBids}
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : bids.length === 0 ? (
            <View className="py-12 px-4 bg-gray-50 rounded-xl items-center">
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text className="text-lg font-medium text-gray-600 mt-4 text-center">
                No bids found
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                You haven't placed any bids yet. Browse available products and place bids to get started.
              </Text>
              <TouchableOpacity
                className="mt-6 bg-green-500 py-2 px-6 rounded-lg"
                onPress={() => router.push('/intermediary/marketplace')}
              >
                <Text className="text-white font-medium">Browse Marketplace</Text>
              </TouchableOpacity>
            </View>
          ) : (
            bids.map((bid, index) => 
              renderBidCard(bid, index)
            )
          )}
          
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
