import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import transactionService from '../../services/transaction';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  // Fetch transactions
  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get transactions for the intermediary
      const response = await transactionService.getMyTransactions(filter !== 'ALL' ? filter : undefined);
      
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        setTransactions(Array.isArray(response.data) ? response.data : []);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again.');
      // Use mock data for development
      setTransactions(getMockTransactions());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions();
  };

  const handleViewDetails = (transactionId: string) => {
    router.push({
      pathname: '/intermediary/transaction-details',
      params: { id: transactionId }
    });
  };

  const handleUpdateStatus = (transactionId: string, currentStatus: string) => {
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
      Alert.alert('Cannot Update', 'This transaction is already finalized and cannot be updated.');
      return;
    }
    
    Alert.alert(
      'Update Transaction Status',
      'What would you like to do with this transaction?',
      [
        {
          text: 'Mark as Completed',
          onPress: () => updateTransactionStatus(transactionId, 'COMPLETED')
        },
        {
          text: 'Mark as Cancelled',
          onPress: () => updateTransactionStatus(transactionId, 'CANCELLED')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const updateTransactionStatus = async (transactionId: string, status: string) => {
    try {
      setIsLoading(true);
      
      // Update the transaction status
      await transactionService.updateTransactionStatus(transactionId, status);
      
      Alert.alert('Success', 'Transaction status updated successfully');
      fetchTransactions(); // Refresh the list
    } catch (error) {
      console.error('Error updating transaction status:', error);
      Alert.alert('Error', 'Failed to update transaction status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render a transaction card
  const renderTransactionCard = (transaction: any, index: number) => {
    return (
      <Animated.View 
        key={transaction.id} 
        entering={FadeInDown.delay(index * 100).springify()}
        className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
      >
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">{transaction.type || 'Transaction'}</Text>
            <View className={`px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
              <Text className="text-white text-xs font-medium">{formatStatus(transaction.status)}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-3">
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text className="text-gray-600 ml-1">
              {transaction.amount ? `${transaction.amount} ${transaction.currency || 'INR'}` : 'N/A'}
            </Text>
          </View>
          
          <View className="flex-row items-center mb-3">
            <Ionicons name="cube-outline" size={16} color="#666" />
            <Text className="text-gray-600 ml-1">
              {transaction.quantity} {transaction.unit} of {transaction.product?.name || 'Product'}
            </Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-xs text-gray-500">From</Text>
              <Text className="font-medium">{transaction.sender?.name || 'Unknown'}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">To</Text>
              <Text className="font-medium">{transaction.receiver?.name || 'Unknown'}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">Date</Text>
              <Text className="font-medium">{formatDate(transaction.createdAt)}</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
              onPress={() => handleViewDetails(transaction.id.toString())}
            >
              <Ionicons name="information-circle-outline" size={16} color="white" />
              <Text className="text-white font-medium ml-1">Details</Text>
            </TouchableOpacity>
            
            {transaction.status !== 'COMPLETED' && transaction.status !== 'CANCELLED' && (
              <TouchableOpacity
                className="bg-green-500 px-4 py-2 rounded-lg flex-row items-center"
                onPress={() => handleUpdateStatus(transaction.id.toString(), transaction.status)}
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
      case 'PROCESSING': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
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
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  // Mock data for development
  const getMockTransactions = () => {
    return [
      {
        id: '1',
        type: 'SALE',
        amount: 25000,
        currency: 'INR',
        quantity: 500,
        unit: 'kg',
        product: { name: 'Organic Rice' },
        sender: { name: 'John Farmer' },
        receiver: { name: 'Logistics Co.' },
        status: 'PENDING',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: '2',
        type: 'PURCHASE',
        amount: 15000,
        currency: 'INR',
        quantity: 300,
        unit: 'kg',
        product: { name: 'Premium Wheat' },
        sender: { name: 'Logistics Co.' },
        receiver: { name: 'Market Retailer' },
        status: 'PROCESSING',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: '3',
        type: 'SALE',
        amount: 8000,
        currency: 'INR',
        quantity: 100,
        unit: 'kg',
        product: { name: 'Fresh Vegetables' },
        sender: { name: 'Vegetable Farm' },
        receiver: { name: 'Logistics Co.' },
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
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
          <Text className="text-xl font-bold">Transactions</Text>
          <View style={{ width: 24 }} />
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
          <Text className="mt-2 text-gray-600">Loading transactions...</Text>
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
                onPress={fetchTransactions}
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : transactions.length === 0 ? (
            <View className="py-12 px-4 bg-gray-50 rounded-xl items-center">
              <Ionicons name="cash-outline" size={64} color="#ccc" />
              <Text className="text-lg font-medium text-gray-600 mt-4 text-center">
                No transactions found
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                When you accept bids and process orders, your transactions will appear here.
              </Text>
            </View>
          ) : (
            transactions.map((transaction, index) => 
              renderTransactionCard(transaction, index)
            )
          )}
          
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
