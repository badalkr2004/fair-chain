import axios from 'axios';
import { API_URL } from '../config';
import * as tokenStorage from '../utils/token-storage';
import * as productsService from './products';

// Types
export interface CartItem {
  id: string;
  productId: string;
  product: {
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
      id: string;
      name: string;
    };
  };
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
  items: CartItem[];
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

// Get cart items
export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const token = await tokenStorage.getToken();
    
    const response = await axios.get(`${API_URL}/cart/items`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

// Get cart summary
export const getCartSummary = async (): Promise<CartSummary> => {
  try {
    const token = await tokenStorage.getToken();
    
    const response = await axios.get(`${API_URL}/cart/summary`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching cart summary:', error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (data: AddToCartRequest): Promise<CartItem> => {
  try {
    const token = await tokenStorage.getToken();
    
    const response = await axios.post(`${API_URL}/cart/items`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.item;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (itemId: string, quantity: number): Promise<CartItem> => {
  try {
    const token = await tokenStorage.getToken();
    
    const response = await axios.patch(
      `${API_URL}/cart/items/${itemId}`,
      { quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.item;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (itemId: string): Promise<void> => {
  try {
    const token = await tokenStorage.getToken();
    
    await axios.delete(`${API_URL}/cart/items/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

// Clear cart
export const clearCart = async (): Promise<void> => {
  try {
    const token = await tokenStorage.getToken();
    
    await axios.delete(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Get cart item count
export const getCartItemCount = async (): Promise<number> => {
  try {
    const token = await tokenStorage.getToken();
    
    const response = await axios.get(`${API_URL}/cart/count`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.count || 0;
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return 0; // Return 0 on error instead of throwing
  }
};

/**
 * Populate the cart with product details
 */
export const getPopulatedCart = async (): Promise<(CartItem & { product: productsService.Product })[]> => {
  try {
    const cart = await getCartItems();
    
    const populatedCart = await Promise.all(
      cart.map(async (item) => {
        try {
          interface ProductResponse {
            product: productsService.Product;
          }
          const productData = await productsService.getProductById(item.productId) as ProductResponse;
          return {
            ...item,
            product: productData.product
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          // Return item without product details if fetch fails
          return item as any;
        }
      })
    );
    
    return populatedCart as (CartItem & { product: productsService.Product })[];
  } catch (error) {
    console.error('Error populating cart:', error);
    throw new Error('Failed to load cart details');
  }
};

/**
 * Calculate the total price of all items in the cart
 */
export const getCartTotal = async (): Promise<number> => {
  try {
    const populatedCart = await getPopulatedCart();
    
    return populatedCart.reduce((total, item) => {
      if (!item.product) return total;
      
      const price = item.product.finalPrice || item.product.basePrice;
      return total + (price * item.quantity);
    }, 0);
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return 0;
  }
};

/**
 * Convert cart items to order items for checkout
 */
export const createOrderFromCart = async (): Promise<CartItem[]> => {
  try {
    const cart = await getCartItems();
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }
    
    return cart;
  } catch (error) {
    console.error('Error preparing order from cart:', error);
    throw error;
  }
}; 