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
import supplyChainService from '../../services/supplyChain';
import traceabilityService from '../../services/traceability';
import { formatDate } from '../../utils/dateUtils';

export default function SupplyChainsScreen() {
  const [activeSupplyChains, setActiveSupplyChains] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch active supply chains
  useEffect(() => {
    fetchSupplyChains();
  }, []);

  const fetchSupplyChains = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get supply chains where the intermediary is involved
      const response = await supplyChainService.getMySupplyChains();
      
      if (response && 'data' in response && response.data) {
        setActiveSupplyChains(response.data);
      } else {
        setActiveSupplyChains([]);
      }
    } catch (error) {
      console.error('Error fetching supply chains:', error);
      setError('Failed to load supply chains. Please try again.');
      // Use mock data for development
      setActiveSupplyChains(getMockSupplyChains());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchSupplyChains();
  };

  const handleViewDetails = (supplyChainId: string) => {
    router.push({
      pathname: '/intermediary/supply-chain-details',
      params: { id: supplyChainId }
    });
  };

  const handleUpdateStatus = (supplyChainId: string, currentStatus: string) => {
    Alert.alert(
      'Update Supply Chain Status',
      'What would you like to do with this supply chain?',
      [
        {
          text: 'Mark as In Transit',
          onPress: () => updateSupplyChainStatus(supplyChainId, 'IN_TRANSIT')
        },
        {
          text: 'Mark as Delivered',
          onPress: () => updateSupplyChainStatus(supplyChainId, 'DELIVERED')
        },
        {
          text: 'Add Traceability Record',
          onPress: () => router.push(`/traceability/add-event?supplyChainId=${supplyChainId}`)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const updateSupplyChainStatus = async (supplyChainId: string, status: string) => {
    try {
      setIsLoading(true);
      
      // Update the supply chain status
      await supplyChainService.updateSupplyChainStatus(supplyChainId, status);
      
      // Add a traceability record
      await traceabilityService.recordSupplyChainEvent({
        productId: supplyChainId, // Using supplyChainId as a reference
        eventType: status === 'IN_TRANSIT' ? 'SHIPPED' : 'RECEIVED',
        location: {
          latitude: 0, // Would be replaced with actual GPS in production
          longitude: 0,
          name: 'Current Location'
        },
        details: {
          status,
          updatedAt: new Date().toISOString()
        }
      });
      
      Alert.alert('Success', 'Supply chain status updated successfully');
      fetchSupplyChains(); // Refresh the list
    } catch (error) {
      console.error('Error updating supply chain status:', error);
      Alert.alert('Error', 'Failed to update supply chain status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render a supply chain card
  const renderSupplyChainCard = (supplyChain: any, index: number) => {
    const progressPercentage = getProgressPercentage(supplyChain.status);
    
    return (
      <Animated.View 
        key={supplyChain.id} 
        entering={FadeInDown.delay(index * 100).springify()}
        className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
      >
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">{supplyChain.name || 'Supply Chain'}</Text>
            <View className={`px-2 py-1 rounded-full ${getStatusColor(supplyChain.status)}`}>
              <Text className="text-white text-xs font-medium">{formatStatus(supplyChain.status)}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-3">
            <Ionicons name="cube-outline" size={16} color="#666" />
            <Text className="text-gray-600 ml-1">{supplyChain.product?.name || 'Product'}</Text>
          </View>
          
          {/* Progress bar */}
          <View className="h-2 bg-gray-200 rounded-full mb-3">
            <View 
              className="h-2 bg-green-500 rounded-full" 
              style={{ width: `${progressPercentage}%` }} 
            />
          </View>
          
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-xs text-gray-500">Start Date</Text>
              <Text className="font-medium">{formatDate(supplyChain.startDate)}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">Estimated Completion</Text>
              <Text className="font-medium">{formatDate(supplyChain.estimatedEndDate || new Date())}</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
              onPress={() => handleViewDetails(supplyChain.id.toString())}
            >
              <Ionicons name="information-circle-outline" size={16} color="white" />
              <Text className="text-white font-medium ml-1">Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="bg-green-500 px-4 py-2 rounded-lg flex-row items-center"
              onPress={() => handleUpdateStatus(supplyChain.id, supplyChain.status)}
            >
              <Ionicons name="refresh-outline" size={16} color="white" />
              <Text className="text-white font-medium ml-1">Update Status</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Helper functions
  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'CREATED': return 10;
      case 'PROCESSING': return 30;
      case 'IN_TRANSIT': return 60;
      case 'DELIVERED': return 90;
      case 'COMPLETED': return 100;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'bg-gray-500';
      case 'PROCESSING': return 'bg-blue-500';
      case 'IN_TRANSIT': return 'bg-orange-500';
      case 'DELIVERED': return 'bg-green-500';
      case 'COMPLETED': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  // Mock data for development
  const getMockSupplyChains = () => {
    return [
      {
        id: '1',
        name: 'Rice Supply Chain',
        product: { name: 'Organic Rice' },
        status: 'IN_TRANSIT',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        estimatedEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
      {
        id: '2',
        name: 'Wheat Distribution',
        product: { name: 'Premium Wheat' },
        status: 'PROCESSING',
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        estimatedEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        id: '3',
        name: 'Vegetable Transport',
        product: { name: 'Fresh Vegetables' },
        status: 'DELIVERED',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        estimatedEndDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
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
          <Text className="text-xl font-bold">Supply Chains</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      
      {/* Content */}
      {isLoading && !isRefreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-gray-600">Loading supply chains...</Text>
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
                onPress={fetchSupplyChains}
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : activeSupplyChains.length === 0 ? (
            <View className="py-12 px-4 bg-gray-50 rounded-xl items-center">
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text className="text-lg font-medium text-gray-600 mt-4 text-center">
                No active supply chains found
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                When you accept bids from farmers, your supply chains will appear here.
              </Text>
            </View>
          ) : (
            activeSupplyChains.map((supplyChain, index) => 
              renderSupplyChainCard(supplyChain, index)
            )
          )}
          
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
