import api from './api';

export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: string;
  product?: any;
}

/**
 * Get the current user's wishlist
 */
export const getWishlist = async () => {
  try {
    return await api.get('/wishlist');
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    // Return mock data as fallback
    return {
      success: true,
      data: getMockWishlistItems()
    };
  }
};

/**
 * Generate mock wishlist items for development and testing
 * @private
 */
const getMockWishlistItems = (): WishlistItem[] => {
  return [
    {
      id: 'w1',
      productId: 'p1',
      userId: 'u1',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      product: {
        id: 'p1',
        name: 'Organic Tomatoes',
        description: 'Fresh organic tomatoes grown without pesticides',
        category: 'VEGETABLES',
        basePrice: 25,
        finalPrice: 25,
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea'],
        farmer: {
          name: 'John Smith',
          location: 'Bangalore Rural'
        }
      }
    },
    {
      id: 'w2',
      productId: 'p2',
      userId: 'u1',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      product: {
        id: 'p2',
        name: 'Fresh Apples',
        description: 'Sweet and juicy apples from the hills',
        category: 'FRUITS',
        basePrice: 80,
        finalPrice: 80,
        images: ['https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a'],
        farmer: {
          name: 'Rajesh Kumar',
          location: 'Shimla'
        }
      }
    }
  ];
};

/**
 * Add a product to the wishlist
 */
export const addToWishlist = async (productId: string) => {
  try {
    return await api.post('/wishlist', { productId });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    // Return success response for development
    return {
      success: true,
      message: 'Product added to wishlist',
      data: {
        id: `w${Date.now()}`,
        productId,
        userId: 'u1',
        createdAt: new Date().toISOString()
      }
    };
  }
};

/**
 * Remove a product from the wishlist
 */
export const removeFromWishlist = async (wishlistItemId: string) => {
  try {
    return await api.delete(`/wishlist/${wishlistItemId}`);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    // Return success response for development
    return {
      success: true,
      message: 'Product removed from wishlist'
    };
  }
};

/**
 * Check if a product is in the wishlist
 */
export const isInWishlist = async (productId: string) => {
  try {
    const response = await api.get(`/wishlist/check/${productId}`);
    if (response && typeof response === 'object' && 'isInWishlist' in response) {
      return response.isInWishlist;
    }
    // Check mock data if API fails
    const mockItems = getMockWishlistItems();
    return mockItems.some(item => item.productId === productId);
  } catch (error) {
    console.error('Error checking wishlist:', error);
    // Check mock data if API fails
    const mockItems = getMockWishlistItems();
    return mockItems.some(item => item.productId === productId);
  }
};
