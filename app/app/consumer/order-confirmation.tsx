'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [orderDetails, setOrderDetails] = useState({
    id: orderId || 'ORD-12345',
    date: new Date().toLocaleDateString(),
    total: '$125.50',
    paymentMethod: 'Credit Card (**** 1234)',
    deliveryAddress: '123 Main Street, Anytown, State, 12345',
    items: [
      { name: 'Organic Tomatoes', quantity: 2, price: '$8.99' },
      { name: 'Fresh Lettuce', quantity: 1, price: '$4.50' },
      { name: 'Organic Apples', quantity: 5, price: '$12.75' }
    ]
  });

  useEffect(() => {
    // In a real app, you would fetch the order details using the orderId
    // For now, we're using mock data
  }, [orderId]);

  const handleTrackOrder = () => {
    // Navigate to orders page for tracking
    router.push("../consumer/orders");
  };

  const handleContinueShopping = () => {
    // Navigate back to browse products
    router.push("../consumer/browse-products");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Confirmation</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successMessage}>Your order has been placed successfully.</Text>
        </View>
        
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Order Number:</Text>
            <Text style={styles.orderInfoValue}>{orderDetails.id}</Text>
          </View>
          
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Order Date:</Text>
            <Text style={styles.orderInfoValue}>{orderDetails.date}</Text>
          </View>
          
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Total Amount:</Text>
            <Text style={styles.orderInfoValue}>{orderDetails.total}</Text>
          </View>
          
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Payment Method:</Text>
            <Text style={styles.orderInfoValue}>{orderDetails.paymentMethod}</Text>
          </View>
          
          <View style={styles.addressContainer}>
            <Text style={styles.orderInfoLabel}>Delivery Address:</Text>
            <Text style={styles.addressText}>{orderDetails.deliveryAddress}</Text>
          </View>
        </View>
        
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          
          {orderDetails.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTrackOrder}
          >
            <Text style={styles.primaryButtonText}>Track Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContinueShopping}
          >
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerTab} 
          onPress={() => router.push('../consumer/dashboard')}
        >
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text style={styles.footerTabText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab} 
          onPress={() => router.push('../consumer/browse-products')}
        >
          <Ionicons name="basket-outline" size={24} color="#9ca3af" />
          <Text style={styles.footerTabText}>Shop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.footerTab, styles.footerTabActive]} 
          onPress={() => router.push('../consumer/cart')}
        >
          <Ionicons name="cart" size={24} color="#2563eb" />
          <Text style={styles.footerTabTextActive}>Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab} 
          onPress={() => router.push('../consumer/profile')}
        >
          <Ionicons name="person-outline" size={24} color="#9ca3af" />
          <Text style={styles.footerTabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingBottom: 90,
  },
  successContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  orderSummary: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderInfoLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  orderInfoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  addressContainer: {
    paddingTop: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#111827',
    marginTop: 4,
    lineHeight: 22,
  },
  itemsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingBottom: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerTabActive: {
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
  },
  footerTabText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  footerTabTextActive: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
    marginTop: 4,
  },
}); 