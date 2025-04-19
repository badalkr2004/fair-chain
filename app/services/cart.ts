import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/product';
import { authService } from './auth';

interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

interface AddToCartRequest {
  productId: string;
  quantity: number;
}

// Storage key for cart
const CART_STORAGE_KEY = 'fairchain_cart';

/**
 * Get the current cart items from storage
 */
export const getCart = async (): Promise<CartItem[]> => {
  try {
    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

/**
 * Add an item to the cart
 */
export const addToCart = async (item: AddToCartRequest): Promise<CartItem[]> => {
  try {
    const currentCart = await getCart();
    
    // Check if the product is already in the cart
    const existingItemIndex = currentCart.findIndex(
      cartItem => cartItem.productId === item.productId
    );
    
    if (existingItemIndex > -1) {
      // Update the quantity if product already exists
      currentCart[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item if product doesn't exist in cart
      currentCart.push({
        productId: item.productId,
        quantity: item.quantity
      });
    }
    
    // Save updated cart to storage
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
    return currentCart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw new Error('Failed to add item to cart');
  }
};

/**
 * Update the quantity of a cart item
 */
export const updateCartItemQuantity = async (
  productId: string,
  quantity: number
): Promise<CartItem[]> => {
  try {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    
    const currentCart = await getCart();
    const itemIndex = currentCart.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    currentCart[itemIndex].quantity = quantity;
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
    return currentCart;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw new Error('Failed to update cart item');
  }
};

/**
 * Remove an item from the cart
 */
export const removeFromCart = async (productId: string): Promise<CartItem[]> => {
  try {
    let currentCart = await getCart();
    currentCart = currentCart.filter(item => item.productId !== productId);
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
    return currentCart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw new Error('Failed to remove item from cart');
  }
};

/**
 * Clear the entire cart
 */
export const clearCart = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Failed to clear cart');
  }
};

/**
 * Get the number of items in the cart
 */
export const getCartItemCount = async (): Promise<number> => {
  try {
    const cart = await getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

/**
 * Calculate the total price of all items in the cart
 */
export const getCartTotal = async (populatedCart: (CartItem & { product: Product })[]): Promise<number> => {
  return populatedCart.reduce((total, item) => {
    return total + (item.product.finalPrice * item.quantity);
  }, 0);
}; 