import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import supplyChainService from '../../services/supplyChain';
import traceabilityService from '../../services/traceability';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

export default function SupplyChainDetailsScreen() {
  const { id } = useLocalSearchParams();
  const supplyChainId = id as string;
  
  const [supplyChain, setSupplyChain] = useState<any>(null);
  const [supplyChainLinks, setSupplyChainLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (supplyChainId) {
      fetchSupplyChainDetails();
    } else {
      setError('Supply chain ID is missing');
      setIsLoading(false);
    }
  }, [supplyChainId]);

  const fetchSupplyChainDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get supply chain details
      const response = await supplyChainService.getSupplyChainById(supplyChainId);
      
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        setSupplyChain(response.data);
        
        // Get supply chain links
        const linksResponse = await supplyChainService.getSupplyChainLinks(supplyChainId);
        if (linksResponse && typeof linksResponse === 'object' && 'data' in linksResponse && response.data) {
          setSupplyChainLinks(Array.isArray(linksResponse.data) ? linksResponse.data : []);
        }
      } else {
        setError('Supply chain not found');
      }
    } catch (error) {
      console.error('Error fetching supply chain details:', error);
      setError('Failed to load supply chain details. Please try again.');
      
      // Use mock data for development
      setSupplyChain(getMockSupplyChain());
      setSupplyChainLinks(getMockSupplyChainLinks());
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTraceabilityRecord = () => {
    router.push(`/traceability/add-event?supplyChainId=${supplyChainId}`);
  };

  const handleUpdateStatus = () => {
    if (!supplyChain) return;
    
    Alert.alert(
      'Update Supply Chain Status',
      'What would you like to do with this supply chain?',
      [
        {
          text: 'Mark as In Transit',
          onPress: () => updateSupplyChainStatus('IN_TRANSIT')
        },
        {
          text: 'Mark as Delivered',
          onPress: () => updateSupplyChainStatus('DELIVERED')
        },
        {
          text: 'Mark as Completed',
          onPress: () => updateSupplyChainStatus('COMPLETED')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const updateSupplyChainStatus = async (status: string) => {
    try {
      setIsLoading(true);
      
      // Update the supply chain status
      await supplyChainService.updateSupplyChainStatus(supplyChainId, status);
      
      // Add a traceability record
      let eventType = 'PROCESSED';
      if (status === 'IN_TRANSIT') eventType = 'SHIPPED';
      if (status === 'DELIVERED') eventType = 'RECEIVED';
      if (status === 'COMPLETED') eventType = 'QUALITY_CHECK';
      
      await traceabilityService.recordSupplyChainEvent({
        productId: supplyChain.productId,
        eventType: eventType as any,
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
      fetchSupplyChainDetails(); // Refresh the data
    } catch (error) {
      console.error('Error updating supply chain status:', error);
      Alert.alert('Error', 'Failed to update supply chain status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTraceability = () => {
    if (!supplyChain?.productId) return;
    router.push(`/traceability/${supplyChain.productId}`);
  };

  const handleGenerateQRCode = async () => {
    try {
      setIsLoading(true);
      
      // Generate QR code for the product
      const response = await traceabilityService.getProductQRCode(supplyChain.productId);
      
      if (response && response.data && response.data.qrCodeUrl) {
        router.push(`/traceability/qr-code?url=${encodeURIComponent(response.data.qrCodeUrl)}&productId=${supplyChain.productId}`);
      } else {
        Alert.alert('Error', 'Failed to generate QR code. Please try again.');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
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
  const getMockSupplyChain = () => {
    return {
      id: supplyChainId || '1',
      name: 'Rice Supply Chain',
      description: 'Supply chain for Organic Rice with logistics services',
      productId: 'prod-123',
      product: {
        name: 'Organic Rice',
        category: 'Grains',
        quantity: 500,
        unit: 'kg',
        images: ['https://via.placeholder.com/150']
      },
      status: 'IN_TRANSIT',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      estimatedEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      farmer: {
        id: 'farmer-123',
        name: 'John Farmer'
      },
      intermediary: {
        id: 'inter-123',
        name: 'Logistics Co.'
      }
    };
  };

  const getMockSupplyChainLinks = () => {
    return [
      {
        id: 'link-1',
        type: 'PRODUCTION',
        fromUser: { name: 'John Farmer', role: 'FARMER' },
        toUser: { name: 'Logistics Co.', role: 'INTERMEDIARY' },
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        location: { lat: 28.6139, lng: 77.2090, name: 'Farm Location' },
        details: {
          productName: 'Organic Rice',
          quantity: 500,
          unit: 'kg'
        }
      },
      {
        id: 'link-2',
        type: 'PROCESSING',
        fromUser: { name: 'Logistics Co.', role: 'INTERMEDIARY' },
        toUser: { name: 'Logistics Co.', role: 'INTERMEDIARY' },
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        location: { lat: 28.6139, lng: 77.2090, name: 'Processing Center' },
        details: {
          processType: 'Cleaning and Packaging',
          duration: '2 days'
        }
      },
      {
        id: 'link-3',
        type: 'SHIPPING',
        fromUser: { name: 'Logistics Co.', role: 'INTERMEDIARY' },
        toUser: { name: 'Distribution Center', role: 'INTERMEDIARY' },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        location: { lat: 28.6139, lng: 77.2090, name: 'Shipping Facility' },
        details: {
          transportMode: 'Truck',
          estimatedArrival: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
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
          <Text className="text-xl font-bold">Supply Chain Details</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-gray-600">Loading supply chain details...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="mt-4 text-lg font-medium text-red-500 text-center">{error}</Text>
          <TouchableOpacity
            className="mt-6 bg-blue-500 py-2 px-6 rounded-lg"
            onPress={fetchSupplyChainDetails}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {/* Supply Chain Overview */}
          <Animated.View 
            entering={FadeIn.delay(100).springify()}
            className="bg-white m-4 rounded-xl shadow-sm overflow-hidden"
          >
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-bold">{supplyChain.name || 'Supply Chain'}</Text>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(supplyChain.status)}`}>
                  <Text className="text-white text-xs font-medium">{formatStatus(supplyChain.status)}</Text>
                </View>
              </View>
              
              <Text className="text-gray-600 mb-4">{supplyChain.description}</Text>
              
              <View className="flex-row mb-4">
                {supplyChain.product?.images && supplyChain.product.images[0] && (
                  <Image
                    source={{ uri: supplyChain.product.images[0] }}
                    className="w-20 h-20 rounded-lg mr-4"
                    resizeMode="cover"
                  />
                )}
                
                <View className="flex-1">
                  <Text className="text-lg font-medium">{supplyChain.product?.name || 'Product'}</Text>
                  <Text className="text-gray-600">{supplyChain.product?.category || 'Category'}</Text>
                  <Text className="text-gray-600">
                    {supplyChain.product?.quantity || 0} {supplyChain.product?.unit || 'units'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <View>
                  <Text className="text-xs text-gray-500">Start Date</Text>
                  <Text className="font-medium">{formatDate(supplyChain.startDate)}</Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Estimated Completion</Text>
                  <Text className="font-medium">{formatDate(supplyChain.estimatedEndDate)}</Text>
                </View>
              </View>
              
              <View className="flex-row justify-between mb-4">
                <View>
                  <Text className="text-xs text-gray-500">Farmer</Text>
                  <Text className="font-medium">{supplyChain.farmer?.name || 'Unknown'}</Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Intermediary</Text>
                  <Text className="font-medium">{supplyChain.intermediary?.name || 'Unknown'}</Text>
                </View>
              </View>
              
              <View className="flex-row flex-wrap justify-between">
                <TouchableOpacity
                  className="bg-blue-500 px-3 py-2 rounded-lg flex-row items-center mb-2"
                  onPress={handleUpdateStatus}
                >
                  <Ionicons name="refresh-outline" size={16} color="white" />
                  <Text className="text-white font-medium ml-1">Update Status</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="bg-green-500 px-3 py-2 rounded-lg flex-row items-center mb-2"
                  onPress={handleAddTraceabilityRecord}
                >
                  <Ionicons name="add-circle-outline" size={16} color="white" />
                  <Text className="text-white font-medium ml-1">Add Record</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="bg-purple-500 px-3 py-2 rounded-lg flex-row items-center mb-2"
                  onPress={handleViewTraceability}
                >
                  <Ionicons name="git-branch-outline" size={16} color="white" />
                  <Text className="text-white font-medium ml-1">View Traceability</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="bg-orange-500 px-3 py-2 rounded-lg flex-row items-center mb-2"
                  onPress={handleGenerateQRCode}
                >
                  <Ionicons name="qr-code-outline" size={16} color="white" />
                  <Text className="text-white font-medium ml-1">Generate QR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
          
          {/* Supply Chain Timeline */}
          <View className="px-4 mb-4">
            <Text className="text-lg font-bold mb-2">Supply Chain Timeline</Text>
            
            {supplyChainLinks.length === 0 ? (
              <View className="bg-white p-4 rounded-xl items-center">
                <Text className="text-gray-500">No timeline events found</Text>
              </View>
            ) : (
              <View className="bg-white rounded-xl overflow-hidden">
                {supplyChainLinks.map((link, index) => (
                  <Animated.View 
                    key={link.id}
                    entering={FadeInDown.delay(index * 100).springify()}
                    className={`p-4 border-l-4 ${getBorderColor(link.type)} ${
                      index !== supplyChainLinks.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="font-bold">{formatLinkType(link.type)}</Text>
                        <Text className="text-gray-600 text-sm">
                          {formatDateTime(link.timestamp)}
                        </Text>
                        
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="person-outline" size={14} color="#666" />
                          <Text className="text-gray-600 text-sm ml-1">
                            From: {link.fromUser?.name || 'Unknown'}
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="person-outline" size={14} color="#666" />
                          <Text className="text-gray-600 text-sm ml-1">
                            To: {link.toUser?.name || 'Unknown'}
                          </Text>
                        </View>
                        
                        {link.location && (
                          <View className="flex-row items-center mt-1">
                            <Ionicons name="location-outline" size={14} color="#666" />
                            <Text className="text-gray-600 text-sm ml-1">
                              {link.location.name || 'Unknown location'}
                            </Text>
                          </View>
                        )}
                        
                        {/* Display details based on link type */}
                        {link.details && Object.keys(link.details).length > 0 && (
                          <View className="mt-2 bg-gray-50 p-2 rounded-md">
                            {Object.entries(link.details).map(([key, value]) => (
                              <Text key={key} className="text-gray-600 text-sm">
                                {formatDetailKey(key)}: {formatDetailValue(value)}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                      
                      <View className="bg-gray-100 p-2 rounded-full">
                        <Ionicons name={getLinkIcon(link.type)} size={20} color="#666" />
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          </View>
          
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}

// Helper functions
const getBorderColor = (type: string) => {
  switch (type) {
    case 'PRODUCTION': return 'border-green-500';
    case 'PROCESSING': return 'border-blue-500';
    case 'SHIPPING': return 'border-orange-500';
    case 'DELIVERY': return 'border-purple-500';
    case 'QUALITY_CHECK': return 'border-yellow-500';
    default: return 'border-gray-500';
  }
};

const getLinkIcon = (type: string) => {
  switch (type) {
    case 'PRODUCTION': return 'leaf-outline';
    case 'PROCESSING': return 'construct-outline';
    case 'SHIPPING': return 'car-outline';
    case 'DELIVERY': return 'cube-outline';
    case 'QUALITY_CHECK': return 'checkmark-circle-outline';
    default: return 'ellipsis-horizontal-outline';
  }
};

const formatLinkType = (type: string) => {
  return type.replace('_', ' ');
};

const formatDetailKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatDetailValue = (value: any) => {
  if (value instanceof Date) {
    return formatDateTime(value);
  }
  
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  
  return value;
};
