import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {  Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import {Badge} from "@/components/ui/badge"
import {VStack} from "@/components/ui/vstack"
import {HStack} from "@/components/ui/hstack"
import { Divider } from '@/components/ui/divider';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { getMyOrders, getFarmerOrders, Order } from '../../services/orders';
import { authService } from '../../services';
import { UserRole } from '../../services/auth';

const OrderStatusColors = {
  PENDING: '#FFC107',
  CONFIRMED: '#2196F3',
  IN_TRANSIT: '#9C27B0',
  DELIVERED: '#4CAF50', 
  CANCELLED: '#F44336'
};

const OrderStatusIcons = {
  PENDING: 'timer',
  CONFIRMED: 'check-circle',
  IN_TRANSIT: 'local-shipping',
  DELIVERED: 'check-box',
  CANCELLED: 'cancel'
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        if (userData?.role === UserRole.CONSUMER) {
          const consumerOrders = await getMyOrders();
          setOrders(consumerOrders || []);
        } else if (userData?.role === UserRole.FARMER) {
          const farmerOrders = await getFarmerOrders();
          setOrders(farmerOrders || []);
        } else {
          Alert.alert('Not Authorized', 'You do not have permission to view orders');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        Alert.alert('Error', 'Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => router.push(`/orders/${item.id}`)}
    >
      <HStack space="md" alignItems="center">
        <MaterialIcons 
          name={OrderStatusIcons[item.status as keyof typeof OrderStatusIcons] || 'info'} 
          size={24} 
          color={OrderStatusColors[item.status as keyof typeof OrderStatusColors] || '#888'} 
        />
        <VStack flex={1}>
          <Text style={styles.orderIdText}>Order #{item.orderId}</Text>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </VStack>
        <Badge 
          variant="outline" 
          action={item.status === 'DELIVERED' ? 'success' : 
                 item.status === 'CANCELLED' ? 'error' : 
                 item.status === 'CONFIRMED' ? 'info' : 
                 item.status === 'IN_TRANSIT' ? 'warning' : 'muted'}
        >
          <Badge.Text>{item.status}</Badge.Text>
        </Badge>
      </HStack>
      
      <Divider my="2" />
      
      <HStack justifyContent="space-between" alignItems="center">
        <Text style={styles.itemsCount}>
          {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.totalText}>${item.totalAmount.toFixed(2)}</Text>
      </HStack>
      
      <View style={styles.productsPreview}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <Text style={styles.productItem} key={index} numberOfLines={1} ellipsizeMode="tail">
            • {orderItem.quantity} × {orderItem.product?.name || 'Product'}
          </Text>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItemsText}>+{item.items.length - 2} more items</Text>
        )}
      </View>
      
      <HStack justifyContent="flex-end" mt="2">
        <Button 
          size="sm" 
          variant="outline" 
          action="secondary"
          onPress={() => router.push(`/orders/${item.id}`)}
        >
          <Button.Text>View Details</Button.Text>
        </Button>
      </HStack>
    </TouchableOpacity>
  );

  const renderEmptyOrders = () => (
    <View style={styles.emptyContainer}>
      <Feather name="shopping-bag" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        {user?.role === UserRole.CONSUMER 
          ? 'Start shopping to place your first order!'
          : 'You haven\'t received any orders yet.'}
      </Text>
      {user?.role === UserRole.CONSUMER && (
        <Button 
          mt="4"
          onPress={() => router.push('/products')}
        >
          <Button.Text>Browse Products</Button.Text>
        </Button>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {user?.role === UserRole.CONSUMER ? 'My Orders' : 'Customer Orders'}
        </Text>
        <Text style={styles.orderCount}>
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </Text>
      </View>
      
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        ListEmptyComponent={renderEmptyOrders}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  orderCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  ordersList: {
    padding: 16,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemsCount: {
    fontSize: 14,
    color: '#666',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  productsPreview: {
    marginTop: 10,
  },
  productItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  moreItemsText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 32,
  },
}); 