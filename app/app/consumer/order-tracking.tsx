import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ordersService from '../../services/orders';
import * as traceabilityService from '../../services/traceability';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
// Using dimensions for layout calculations
const { width } = Dimensions.get('window');

// Types
interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface SupplyChainLink {
  id: string;
  type: string;
  fromUserId: string;
  toUserId: string;
  fromUser?: {
    name: string;
    role: string;
  };
  toUser?: {
    name: string;
    role: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  details?: any;
}

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const orderId = id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [supplyChainLinks, setSupplyChainLinks] = useState<SupplyChainLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'tracking' | 'traceability'>('tracking');
  const [mapRegion, setMapRegion] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setError('Order ID is missing');
      setIsLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async (orderIdParam: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get order details
      const orderResponse = await ordersService.getOrderById(orderId);
      
      if (orderResponse && typeof orderResponse === 'object' && 'data' in orderResponse && orderResponse.data) {
        const orderData = orderResponse.data as any;
        setOrder(orderData);
        
        // Get order tracking events
        const trackingResponse = await ordersService.getOrderTracking(orderId);
        if (trackingResponse && typeof trackingResponse === 'object' && 'data' in trackingResponse && 
            trackingResponse.data && typeof trackingResponse.data === 'object' && 'events' in trackingResponse.data) {
          const trackingData = trackingResponse.data as any;
          setTrackingEvents(trackingData.events as TrackingEvent[]);
          
          // Set map region based on the latest event with coordinates
          const eventsWithCoordinates = (trackingData.events as TrackingEvent[]).filter(
            (event: TrackingEvent) => event.coordinates
          );
          
          if (eventsWithCoordinates.length > 0) {
            const latestEvent = eventsWithCoordinates[eventsWithCoordinates.length - 1];
            setMapRegion({
              latitude: latestEvent.coordinates!.lat,
              longitude: latestEvent.coordinates!.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }
        } else {
          // Generate mock tracking events based on order status
          const orderData = orderResponse.data as any;
          const mockEvents = getMockTrackingEvents(orderData.status);
          setTrackingEvents(mockEvents);
          
          // Set map region based on the latest mock event with coordinates
          const eventsWithCoordinates = mockEvents.filter(event => event.coordinates);
          if (eventsWithCoordinates.length > 0) {
            const latestEvent = eventsWithCoordinates[eventsWithCoordinates.length - 1];
            setMapRegion({
              latitude: latestEvent.coordinates!.lat,
              longitude: latestEvent.coordinates!.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }
        }
        
        // Get supply chain traceability data
        if (orderData.items && orderData.items.length > 0) {
          const productId = orderData.items[0].productId;
          
          try {
            // Use the correct method from the traceability service
            // Create a new instance to access the instance methods
            const traceabilityServiceInstance = new (require('../../services/traceability').default.constructor)();
            const traceabilityResponse = await traceabilityServiceInstance.getProductTraceability(productId);
            if (traceabilityResponse && traceabilityResponse.data && traceabilityResponse.data.supplyChain) {
              setSupplyChainLinks(traceabilityResponse.data.supplyChain.links || []);
            } else {
              // Generate mock supply chain links
              setSupplyChainLinks(getMockSupplyChainLinks());
            }
          } catch (error) {
            console.error('Error fetching product traceability:', error);
            // Generate mock supply chain links
            setSupplyChainLinks(getMockSupplyChainLinks());
          }
        }
      } else {
        setError('Order not found');
        
        // Use mock data for development
        const mockOrder = getMockOrder();
        setOrder(mockOrder);
        setTrackingEvents(getMockTrackingEvents(mockOrder.status));
        setSupplyChainLinks(getMockSupplyChainLinks());
        
        // Set default map region
        setMapRegion({
          latitude: 12.9716,
          longitude: 77.5946,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      setError('Failed to load order tracking. Please try again.');
      
      // Use mock data for development
      const mockOrder = getMockOrder();
      setOrder(mockOrder);
      setTrackingEvents(getMockTrackingEvents(mockOrder.status));
      setSupplyChainLinks(getMockSupplyChainLinks());
      
      // Set default map region
      setMapRegion({
        latitude: 12.9716,
        longitude: 77.5946,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrderDetails = () => {
    router.push({
      pathname: '/consumer/orders',
      params: { id: orderId }
    });
  };

  const handleVerifyProduct = (productId: string) => {
    router.push({
      pathname: '/traceability/[id]',
      params: { id: productId }
    });
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, { bg: string, text: string }> = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700' },
      PROCESSING: { bg: 'bg-purple-100', text: 'text-purple-700' },
      SHIPPED: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
      OUT_FOR_DELIVERY: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-700' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700' },
      RETURNED: { bg: 'bg-gray-100', text: 'text-gray-700' }
    };
    
    return statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  // Mock data for development
  const getMockOrder = () => {
    return {
      id: orderId || '1',
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      totalAmount: 2500,
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      shippingAddress: '123 Main St, Bangalore, Karnataka, 560001',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          id: '1',
          productId: 'prod-123',
          quantity: 10,
          unitPrice: 150,
          totalPrice: 1500,
          product: {
            name: 'Organic Rice',
            category: 'Grains',
            images: ['https://via.placeholder.com/150'],
            unit: 'kg'
          }
        },
        {
          id: '2',
          productId: 'prod-456',
          quantity: 5,
          unitPrice: 200,
          totalPrice: 1000,
          product: {
            name: 'Fresh Tomatoes',
            category: 'Vegetables',
            images: ['https://via.placeholder.com/150'],
            unit: 'kg'
          }
        }
      ]
    };
  };

  const getMockTrackingEvents = (status: string): TrackingEvent[] => {
    const now = new Date();
    const events: TrackingEvent[] = [
      {
        id: '1',
        status: 'PENDING',
        description: 'Order placed',
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Online',
        coordinates: {
          lat: 12.9716,
          lng: 77.5946
        }
      },
      {
        id: '2',
        status: 'CONFIRMED',
        description: 'Order confirmed',
        timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Seller Warehouse',
        coordinates: {
          lat: 12.9819,
          lng: 77.6036
        }
      }
    ];
    
    if (['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      events.push({
        id: '3',
        status: 'PROCESSING',
        description: 'Order is being processed',
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Seller Warehouse',
        coordinates: {
          lat: 12.9819,
          lng: 77.6036
        }
      });
    }
    
    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      events.push({
        id: '4',
        status: 'SHIPPED',
        description: 'Order has been shipped',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Distribution Center',
        coordinates: {
          lat: 12.9592,
          lng: 77.6974
        }
      });
    }
    
    if (['OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      events.push({
        id: '5',
        status: 'OUT_FOR_DELIVERY',
        description: 'Order is out for delivery',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Local Delivery Center',
        coordinates: {
          lat: 12.9352,
          lng: 77.6245
        }
      });
    }
    
    if (status === 'DELIVERED') {
      events.push({
        id: '6',
        status: 'DELIVERED',
        description: 'Order has been delivered',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        location: 'Customer Address',
        coordinates: {
          lat: 12.9279,
          lng: 77.6271
        }
      });
    }
    
    return events;
  };

  const getMockSupplyChainLinks = (): SupplyChainLink[] => {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'HARVEST',
        fromUserId: 'farmer-1',
        toUserId: 'farmer-1',
        fromUser: {
          name: 'John Farmer',
          role: 'FARMER'
        },
        toUser: {
          name: 'John Farmer',
          role: 'FARMER'
        },
        location: {
          lat: 13.0827,
          lng: 77.5877
        },
        timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        details: {
          harvestDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          quantity: 1000,
          unit: 'kg'
        }
      },
      {
        id: '2',
        type: 'PROCESSING',
        fromUserId: 'farmer-1',
        toUserId: 'processor-1',
        fromUser: {
          name: 'John Farmer',
          role: 'FARMER'
        },
        toUser: {
          name: 'ABC Processing',
          role: 'INTERMEDIARY'
        },
        location: {
          lat: 13.0001,
          lng: 77.5543
        },
        timestamp: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        details: {
          processType: 'Cleaning and Sorting',
          quantity: 950,
          unit: 'kg'
        }
      },
      {
        id: '3',
        type: 'PACKAGING',
        fromUserId: 'processor-1',
        toUserId: 'packager-1',
        fromUser: {
          name: 'ABC Processing',
          role: 'INTERMEDIARY'
        },
        toUser: {
          name: 'XYZ Packaging',
          role: 'INTERMEDIARY'
        },
        location: {
          lat: 12.9819,
          lng: 77.6036
        },
        timestamp: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        details: {
          packagingType: 'Eco-friendly bags',
          quantity: 950,
          unit: 'kg'
        }
      },
      {
        id: '4',
        type: 'DISTRIBUTION',
        fromUserId: 'packager-1',
        toUserId: 'distributor-1',
        fromUser: {
          name: 'XYZ Packaging',
          role: 'INTERMEDIARY'
        },
        toUser: {
          name: 'Fast Logistics',
          role: 'INTERMEDIARY'
        },
        location: {
          lat: 12.9592,
          lng: 77.6974
        },
        timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        details: {
          transportType: 'Refrigerated Truck',
          quantity: 950,
          unit: 'kg'
        }
      },
      {
        id: '5',
        type: 'RETAIL',
        fromUserId: 'distributor-1',
        toUserId: 'retailer-1',
        fromUser: {
          name: 'Fast Logistics',
          role: 'INTERMEDIARY'
        },
        toUser: {
          name: 'Green Mart',
          role: 'RETAILER'
        },
        location: {
          lat: 12.9352,
          lng: 77.6245
        },
        timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        details: {
          storeId: 'STORE-123',
          quantity: 50,
          unit: 'kg'
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
          <Text className="text-xl font-bold">Order Tracking</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-gray-600">Loading order tracking...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="mt-4 text-lg font-medium text-red-500 text-center">{error}</Text>
          <TouchableOpacity
            className="mt-6 bg-blue-500 py-2 px-6 rounded-lg"
            onPress={() => {
              const onRefresh = () => {
                if (orderId) {
                  fetchOrderDetails(orderId);
                }
              };
              onRefresh();
            }}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {/* Order Summary */}
          <Animated.View 
            entering={FadeIn.delay(100).springify()}
            className="bg-white m-4 rounded-xl shadow-sm overflow-hidden"
          >
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold">Order #{order.orderId}</Text>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status).bg}`}>
                  <Text className={`text-xs font-medium ${getStatusColor(order.status).text}`}>
                    {formatStatus(order.status)}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center mb-3">
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text className="text-gray-600 ml-1">
                  Ordered on {formatDate(order.createdAt)}
                </Text>
              </View>
              
              <View className="flex-row items-center mb-3">
                <Ionicons name="cash-outline" size={16} color="#666" />
                <Text className="text-gray-600 ml-1">
                  Total: ₹{order.totalAmount.toFixed(2)}
                </Text>
              </View>
              
              <TouchableOpacity
                className="bg-blue-500 py-2 px-4 rounded-lg self-start"
                onPress={handleViewOrderDetails}
              >
                <Text className="text-white font-medium">View Order Details</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          {/* Tab Navigation */}
          <View className="flex-row bg-white mx-4 rounded-xl overflow-hidden mb-4">
            <TouchableOpacity
              className={`flex-1 py-3 ${selectedTab === 'tracking' ? 'bg-green-500' : 'bg-white'}`}
              onPress={() => setSelectedTab('tracking')}
            >
              <Text className={`text-center font-medium ${selectedTab === 'tracking' ? 'text-white' : 'text-gray-700'}`}>
                Tracking
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 py-3 ${selectedTab === 'traceability' ? 'bg-green-500' : 'bg-white'}`}
              onPress={() => setSelectedTab('traceability')}
            >
              <Text className={`text-center font-medium ${selectedTab === 'traceability' ? 'text-white' : 'text-gray-700'}`}>
                Traceability
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tracking Tab Content */}
          {selectedTab === 'tracking' && (
            <Animated.View entering={FadeIn.delay(200).springify()}>
              {/* Location View */}
              <View className="mx-4 mb-4 rounded-xl overflow-hidden">
                <View className="bg-blue-50 p-4 rounded-xl">
                  <Text className="font-bold mb-2 text-blue-800">Current Location</Text>
                  {trackingEvents
                    .filter(event => event.coordinates)
                    .slice(-1)
                    .map(event => (
                      <View key={event.id} className="bg-white p-3 rounded-lg">
                        <Text className="font-medium">{formatStatus(event.status)}</Text>
                        <Text className="text-gray-600 mb-1">{event.description}</Text>
                        <View className="flex-row items-center">
                          <Ionicons name="location-outline" size={16} color="#4b5563" />
                          <Text className="text-gray-600 ml-1">
                            {event.location} ({event.coordinates?.lat.toFixed(4)}, {event.coordinates?.lng.toFixed(4)})
                          </Text>
                        </View>
                      </View>
                    ))}
                </View>
              </View>
              
              {/* Tracking Timeline */}
              <View className="bg-white mx-4 rounded-xl p-4 mb-4">
                <Text className="text-lg font-bold mb-4">Tracking Timeline</Text>
                
                {trackingEvents.map((event, index) => (
                  <Animated.View 
                    key={event.id}
                    entering={FadeInDown.delay(index * 100).springify()}
                    className="mb-4 last:mb-0"
                  >
                    <View className="flex-row">
                      {/* Timeline Line */}
                      <View className="items-center mr-4">
                        <View className={`w-4 h-4 rounded-full ${
                          event.status === 'DELIVERED' ? 'bg-green-500' :
                          event.status === 'CANCELLED' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        {index < trackingEvents.length - 1 && (
                          <View className="w-0.5 h-16 bg-gray-300" />
                        )}
                      </View>
                      
                      {/* Event Details */}
                      <View className="flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="font-bold text-base">{formatStatus(event.status)}</Text>
                          <Text className="text-xs text-gray-500">{formatDateTime(event.timestamp)}</Text>
                        </View>
                        
                        <Text className="text-gray-700 mb-1">{event.description}</Text>
                        
                        {event.location && (
                          <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={14} color="#666" />
                            <Text className="text-gray-600 text-sm ml-1">{event.location}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}
          
          {/* Traceability Tab Content */}
          {selectedTab === 'traceability' && (
            <Animated.View entering={FadeIn.delay(200).springify()}>
              {/* Product Traceability */}
              <View className="bg-white mx-4 rounded-xl p-4 mb-4">
                <Text className="text-lg font-bold mb-4">Product Journey</Text>
                
                {supplyChainLinks.map((link, index) => (
                  <Animated.View 
                    key={link.id}
                    entering={FadeInDown.delay(index * 100).springify()}
                    className="mb-4 last:mb-0"
                  >
                    <View className="flex-row">
                      {/* Timeline Line */}
                      <View className="items-center mr-4">
                        <View className="w-4 h-4 rounded-full bg-green-500" />
                        {index < supplyChainLinks.length - 1 && (
                          <View className="w-0.5 h-24 bg-gray-300" />
                        )}
                      </View>
                      
                      {/* Link Details */}
                      <View className="flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="font-bold text-base">{link.type}</Text>
                          <Text className="text-xs text-gray-500">{formatDate(link.timestamp)}</Text>
                        </View>
                        
                        <View className="bg-gray-50 p-3 rounded-lg mb-2">
                          <View className="flex-row mb-1">
                            <Text className="text-gray-600 w-20">From:</Text>
                            <Text className="text-gray-800 font-medium">{link.fromUser?.name || 'Unknown'}</Text>
                          </View>
                          
                          <View className="flex-row mb-1">
                            <Text className="text-gray-600 w-20">To:</Text>
                            <Text className="text-gray-800 font-medium">{link.toUser?.name || 'Unknown'}</Text>
                          </View>
                          
                          {link.details && Object.keys(link.details).map(key => (
                            <View key={key} className="flex-row">
                              <Text className="text-gray-600 w-20">{formatKey(key)}:</Text>
                              <Text className="text-gray-800">{formatValue(link.details[key])}</Text>
                            </View>
                          ))}
                        </View>
                        
                        {link.location && (
                          <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={14} color="#666" />
                            <Text className="text-gray-600 text-sm ml-1">
                              {`${link.location.lat.toFixed(4)}, ${link.location.lng.toFixed(4)}`}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
              
              {/* Verify Product */}
              {order.items && order.items.length > 0 && (
                <View className="mx-4 mb-4">
                  <TouchableOpacity
                    className="bg-purple-500 py-3 px-4 rounded-lg flex-row justify-center items-center"
                    onPress={() => handleVerifyProduct(order.items[0].productId)}
                  >
                    <Ionicons name="shield-checkmark-outline" size={18} color="white" />
                    <Text className="text-white font-medium ml-2">Verify Product Authenticity</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          )}
          
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}

// Helper functions
const formatKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatValue = (value: any) => {
  if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
    return formatDate(value);
  }
  
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  
  return value;
};
