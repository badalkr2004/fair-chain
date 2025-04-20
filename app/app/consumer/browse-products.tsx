'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as productsService from '../../services/products';
import * as cartService from '../../services/cart';

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  basePrice: number;
  finalPrice?: number;
  images: string[];
  organicCertified: boolean;
  farmer: {
    name: string;
    id: string;
  };
}

const CATEGORIES = ['ALL', 'GRAINS', 'VEGETABLES', 'FRUITS', 'DAIRY', 'MEAT', 'POULTRY', 'OTHER'];

export default function BrowseProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    updateCartCount();

    // Poll cart count every minute to keep it updated
    const interval = setInterval(updateCartCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update cart badge count
  const updateCartCount = async () => {
    try {
      const count = await cartService.getCartItemCount();
      setCartCount(count);
    } catch (error) {
      console.error('Error getting cart count:', error);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const apiFilters: Record<string, any> = {
        status: 'LISTED', // Only get products that are available
        sort: 'createdAt:desc' // Show newest products first
      };
      
      const response = await productsService.getProducts(apiFilters);
      if (response && response.products) {
        setProducts(response.products);
        setFilteredProducts(response.products);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Filter products by category
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    
    if (category === 'ALL') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === category);
      setFilteredProducts(filtered);
    }
  };

  // Search products
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      handleCategorySelect(selectedCategory);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = products.filter(product => {
      // Filter by selected category first (if not ALL)
      if (selectedCategory !== 'ALL' && product.category !== selectedCategory) {
        return false;
      }
      
      // Then apply search query filter
      return (
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        product.farmer.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });
    
    setFilteredProducts(filtered);
  };

  // Add product to cart
  const addToCart = async (product: Product) => {
    try {
      setAddingToCart(product.id);
      
      await cartService.addToCart({
        productId: product.id,
        quantity: 1
      });
      
      await updateCartCount();
      
      Alert.alert(
        'Added to Cart',
        `${product.name} has been added to your cart.`,
        [
          { text: 'Continue Shopping', onPress: () => {} },
          { text: 'View Cart', onPress: () => router.push('../consumer/cart') }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  // View product details
  const viewProductDetails = (productId: string) => {
    router.push({
      pathname: '../consumer/product-details',
      params: { id: productId }
    });
  };

  // Render product item
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => viewProductDetails(item.id)}
    >
      <Image 
        source={item.images && item.images.length > 0 
          ? { uri: item.images[0] } 
          : require('../../assets/images/placeholder.png')}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      {item.organicCertified && (
        <View style={styles.organicBadge}>
          <Text style={styles.organicText}>Organic</Text>
        </View>
      )}
      
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.farmerName}>by {item.farmer.name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            ${item.finalPrice || item.basePrice}/{item.unit}
          </Text>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => addToCart(item)}
            disabled={addingToCart === item.id}
          >
            {addingToCart === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="add" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('../consumer/cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#2563eb" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                handleCategorySelect(selectedCategory);
              }}
            >
              <Ionicons name="close" size={20} color="#666" style={styles.clearIcon} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryPill,
                selectedCategory === item && styles.selectedCategoryPill
              ]}
              onPress={() => handleCategorySelect(item)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.selectedCategoryText
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>
      
      {/* Product List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptyText}>
            Try changing your search or filter criteria
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setFilteredProducts(products);
            }}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh} 
              colors={["#2563eb"]}
              tintColor="#2563eb"
            />
          }
        />
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
        
        <TouchableOpacity style={[styles.footerTab, styles.footerTabActive]}>
          <Ionicons name="basket" size={24} color="#2563eb" />
          <Text style={styles.footerTabTextActive}>Shop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerTab} 
          onPress={() => router.push('../consumer/orders')}
        >
          <Ionicons name="list-outline" size={24} color="#9ca3af" />
          <Text style={styles.footerTabText}>Orders</Text>
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
    backgroundColor: '#F8FAF5',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearIcon: {
    marginLeft: 8,
  },
  categoriesContainer: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f3f4f6',
    marginLeft: 12,
  },
  selectedCategoryPill: {
    backgroundColor: '#2563eb',
  },
  categoryText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#4b5563',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  productGrid: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  organicText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingBottom: 24,
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