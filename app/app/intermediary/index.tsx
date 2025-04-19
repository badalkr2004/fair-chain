import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/auth';
import produceService from '../../services/produce';
import bidService from '../../services/bid';

// Mock data for the dashboard (will be replaced with API calls)
const activeTransports = [
  {
    id: '1',
    batchId: 'TR-2023-105',
    product: 'Rice',
    progress: 70,
    pickupDate: '15 Oct, 2023',
    deliveryDate: '18 Oct, 2023',
    status: 'In Transit',
  },
  {
    id: '2',
    batchId: 'TR-2023-098',
    product: 'Potatoes',
    progress: 100,
    pickupDate: '10 Oct, 2023',
    deliveryDate: '12 Oct, 2023',
    status: 'Delivered',
  }
];

export default function IntermediaryDashboard() {
  const [user, setUser] = useState<any>(null);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Fetch user profile and data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDebugInfo(null);
        
        // Get user profile
        try {
          const currentUser = await authService.getCurrentUser();
          if (!currentUser) {
            setDebugInfo("No user found in AsyncStorage. Please log in again.");
            router.replace('/(auth)/login');
            return;
          }
          setUser(currentUser);
          
          // Get full profile from server
          try {
            const profileResponse = await authService.getUserProfile();
            if (profileResponse && profileResponse.user) {
              setUser(profileResponse.user);
            } else {
              setDebugInfo("User profile response format invalid");
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            setDebugInfo(`Profile error: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`);
            // Continue with local user data
          }
        } catch (userError) {
          console.error('Error getting current user:', userError);
          setDebugInfo(`User error: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
          router.replace('/(auth)/login');
          return;
        }

        // Get available produce
        try {
          const produceResponse = await produceService.getAvailableProduce();
          setAvailableJobs(produceResponse?.data || []);
        } catch (produceError) {
          console.error('Error loading available produce:', produceError);
          setDebugInfo(debugInfo => `${debugInfo || ''}\nProduce error: ${produceError instanceof Error ? produceError.message : 'Unknown error'}`);
          setAvailableJobs([]); // Set empty array to avoid undefined errors
        }

        // Get my bids
        try {
          const bidsResponse = await bidService.getMyBids();
          setMyBids(bidsResponse?.bids || []);
        } catch (bidsError) {
          console.error('Error loading bids:', bidsError);
          setDebugInfo(debugInfo => `${debugInfo || ''}\nBids error: ${bidsError instanceof Error ? bidsError.message : 'Unknown error'}`);
          setMyBids([]); // Set empty array to avoid undefined errors
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Pull down to refresh.');
        setDebugInfo(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    // Verify authentication token before refreshing
    authService.validateToken()
      .then(isValid => {
        if (!isValid) {
          router.replace('/(auth)/login');
        }
      });
    
    // Re-fetch dashboard data
    // This will trigger the useEffect above
  };

  // Navigate to bid screen
  const navigateToBidScreen = (productId: string) => {
    router.push({
      pathname: '/(app)/intermediary/place-bid',
      params: { productId }
    } as any);
  };

  // Handle profile navigation
  const navigateToProfile = () => {
    router.push('/intermediary/profile' as any);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAF5]">
        <ActivityIndicator size="large" color="#d97706" />
        <Text className="mt-4 text-gray-600">Loading your dashboard...</Text>
      </View>
    );
  }

  // Get user name or fallback
  const userName = user?.name || 'Intermediary User';
  const businessType = user?.intermediaryProfile?.type || 'LOGISTICS';
  // Format business type for display
  const formattedBusinessType = businessType.charAt(0) + businessType.slice(1).toLowerCase();

  return (
    <View className="flex-1 bg-[#F8FAF5]">
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#d97706']}
            tintColor="#d97706"
          />
        }
      >
        <View className="px-6 pt-16">
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-2xl font-bold text-amber-800">{formattedBusinessType} Dashboard</Text>
              <Text className="text-gray-600">Welcome back, {userName}</Text>
            </View>
            <TouchableOpacity 
              className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center"
              onPress={navigateToProfile}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <Ionicons name="business" size={24} color="#d97706" />
              )}
            </TouchableOpacity>
          </View>

          {error && (
            <View className="bg-red-50 p-4 rounded-lg mb-4">
              <Text className="text-red-500 font-medium">{error}</Text>
              {debugInfo && __DEV__ && (
                <Text className="text-red-400 text-xs mt-2">{debugInfo}</Text>
              )}
              <TouchableOpacity 
                className="bg-red-100 py-2 px-4 rounded-lg mt-2 self-start"
                onPress={handleRefresh}
              >
                <Text className="text-red-700">Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          <Animated.View 
            className="bg-amber-600 rounded-xl p-5 mb-8"
            entering={FadeInDown.delay(200).duration(500)}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="analytics-outline" size={24} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">Business Summary</Text>
            </View>
            <View className="flex-row justify-between">
              <View className="bg-white/20 rounded-lg p-3 flex-1 mr-2">
                <Text className="text-white text-xs mb-1">Active Jobs</Text>
                <Text className="text-white font-semibold">{activeTransports.length}</Text>
              </View>
              <View className="bg-white/20 rounded-lg p-3 flex-1 mr-2">
                <Text className="text-white text-xs mb-1">Available Jobs</Text>
                <Text className="text-white font-semibold">{availableJobs.length}</Text>
              </View>
              <View className="bg-white/20 rounded-lg p-3 flex-1">
                <Text className="text-white text-xs mb-1">My Bids</Text>
                <Text className="text-white font-semibold">{myBids.length}</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-800">Available Jobs</Text>
              <TouchableOpacity
                onPress={() => router.push('/intermediary/available-jobs' as any)}
                className="flex-row items-center"
              >
                <Text className="text-amber-600 mr-1">View All</Text>
                <Ionicons name="arrow-forward" size={16} color="#d97706" />
              </TouchableOpacity>
            </View>

            {availableJobs.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center justify-center mb-4">
                <Ionicons name="search" size={40} color="#d1d5db" />
                <Text className="text-gray-500 mt-2">No available jobs found</Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Pull down to refresh or check back later
                </Text>
              </View>
            ) : (
              availableJobs.slice(0, 3).map((job) => (
                <TouchableOpacity 
                  key={job.id}
                  className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm"
                  onPress={() => navigateToBidScreen(job.id)}
                >
                  {job.images && job.images.length > 0 ? (
                    <Image
                      source={{ uri: job.images[0] }}
                      className="h-32 w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-32 bg-gray-200 items-center justify-center">
                      <Ionicons name="image-outline" size={40} color="#9ca3af" />
                    </View>
                  )}
                  <View className="p-4">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-lg font-semibold text-gray-800">{job.name}</Text>
                      <Text className="text-amber-600 font-medium">₹{job.basePrice}/{job.unit}</Text>
                    </View>
                    <View className="flex-row items-center mb-3">
                      <Text className="text-gray-600 mr-2">Quantity: {job.quantity} {job.unit}</Text>
                      <Text className="text-gray-600">Category: {job.category}</Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        {job.location && (
                          <View className="flex-row items-center">
                            <Ionicons name="location" size={14} color="#6b7280" />
                            <Text className="text-gray-500 text-sm ml-1">
                              {job.location.lat && job.location.lng 
                                ? `Location: ${job.location.lat.toFixed(2)}, ${job.location.lng.toFixed(2)}`
                                : 'Location available'}
                            </Text>
                          </View>
                        )}
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="calendar" size={14} color="#6b7280" />
                          <Text className="text-gray-500 text-sm ml-1">
                            Available until: {new Date(job.availableUntil).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        className="bg-amber-100 px-3 py-2 rounded-lg"
                        onPress={() => navigateToBidScreen(job.id)}
                      >
                        <Text className="text-amber-700 font-medium">Bid Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </Animated.View>

          {/* My Bids Section */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <View className="flex-row justify-between items-center mb-4 mt-6">
              <Text className="text-xl font-semibold text-gray-800">My Bids</Text>
              <TouchableOpacity
                onPress={() => router.push('/intermediary/my-bids' as any)}
                className="flex-row items-center"
              >
                <Text className="text-amber-600 mr-1">View All</Text>
                <Ionicons name="arrow-forward" size={16} color="#d97706" />
              </TouchableOpacity>
            </View>

            {myBids.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center justify-center mb-6">
                <Ionicons name="documents-outline" size={40} color="#d1d5db" />
                <Text className="text-gray-500 mt-2">No bids placed yet</Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Browse available jobs and place your first bid
                </Text>
              </View>
            ) : (
              myBids.slice(0, 2).map((bid) => (
                <View key={bid.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-lg font-semibold text-gray-800">{bid.product?.name || 'Product'}</Text>
                    <View className={`px-3 py-1 rounded-full ${
                      bid.status === 'ACCEPTED' ? 'bg-green-100' : 
                      bid.status === 'REJECTED' ? 'bg-red-100' : 
                      'bg-amber-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        bid.status === 'ACCEPTED' ? 'text-green-700' : 
                        bid.status === 'REJECTED' ? 'text-red-700' : 
                        'text-amber-700'
                      }`}>
                        {bid.status}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <Text className="text-gray-600 mr-2">Your bid: ₹{bid.price}</Text>
                    <Text className="text-gray-600">Quantity: {bid.quantity}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar" size={14} color="#6b7280" />
                      <Text className="text-gray-500 text-sm ml-1">
                        Valid until: {new Date(bid.validUntil).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      className="bg-gray-100 px-3 py-2 rounded-lg"
                      onPress={() => router.push({
                        pathname: '/intermediary/bid-details',
                        params: { bidId: bid.id }
                      } as any)}
                    >
                      <Text className="text-gray-700">Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(800).duration(500)} 
            className="bg-white rounded-xl p-6 mb-8 mt-2"
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="notifications-outline" size={24} color="#d97706" />
              <Text className="text-lg font-semibold text-gray-800 ml-2">Updates</Text>
            </View>
            <Text className="text-gray-600 mb-4">
              Stay informed about your bids and current market conditions.
            </Text>
            <TouchableOpacity
              className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-3"
            >
              <Text className="text-amber-800 font-medium mb-1">Market Insight</Text>
              <Text className="text-gray-600 text-sm">
                Rice prices are trending 15% higher than last month. Good time to place competitive bids!
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-amber-50 p-3 rounded-lg border border-amber-200"
            >
              <Text className="text-amber-800 font-medium mb-1">System Update</Text>
              <Text className="text-gray-600 text-sm">
                New traceability features have been added. Track your shipments in real-time.
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-3 pb-8 flex-row justify-between border-t border-gray-200">
        <TouchableOpacity className="items-center">
          <Ionicons name="home" size={24} color="#d97706" />
          <Text className="text-amber-600 text-xs mt-1">Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center"
          onPress={() => router.push('/intermediary/bids' as any)}
        >
          <Ionicons name="list" size={24} color="#9ca3af" />
          <Text className="text-gray-500 text-xs mt-1">My Bids</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center"
          onPress={() => router.push('/intermediary/available-jobs' as any)}
        >
          <Ionicons name="briefcase" size={24} color="#9ca3af" />
          <Text className="text-gray-500 text-xs mt-1">Jobs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center"
          onPress={navigateToProfile}
        >
          <Ionicons name="person" size={24} color="#9ca3af" />
          <Text className="text-gray-500 text-xs mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 