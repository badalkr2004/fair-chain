import axios from 'axios';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get auth token helper function
const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('token');
};

export interface Product {
  id: string;
  name: string;
  description?: string;
  farmerId: string;
  category: string;
  quantity: number;
  unit: string;
  basePrice: number;
  finalPrice?: number;
  images: string[];
  harvestDate?: string;
  availableUntil?: string;
  status: 'DRAFT' | 'LISTED' | 'SOLD' | 'PROCESSING' | 'EXPIRED' | 'CANCELLED';
  location?: any;
  organicCertified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  basePrice: number;
  images?: string[];
  harvestDate?: string;
  availableUntil?: string;
  location?: any;
  organicCertified?: boolean;
}

export const getProducts = async (filters?: Record<string, any>) => {
  try {
    const queryString = filters 
      ? `?${Object.entries(filters)
          .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
          .join('&')}`
      : '';
      
    return await api.get(`/products${queryString}`);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: string) => {
  try {
    return await api.get(`/products/${id}`);
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

export const getProductsByFarmer = async (farmerId: string) => {
  try {
    return await api.get(`/products/farmer/${farmerId}`);
  } catch (error) {
    console.error(`Error fetching products for farmer ${farmerId}:`, error);
    throw error;
  }
};

export const getMyProducts = async () => {
  try {
    return await api.get(`/products/my-products`);
  } catch (error) {
    console.error('Error fetching my products:', error);
    throw error;
  }
};

export const createProduct = async (productData: CreateProductDTO) => {
  try {
    return await api.post(`/products`, productData);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<CreateProductDTO>) => {
  try {
    return await api.put(`/products/${id}`, productData);
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    return await api.delete(`/products/${id}`);
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw error;
  }
}; 