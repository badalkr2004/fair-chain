'use client';

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as cartService from '../../services/cart';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<cartService.CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<cartService.CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      // Load cart items with product details
      const items = await cartService.getPopulatedCart();
      setCartItems(items);
      
      // Load cart summary
      const summary = await cartService.getCartSummary();
      setCartSummary(summary);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdatingItem(itemId);
      await cartService.updateCartItemQuantity(itemId, newQuantity);
      await loadCart(); // Reload cart after update
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItem(itemId);
      await cartService.removeFromCart(itemId);
      await loadCart(); // Reload cart after removal
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleCheckout = () => {
    router.push("../consumer/checkout");
  };

  const renderCartItem = ({ item }: { item: cartService.CartItem }) => {
    const isUpdating = updatingItem === item.id;
    
    return (
      <View style={styles.cartItem}>
        <Image
          source={{ uri: item.product.images[0] || 'https://via.placeholder.com/100' }}
          style={styles.productImage}
        />
        
        <View style={styles.itemDetails}>
          <Text style={styles.productName}>{item.product.name}</Text>
          <Text style={styles.farmerName}>by {item.product.farmer.name}</Text>
          <Text style={styles.productPrice}>${item.product.finalPrice || item.product.basePrice} / {item.product.unit}</Text>
          
          <View style={styles.quantityControl}>
            {isUpdating ? (
              <ActivityIndicator size="small" color="#0066CC" />
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, item.quantity, -1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, item.quantity, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        
        <View style={styles.itemActions}>
          <Text style={styles.itemTotal}>
            ${((item.product.finalPrice || item.product.basePrice) * item.quantity).toFixed(2)}
          </Text>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.id)}
            disabled={isUpdating}
          >
            <FontAwesome name="trash-o" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <FontAwesome name="shopping-cart" size={64} color="#CCCCCC" />
      <Text style={styles.emptyCartText}>Your cart is empty</Text>
      <TouchableOpacity 
        style={styles.continueShoppingButton}
        onPress={() => router.push("../consumer/browse-products")}
      >
        <Text style={styles.continueShoppingButtonText}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("../consumer/browse-products")}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Shopping Cart</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyCart}
        contentContainerStyle={cartItems.length === 0 ? styles.flatListEmpty : styles.flatList}
      />
      
      {cartItems.length > 0 && cartSummary && (
        <View style={styles.cartSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${cartSummary.subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${cartSummary.tax.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>${cartSummary.shipping.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${cartSummary.total.toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
      
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
        
        <TouchableOpacity style={[styles.footerTab, styles.footerTabActive]}>
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
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  flatList: {
    padding: 16,
  },
  flatListEmpty: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  farmerName: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#555555',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  removeButton: {
    padding: 8,
  },
  cartSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555555',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#777777',
    marginTop: 16,
    marginBottom: 24,
  },
  continueShoppingButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  continueShoppingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555555',
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