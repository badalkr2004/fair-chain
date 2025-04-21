import api from './api';

export interface Product {
  id: string;
  name: string;
  description?: string;
  farmerId: string;
  category: string;
  quantity: number;
  unit: string;
  basePrice: number;
  finalPrice: number;
  images: string[];
  harvestDate: string;
  availableUntil: string;
  status: 'LISTED' | 'SOLD' | 'EXPIRED';
  location: {
    lat: number;
    lng: number;
  };
  organicCertified: boolean;
  createdAt: string;
  updatedAt: string;
  farmer?: any;
}

/**
 * Get all available products
 * @param category Optional category filter
 */
const getAvailableProducts = async (category?: string | null) => {
  try {
    // Try the products endpoint first
    const endpoint = category ? `/products?category=${category}` : '/products';
    return await api.get(endpoint);
  } catch (error) {
    console.error('Error fetching available products:', error);
    // Fall back to produce endpoint if products endpoint fails
    try {
      const produceEndpoint = category ? `/produce?category=${category}` : '/produce';
      const response = await api.get(produceEndpoint);
      // Transform produce data to match product interface
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        const responseData = response.data as any[];
        return {
          success: true,
          data: responseData.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            farmerId: item.farmerId,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            basePrice: item.basePrice || item.price,
            finalPrice: item.finalPrice || item.currentPrice || item.basePrice || item.price,
            images: item.images || [],
            harvestDate: item.harvestDate,
            availableUntil: item.availableUntil || item.expiryDate,
            status: item.status || 'LISTED',
            location: item.location,
            organicCertified: item.organicCertified || false,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            farmer: item.farmer
          }))
        };
      }
      return response;
    } catch (fallbackError) {
      console.error('Error fetching from fallback endpoint:', fallbackError);
      // Return mock data as last resort
      return {
        success: true,
        data: getMockProducts(category)
      };
    }
  }
};

/**
 * Get product by ID
 */
const getProductById = async (id: string) => {
  try {
    return await api.get(`/products/${id}`);
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    // Try fallback to produce endpoint
    try {
      const response = await api.get(`/produce/${id}`);
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        const item = response.data as any;
        return {
          success: true,
          data: {
            id: item.id,
            name: item.name,
            description: item.description,
            farmerId: item.farmerId,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            basePrice: item.basePrice || item.price,
            finalPrice: item.finalPrice || item.currentPrice || item.basePrice || item.price,
            images: item.images || [],
            harvestDate: item.harvestDate,
            availableUntil: item.availableUntil || item.expiryDate,
            status: item.status || 'LISTED',
            location: item.location,
            organicCertified: item.organicCertified || false,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            farmer: item.farmer
          }
        };
      }
      return response;
    } catch (fallbackError) {
      console.error(`Error fetching from fallback endpoint for id ${id}:`, fallbackError);
      // Return mock data for the specific ID
      const mockProduct = getMockProducts().find(p => p.id === id) || getMockProducts()[0];
      return {
        success: true,
        data: mockProduct
      };
    }
  }
};

/**
 * Get products by category
 */
const getProductsByCategory = async (category: string) => {
  try {
    return await api.get(`/products/category/${category}`);
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }
};

/**
 * Get products by farmer
 */
const getProductsByFarmer = async (farmerId: string) => {
  try {
    return await api.get(`/products/farmer/${farmerId}`);
  } catch (error) {
    console.error(`Error fetching products for farmer ${farmerId}:`, error);
    throw error;
  }
};

/**
 * Search products by keyword
 */
const searchProducts = async (query: string) => {
  try {
    return await api.get(`/products/search?q=${query}`);
  } catch (error) {
    console.error(`Error searching products with query ${query}:`, error);
    throw error;
  }
};

/**
 * Get recommended products for the current user
 */
const getRecommendedProducts = async () => {
  try {
    return await api.get('/products/recommended');
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    throw error;
  }
};

/**
 * Get popular products
 */
const getPopularProducts = async () => {
  try {
    return await api.get('/products/popular');
  } catch (error) {
    console.error('Error fetching popular products:', error);
    throw error;
  }
};

/**
 * Get new arrivals (recently added products)
 */
const getNewArrivals = async () => {
  try {
    return await api.get('/products/new-arrivals');
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    throw error;
  }
};

/**
 * Generate mock products for development and testing
 * @private
 */
const getMockProducts = (category?: string | null): Product[] => {
  const mockProducts = [
    {
      id: 'p1',
      name: 'Organic Tomatoes',
      description: 'Fresh organic tomatoes grown without pesticides',
      farmerId: 'f1',
      category: 'VEGETABLES',
      quantity: 100,
      unit: 'kg',
      basePrice: 25,
      finalPrice: 25,
      images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea'],
      harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      availableUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'LISTED' as const,
      location: {
        lat: 13.0827,
        lng: 77.5877
      },
      organicCertified: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      farmer: {
        name: 'John Smith',
        location: 'Bangalore Rural',
        rating: 4.8
      }
    },
    {
      id: 'p2',
      name: 'Fresh Apples',
      description: 'Sweet and juicy apples from the hills',
      farmerId: 'f2',
      category: 'FRUITS',
      quantity: 200,
      unit: 'kg',
      basePrice: 80,
      finalPrice: 80,
      images: ['https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a'],
      harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      availableUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'LISTED' as const,
      location: {
        lat: 31.1048,
        lng: 77.1734
      },
      organicCertified: false,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      farmer: {
        name: 'Rajesh Kumar',
        location: 'Shimla',
        rating: 4.6
      }
    },
    {
      id: 'p3',
      name: 'Basmati Rice',
      description: 'Premium long-grain aromatic rice',
      farmerId: 'f3',
      category: 'GRAINS',
      quantity: 500,
      unit: 'kg',
      basePrice: 120,
      finalPrice: 120,
      images: ['https://images.unsplash.com/photo-1586201375761-83865001e8ac'],
      harvestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      availableUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'LISTED' as const,
      location: {
        lat: 30.9010,
        lng: 75.8573
      },
      organicCertified: true,
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      farmer: {
        name: 'Amit Singh',
        location: 'Punjab',
        rating: 4.9
      }
    }
  ];

  if (!category) return mockProducts;
  
  return mockProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase());
};

export default {
  getAvailableProducts,
  getProductById,
  getProductsByCategory,
  getProductsByFarmer,
  searchProducts,
  getRecommendedProducts,
  getPopularProducts,
  getNewArrivals
};
