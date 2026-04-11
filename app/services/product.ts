/**
 * @deprecated Use `products.ts` instead. This file re-exports for backward compatibility.
 */
import api from './api';
import { 
  getProducts, 
  getProductById as getProductByIdNew, 
  getProductsByFarmer as getProductsByFarmerNew,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product 
} from './products';

/**
 * Get all available products
 * @param category Optional category filter
 */
const getAvailableProducts = async (category?: string | null) => {
  try {
    const filters = category ? { category } : undefined;
    return await getProducts(filters);
  } catch (error) {
    console.error('Error fetching available products:', error);
    throw error;
  }
};

/**
 * Get product by ID
 */
const getProductById = async (id: string) => {
  try {
    return await getProductByIdNew(id);
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

/**
 * Get products by category — uses query parameter, not a separate endpoint
 */
const getProductsByCategory = async (category: string) => {
  return getProducts({ category });
};

/**
 * Get products by farmer
 */
const getProductsByFarmer = async (farmerId: string) => {
  return getProductsByFarmerNew(farmerId);
};

/**
 * Search products by keyword
 */
const searchProducts = async (query: string) => {
  try {
    return await api.get(`/products?search=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error(`Error searching products with query ${query}:`, error);
    throw error;
  }
};

/**
 * Get recommended products for the current user
 */
const getRecommendedProducts = async () => {
  // Falls back to regular product list since backend doesn't have this endpoint
  return getProducts({ sort: 'createdAt', order: 'desc', limit: 10 });
};

/**
 * Get popular products
 */
const getPopularProducts = async () => {
  // Falls back to regular product list since backend doesn't have this endpoint
  return getProducts({ sort: 'createdAt', order: 'desc', limit: 10 });
};

/**
 * Get new arrivals (recently added products)
 */
const getNewArrivals = async () => {
  return getProducts({ sort: 'createdAt', order: 'desc', limit: 10 });
};

export type { Product };

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
