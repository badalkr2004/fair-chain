import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { getOrderById, updateOrderStatus, UpdateOrderStatusDTO } from '../../services/orders';
import { authService } from '../../services';
import { UserRole } from '../../services/auth';

const OrderStatusColors = {
  PENDING: '#FFC107',
  CONFIRMED: '#2196F3',
  IN_TRANSIT: '#9C27B0',
  DELIVERED: '#4CAF50', 
  CANCELLED: '#F44336'
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        const orderData = await getOrderById(id as string);
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
        Alert.alert('Error', 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

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

  const handleUpdateStatus = async (newStatus: UpdateOrderStatusDTO['status']) => {
    try {
      setUpdatingStatus(true);
      
      await updateOrderStatus(id as string, { status: newStatus });
      
      // Refresh order data
      const updatedOrder = await getOrderById(id as string);
      setOrder(updatedOrder);
      
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity 
          style={styles.goBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.orderId}</Text>
          <Text style={styles.orderDate}>Placed on {formatDate(order.createdAt)}</Text>
        </View>
        
        <View style={[
          styles.statusBadge, 
          { backgroundColor: OrderStatusColors[order.status as keyof typeof OrderStatusColors] || '#888' }
        ]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>
      
      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        
        {order.items.map((item: any, index: number) => (
          <View key={index} style={styles.orderItem}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.product?.name || 'Product'}</Text>
              <Text style={styles.itemMeta}>
                {item.quantity} × ${item.unitPrice.toFixed(2)}
              </Text>
            </View>
            <Text style={styles.itemPrice}>${item.totalPrice.toFixed(2)}</Text>
          </View>
        ))}
        
        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
        </View>
      </View>
      
      {/* Delivery Address */}
      {order.deliveryAddress && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#666" style={styles.addressIcon} />
            <View>
              <Text style={styles.addressText}>
                {typeof order.deliveryAddress === 'string' 
                  ? order.deliveryAddress 
                  : Object.values(order.deliveryAddress).join(', ')}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Notes */}
      {order.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Notes</Text>
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      )}
      
      {/* Status Updates - Only for Farmers */}
      {user?.role === UserRole.FARMER && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Order Status</Text>
          
          <View style={styles.statusButtons}>
            {order.status === 'PENDING' && (
              <>
                <TouchableOpacity 
                  style={[styles.statusButton, { backgroundColor: '#2196F3' }]}
                  onPress={() => handleUpdateStatus('CONFIRMED')}
                  disabled={updatingStatus}
                >
                  <MaterialIcons name="check-circle" size={20} color="#fff" />
                  <Text style={styles.statusButtonText}>Confirm Order</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statusButton, { backgroundColor: '#F44336' }]}
                  onPress={() => handleUpdateStatus('CANCELLED')}
                  disabled={updatingStatus}
                >
                  <MaterialIcons name="cancel" size={20} color="#fff" />
                  <Text style={styles.statusButtonText}>Cancel Order</Text>
                </TouchableOpacity>
              </>
            )}
            
            {order.status === 'CONFIRMED' && (
              <TouchableOpacity 
                style={[styles.statusButton, { backgroundColor: '#9C27B0' }]}
                onPress={() => handleUpdateStatus('IN_TRANSIT')}
                disabled={updatingStatus}
              >
                <MaterialIcons name="local-shipping" size={20} color="#fff" />
                <Text style={styles.statusButtonText}>Mark as In Transit</Text>
              </TouchableOpacity>
            )}
            
            {order.status === 'IN_TRANSIT' && (
              <TouchableOpacity 
                style={[styles.statusButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => handleUpdateStatus('DELIVERED')}
                disabled={updatingStatus}
              >
                <MaterialIcons name="check-box" size={20} color="#fff" />
                <Text style={styles.statusButtonText}>Mark as Delivered</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      
      {/* Traceability Section */}
      <TouchableOpacity 
        style={styles.traceabilityButton}
        onPress={() => {
          if (order.items.length > 0 && order.items[0].product) {
            router.push(`/traceability/${order.items[0].product.id}`);
          } else {
            Alert.alert('Error', 'Product information not available');
          }
        }}
      >
        <MaterialIcons name="timeline" size={24} color="#4285F4" />
        <Text style={styles.traceabilityText}>View Supply Chain</Text>
        <MaterialIcons name="chevron-right" size={24} color="#4285F4" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>
      
      {/* Contact Section */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Need help with your order?</Text>
        <TouchableOpacity style={styles.contactButton}>
          <Feather name="message-circle" size={20} color="#4285F4" />
          <Text style={styles.contactText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    marginVertical: 16,
    color: '#444',
  },
  goBackButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  goBackText: {
    color: '#333',
    fontWeight: '500',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4285F4',
  },
  statusButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 8,
  },
  traceabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  traceabilityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4285F4',
    marginLeft: 12,
  },
  contactSection: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 8,
  },
  contactText: {
    color: '#4285F4',
    fontWeight: '500',
    marginLeft: 8,
  },
}); 