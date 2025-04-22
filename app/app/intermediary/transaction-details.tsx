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
import transactionService from '../../services/transaction';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const transactionId = id as string;
  
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionId) {
      fetchTransactionDetails();
    } else {
      setError('Transaction ID is missing');
      setIsLoading(false);
    }
  }, [transactionId]);

  const fetchTransactionDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get transaction details
      const response = await transactionService.getTransactionById(transactionId);
      
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        setTransaction(response.data);
      } else {
        setError('Transaction not found');
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      setError('Failed to load transaction details. Please try again.');
      
      // Use mock data for development
      setTransaction(getMockTransaction());
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = () => {
    if (!transaction) return;
    
    if (transaction.status === 'COMPLETED' || transaction.status === 'CANCELLED') {
      Alert.alert('Cannot Update', 'This transaction is already finalized and cannot be updated.');
      return;
    }
    
    Alert.alert(
      'Update Transaction Status',
      'What would you like to do with this transaction?',
      [
        {
          text: 'Mark as Completed',
          onPress: () => updateTransactionStatus('COMPLETED')
        },
        {
          text: 'Mark as Cancelled',
          onPress: () => updateTransactionStatus('CANCELLED')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const updateTransactionStatus = async (status: string) => {
    try {
      setIsLoading(true);
      
      // Update the transaction status
      await transactionService.updateTransactionStatus(transactionId, status);
      
      Alert.alert('Success', 'Transaction status updated successfully');
      fetchTransactionDetails(); // Refresh the data
    } catch (error) {
      console.error('Error updating transaction status:', error);
      Alert.alert('Error', 'Failed to update transaction status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProduct = () => {
    if (!transaction?.productId) return;
    router.push({
      pathname: '/consumer/product-details',
      params: { id: transaction.productId }
    });
  };

  const handleViewSupplyChain = () => {
    if (!transaction?.productId) return;
    router.push({
      pathname: '/traceability/[id]',
      params: { id: transaction.productId }
    });
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'PROCESSING': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  // Mock data for development
  const getMockTransaction = () => {
    return {
      id: transactionId || '1',
      type: 'SALE',
      amount: 25000,
      currency: 'INR',
      quantity: 500,
      unit: 'kg',
      productId: 'prod-123',
      product: {
        name: 'Organic Rice',
        category: 'Grains',
        images: ['https://via.placeholder.com/150']
      },
      senderId: 'sender-123',
      sender: {
        name: 'John Farmer',
        role: 'FARMER'
      },
      receiverId: 'receiver-123',
      receiver: {
        name: 'Logistics Co.',
        role: 'INTERMEDIARY'
      },
      status: 'PENDING',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      metadata: {
        bidId: 'bid-123',
        serviceType: 'LOGISTICS',
        terms: 'Delivery within 3 days'
      }
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
          <Text className="text-xl font-bold">Transaction Details</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-gray-600">Loading transaction details...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="mt-4 text-lg font-medium text-red-500 text-center">{error}</Text>
          <TouchableOpacity
            className="mt-6 bg-blue-500 py-2 px-6 rounded-lg"
            onPress={fetchTransactionDetails}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {/* Transaction Overview */}
          <Animated.View 
            entering={FadeIn.delay(100).springify()}
            className="bg-white m-4 rounded-xl shadow-sm overflow-hidden"
          >
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-bold">{transaction.type || 'Transaction'}</Text>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                  <Text className="text-white text-xs font-medium">{formatStatus(transaction.status)}</Text>
                </View>
              </View>
              
              <View className="flex-row mb-4">
                {transaction.product?.images && transaction.product.images[0] && (
                  <Image
                    source={{ uri: transaction.product.images[0] }}
                    className="w-20 h-20 rounded-lg mr-4"
                    resizeMode="cover"
                  />
                )}
                
                <View className="flex-1">
                  <Text className="text-lg font-medium">{transaction.product?.name || 'Product'}</Text>
                  <Text className="text-gray-600">{transaction.product?.category || 'Category'}</Text>
                  <Text className="text-gray-600">
                    {transaction.quantity || 0} {transaction.unit || 'units'}
                  </Text>
                </View>
              </View>
              
              <View className="bg-gray-50 p-3 rounded-lg mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Amount:</Text>
                  <Text className="font-bold">{transaction.amount} {transaction.currency || 'INR'}</Text>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Status:</Text>
                  <Text className={`font-bold ${
                    transaction.status === 'COMPLETED' ? 'text-green-600' : 
                    transaction.status === 'CANCELLED' ? 'text-red-600' : 
                    transaction.status === 'PROCESSING' ? 'text-blue-600' : 
                    'text-yellow-600'
                  }`}>
                    {formatStatus(transaction.status)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Transaction Date:</Text>
                  <Text className="font-medium">{formatDateTime(transaction.createdAt)}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Last Updated:</Text>
                  <Text className="font-medium">{formatDateTime(transaction.updatedAt)}</Text>
                </View>
              </View>
              
              <View className="mb-4">
                <Text className="font-bold mb-2">Parties Involved</Text>
                
                <View className="bg-gray-50 p-3 rounded-lg">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="person-outline" size={18} color="#666" />
                    <View className="ml-2">
                      <Text className="text-xs text-gray-500">From (Sender)</Text>
                      <Text className="font-medium">{transaction.sender?.name || 'Unknown'}</Text>
                      <Text className="text-xs text-gray-500">{transaction.sender?.role || 'Role'}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={18} color="#666" />
                    <View className="ml-2">
                      <Text className="text-xs text-gray-500">To (Receiver)</Text>
                      <Text className="font-medium">{transaction.receiver?.name || 'Unknown'}</Text>
                      <Text className="text-xs text-gray-500">{transaction.receiver?.role || 'Role'}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                <View className="mb-4">
                  <Text className="font-bold mb-2">Additional Details</Text>
                  
                  <View className="bg-gray-50 p-3 rounded-lg">
                    {Object.entries(transaction.metadata).map(([key, value]) => (
                      <View key={key} className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">{formatKey(key)}:</Text>
                        <Text className="font-medium">{formatValue(value)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              <View className="flex-row flex-wrap justify-between">
                {transaction.status !== 'COMPLETED' && transaction.status !== 'CANCELLED' && (
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
                
                <TouchableOpacity
                  className="bg-purple-500 px-3 py-2 rounded-lg flex-row items-center mb-2"
                  onPress={handleViewSupplyChain}
                >
                  <Ionicons name="git-branch-outline" size={16} color="white" />
                  <Text className="text-white font-medium ml-1">View Traceability</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
          
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
  if (value instanceof Date) {
    return formatDateTime(value);
  }
  
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  
  return value;
};
