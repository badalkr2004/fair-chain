import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import {  Heading } from '@/components/ui/heading';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge"
import { VStack } from "@/components/ui/vstack"
import { HStack } from "@/components/ui/hstack"
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getProducts } from '../../services/products';

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  finalPrice?: number;
  images: string[];
  status: string;
  quantity: number;
  unit: string;
  organicCertified: boolean;
}

interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  organicOnly?: boolean;
}

const CATEGORIES = ['ALL', 'GRAINS', 'VEGETABLES', 'FRUITS', 'DAIRY', 'MEAT', 'POULTRY', 'OTHER'];

export default function ProductsListScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const apiFilters: Record<string, any> = {};
      
      // Apply search query
      if (searchQuery.trim()) {
        apiFilters.search = searchQuery.trim();
      }
      
      // Apply category filter
      if (selectedCategory !== 'ALL') {
        apiFilters.category = selectedCategory;
      }
      
      // Apply price filters
      if (filters.minPrice) {
        apiFilters.minPrice = filters.minPrice;
      }
      if (filters.maxPrice) {
        apiFilters.maxPrice = filters.maxPrice;
      }
      
      // Apply organic filter
      if (filters.organicOnly) {
        apiFilters.organicCertified = true;
      }
      
      // Only get products with LISTED status
      apiFilters.status = 'LISTED';
      
      const data = await getProducts(apiFilters);
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setFilters(prev => ({
      ...prev,
      ...(category === 'ALL' ? { category: undefined } : { category })
    }));
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => router.push(`/products/${item.id}`)}
    >
      <Image 
        source={item.images.length > 0 ? { uri: item.images[0] } : require('../../assets/default-product.png')}
        style={styles.productImage}
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        
        <HStack alignItems="center" space={2} style={styles.priceRow}>
          <Text style={styles.productPrice}>
            ${item.finalPrice || item.basePrice}/{item.unit}
          </Text>
          <Badge 
            colorScheme={item.organicCertified ? "green" : "gray"}
            variant="subtle"
            rounded="md"
          >
            {item.organicCertified ? "Organic" : "Standard"}
          </Badge>
        </HStack>
        
        <HStack justifyContent="space-between" alignItems="center" mt={2}>
          <Text style={styles.productQuantity}>
            {item.quantity} {item.unit}s available
          </Text>
          <Box style={styles.arrowContainer}>
            <MaterialIcons name="arrow-forward" size={16} color="#666" />
          </Box>
        </HStack>
      </View>
    </TouchableOpacity>
  );

  const toggleFilters = () => setShowFilters(!showFilters);

  return (
    <View style={styles.container}>
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
          <TouchableOpacity onPress={toggleFilters}>
            <Ionicons 
              name={showFilters ? "options" : "options-outline"} 
              size={20} 
              color="#666" 
              style={styles.filterIcon} 
            />
          </TouchableOpacity>
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

      {/* Filter Options - Conditional Render */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Heading size="sm" style={styles.filterTitle}>Price Range</Heading>
          <HStack space={2} alignItems="center" style={styles.priceFilterRow}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              keyboardType="numeric"
              value={filters.minPrice?.toString() || ''}
              onChangeText={(text) => {
                const value = text ? parseInt(text) : undefined;
                setFilters(prev => ({ ...prev, minPrice: value }));
              }}
            />
            <Text>to</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              keyboardType="numeric"
              value={filters.maxPrice?.toString() || ''}
              onChangeText={(text) => {
                const value = text ? parseInt(text) : undefined;
                setFilters(prev => ({ ...prev, maxPrice: value }));
              }}
            />
          </HStack>

          <TouchableOpacity 
            style={styles.organicCheckbox}
            onPress={() => setFilters(prev => ({ ...prev, organicOnly: !prev.organicOnly }))}
          >
            <View style={[
              styles.checkbox, 
              filters.organicOnly && styles.checkboxChecked
            ]}>
              {filters.organicOnly && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Organic products only</Text>
          </TouchableOpacity>

          <Button onPress={() => fetchProducts()} style={styles.applyFiltersButton}>
            Apply Filters
          </Button>
        </View>
      )}

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Spinner size="lg" color="#4285F4" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>Try changing your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterIcon: {
    marginLeft: 8,
  },
  categoriesContainer: {
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 6,
  },
  selectedCategoryPill: {
    backgroundColor: '#4285F4',
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: '500',
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  priceFilterRow: {
    marginBottom: 16,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 100,
  },
  organicCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4285F4',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4285F4',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  applyFiltersButton: {
    backgroundColor: '#4285F4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productCategory: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
    color: '#333',
  },
  priceRow: {
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  productQuantity: {
    fontSize: 12,
    color: '#888',
  },
  arrowContainer: {
    padding: 4,
  },
}); 