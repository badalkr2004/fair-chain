import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Image,
  TextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import productService from '../../services/product';
import { formatDate } from '../../utils/dateUtils';

export default function MarketplaceScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get products for the consumer
      const response = await productService.getAvailableProducts(selectedCategory);
      
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        setProducts(Array.isArray(response.data) ? response.data : []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      // Use mock data for development
      setProducts(getMockProducts());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProducts();
  };

  const handleViewDetails = (productId: string) => {
    router.push({
      pathname: '/consumer/product-details',
      params: { id: productId }
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      fetchProducts();
      return;
    }
    
    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setProducts(filteredProducts);
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchProducts();
  };

  // Render a product card
  const renderProductCard = (product: any, index: number) => {
    return (
      <Animated.View 
        key={product.id} 
        entering={FadeInDown.delay(index * 100).springify()}
        className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
      >
        <TouchableOpacity onPress={() => handleViewDetails(product.id.toString())}>
          <View>
            {product.images && product.images[0] ? (
              <Image
                source={{ uri: product.images[0] }}
                className="w-full h-48"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-48 bg-gray-200 justify-center items-center">
                <Ionicons name="image-outline" size={48} color="#999" />
              </View>
            )}
            
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold">{product.name}</Text>
                <View className="bg-green-100 px-2 py-1 rounded-full">
                  <Text className="text-green-800 text-xs font-medium">{product.category}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center mb-2">
                <Ionicons name="cash-outline" size={16} color="#666" />
                <Text className="text-gray-600 ml-1">
                  {product.price ? `${product.price} ${product.currency || 'INR'} / ${product.unit}` : 'Price on request'}
                </Text>
              </View>
              
              <View className="flex-row items-center mb-2">
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text className="text-gray-600 ml-1">
                  {product.location || 'Location not specified'}
                </Text>
              </View>
              
              <View className="flex-row items-center mb-3">
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text className="text-gray-600 ml-1">
                  {product.farmer?.name || 'Unknown farmer'}
                </Text>
              </View>
              
              <Text numberOfLines={2} className="text-gray-600 mb-3">
                {product.description || 'No description available'}
              </Text>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-500">
                  Listed on {formatDate(product.createdAt)}
                </Text>
                
                <TouchableOpacity
                  className="bg-blue-500 px-3 py-1 rounded-lg flex-row items-center"
                >
                  <Ionicons name="information-circle-outline" size={14} color="white" />
                  <Text className="text-white font-medium ml-1">Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Categories
  const categories = [
    'All',
    'Vegetables',
    'Fruits',
    'Grains',
    'Dairy',
    'Meat',
    'Spices',
    'Organic'
  ];

  // Mock data for development
  const getMockProducts = () => {
    return [
      {
        id: '1',
        name: 'Organic Rice',
        category: 'Grains',
        price: 50,
        currency: 'INR',
        unit: 'kg',
        quantity: 500,
        description: 'Premium quality organic rice grown without pesticides',
        location: 'Punjab, India',
        images: ['https://via.placeholder.com/400x300'],
        farmer: {
          id: 'farmer-1',
          name: 'John Farmer'
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: '2',
        name: 'Fresh Tomatoes',
        category: 'Vegetables',
        price: 30,
        currency: 'INR',
        unit: 'kg',
        quantity: 200,
        description: 'Freshly harvested tomatoes, perfect for salads and cooking',
        location: 'Karnataka, India',
        images: ['https://via.placeholder.com/400x300'],
        farmer: {
          id: 'farmer-2',
          name: 'Alice Grower'
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: '3',
        name: 'Organic Apples',
        category: 'Fruits',
        price: 120,
        currency: 'INR',
        unit: 'kg',
        quantity: 150,
        description: 'Sweet and juicy organic apples from the hills',
        location: 'Himachal Pradesh, India',
        images: ['https://via.placeholder.com/400x300'],
        farmer: {
          id: 'farmer-3',
          name: 'Robert Planter'
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      }
    ];
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="menu-outline" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Marketplace</Text>
          <TouchableOpacity onPress={() => router.push('/consumer/cart')}>
            <Ionicons name="cart-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="bg-white py-3 px-2 border-b border-gray-200"
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            className={`px-4 py-2 rounded-full mr-2 ${
              (category === 'All' && selectedCategory === null) || selectedCategory === category 
                ? 'bg-green-500' 
                : 'bg-gray-200'
            }`}
            onPress={() => setSelectedCategory(category === 'All' ? null : category)}
          >
            <Text className={`font-medium ${
              (category === 'All' && selectedCategory === null) || selectedCategory === category 
                ? 'text-white' 
                : 'text-gray-800'
            }`}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Content */}
      {isLoading && !isRefreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-2 text-gray-600">Loading products...</Text>
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
                onPress={fetchProducts}
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <View className="py-12 px-4 bg-gray-50 rounded-xl items-center">
              <Ionicons name="basket-outline" size={64} color="#ccc" />
              <Text className="text-lg font-medium text-gray-600 mt-4 text-center">
                No products found
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                {searchQuery 
                  ? `No products match your search for "${searchQuery}"`
                  : selectedCategory 
                    ? `No products found in the ${selectedCategory} category`
                    : 'There are no products available at the moment'
                }
              </Text>
              {(searchQuery || selectedCategory) && (
                <TouchableOpacity
                  className="mt-6 bg-blue-500 py-2 px-6 rounded-lg"
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    fetchProducts();
                  }}
                >
                  <Text className="text-white font-medium">Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            products.map((product, index) => 
              renderProductCard(product, index)
            )
          )}
          
          <View className="h-20" />
        </ScrollView>
      )}
    </View>
  );
}
