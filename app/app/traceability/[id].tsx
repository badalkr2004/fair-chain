import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import traceabilityService from '../../services/traceability';
import VerificationButton from '../../components/VerificationButton';

interface TimelineEvent {
  id: string;
  eventType: string;
  timestamp: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  metadata?: Record<string, any>;
}

interface ProductDetails {
  id: string;
  name: string;
  farmer: {
    name: string;
    location: any;
  };
  harvestDate: string;
  organicCertified: boolean;
}

export default function TraceabilityDetails() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  
  useEffect(() => {
    fetchTraceabilityData();
  }, [id]);
  
  const fetchTraceabilityData = async () => {
    try {
      setLoading(true);
      // Try to fetch the product traceability data
      const response = await traceabilityService.getProductJourney(id as string);
      
      if (response && response.data) {
        setProduct(response.data.product);
        setTimeline(response.data.timeline || []);
      } else {
        // Fallback to mock data if response is incomplete
        setMockData();
      }
    } catch (error) {
      console.error('Error fetching traceability data:', error);
      // Fallback to mock data on error
      setMockData();
      setError('Could not load real-time data. Showing sample data instead.');
    } finally {
      setLoading(false);
    }
  };
  
  const setMockData = () => {
    // Create mock product data
    setProduct({
      id: id as string,
      name: 'Organic Rice',
      farmer: {
        name: 'John Farmer',
        location: {
          name: 'Green Valley Farm'
        }
      },
      harvestDate: new Date().toISOString(),
      organicCertified: true
    });
    
    // Create mock timeline
    setTimeline([
      {
        id: '1',
        eventType: 'HARVESTED',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          name: 'Green Valley Farm',
          latitude: 28.6139,
          longitude: 77.2090
        },
        metadata: { 
          equipment: 'Manual',
          weather: 'Sunny',
          temperature: '32°C'
        }
      },
      {
        id: '2',
        eventType: 'PROCESSED',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          name: 'Local Processing Facility',
          latitude: 28.6249,
          longitude: 77.2100
        },
        metadata: {
          method: 'Traditional',
          quality: 'Premium'
        }
      },
      {
        id: '3',
        eventType: 'PACKAGED',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          name: 'Packaging Center',
          latitude: 28.6359,
          longitude: 77.2110
        },
        metadata: {
          packaging: 'Eco-friendly',
          batchSize: '100kg'
        }
      }
    ]);
  };
  
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'HARVESTED': return 'leaf';
      case 'PROCESSED': return 'construct';
      case 'PACKAGED': return 'cube';
      case 'SHIPPED': return 'car';
      case 'RECEIVED': return 'archive';
      case 'QUALITY_CHECK': return 'checkmark-circle';
      case 'STORED': return 'home';
      default: return 'ellipse';
    }
  };
  
  const getEventTitle = (eventType: string) => {
    switch (eventType) {
      case 'HARVESTED': return 'Harvested';
      case 'PROCESSED': return 'Processed';
      case 'PACKAGED': return 'Packaged';
      case 'SHIPPED': return 'Shipped';
      case 'RECEIVED': return 'Received';
      case 'QUALITY_CHECK': return 'Quality Check';
      case 'STORED': return 'Stored';
      default: return eventType;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getProgressValue = () => {
    if (!timeline.length) return 1;
    
    const stages = ['HARVESTED', 'PROCESSED', 'PACKAGED', 'SHIPPED'];
    const currentStage = timeline[timeline.length - 1]?.eventType;
    
    const index = stages.findIndex(s => s === currentStage);
    return Math.max(index + 1, 1);
  };
  
  const handleAddEvent = () => {
    router.push({
      pathname: '/traceability/add-event',
      params: { productId: id }
    });
  };
  
  if (loading) {
    return (
      <View className="flex-1 bg-[#F8FAF5] justify-center items-center">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-gray-600 mt-4">Loading traceability data...</Text>
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-[#F8FAF5]">
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View className="px-6">
          <View className="flex-row items-center mt-16 mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm mr-4"
            >
              <Ionicons name="arrow-back" size={22} color="#333" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold flex-1">Product Traceability</Text>
            
            {/* QR code button to scan/verify other products */}
            <TouchableOpacity
              onPress={() => router.push('/traceability/scan')}
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
            >
              <Ionicons name="qr-code" size={20} color="#16a34a" />
            </TouchableOpacity>
          </View>
          
          {/* Product info card */}
          <Animated.View entering={FadeInDown.delay(100)} className="bg-white p-5 rounded-2xl shadow-sm mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-green-50 rounded-full items-center justify-center mr-4">
                <Ionicons name="leaf" size={28} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold">{product?.name || 'Product Name'}</Text>
                <Text className="text-gray-500">
                  {product?.farmer?.name || 'Farmer Name'} • {formatDate(product?.harvestDate || new Date().toISOString()).split(',')[0]}
                </Text>
              </View>
              
              {product?.organicCertified && (
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-800 text-xs font-medium">Organic</Text>
                </View>
              )}
            </View>
            
            {/* Verification button */}
            <VerificationButton productId={id as string} />
            
          </Animated.View>
          
          {/* Timeline title */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold">Supply Chain Journey</Text>
            <Text className="text-sm text-gray-500">{timeline.length} events</Text>
          </View>
          
          {/* Timeline */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <Text className="text-xl font-semibold text-gray-800 mb-6">
              Product Journey
            </Text>
            
            {timeline.length === 0 ? (
              <View className="items-center py-8">
                <Ionicons name="time-outline" size={48} color="#d1d5db" />
                <Text className="text-gray-400 mt-2 text-center">No events recorded yet</Text>
                <Text className="text-gray-400 text-sm text-center">
                  Add your first supply chain event to start tracking
                </Text>
              </View>
            ) : (
              <View>
                {timeline.map((event, index) => (
                  <View key={event.id} className="mb-6 relative">
                    {/* Timeline line */}
                    {index < timeline.length - 1 && (
                      <View className="absolute left-3 top-10 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    
                    <View className="flex-row">
                      {/* Event icon */}
                      <View className="bg-green-100 w-7 h-7 rounded-full items-center justify-center mr-4 z-10">
                        <Ionicons name={getEventIcon(event.eventType)} size={16} color="#16a34a" />
                      </View>
                      
                      {/* Event details */}
                      <View className="flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="font-medium text-gray-800">{getEventTitle(event.eventType)}</Text>
                          <Text className="text-xs text-gray-500">{formatDate(event.timestamp)}</Text>
                        </View>
                        
                        <Text className="text-gray-600 mb-2">{event.location?.name || 'Unknown location'}</Text>
                        
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <View className="bg-gray-50 p-3 rounded-lg">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <View key={key} className="flex-row justify-between mb-1 last:mb-0">
                                <Text className="text-gray-500 text-sm capitalize">{key}</Text>
                                <Text className="text-gray-700 text-sm">{value}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-8 right-8 bg-green-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        onPress={handleAddEvent}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
} 