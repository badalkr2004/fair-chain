import apiClient from '@/lib/api-client';
import type { Product } from '@/types';
import type { CreateProductInput } from '@/schemas/product.schema';

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  farmerId?: string;
  organic?: boolean;
  search?: string;
}

export async function getProducts(filters?: ProductFilters): Promise<{ products: Product[] }> {
  const res = await apiClient.get('/products', { params: filters });
  return res.data;
}

export async function getProductById(id: string): Promise<{ product: Product }> {
  const res = await apiClient.get(`/products/${id}`);
  return res.data;
}

export async function createProduct(data: CreateProductInput): Promise<{ product: Product }> {
  const res = await apiClient.post('/products', data);
  return res.data;
}

export async function updateProduct(id: string, data: Partial<CreateProductInput>): Promise<{ product: Product }> {
  const res = await apiClient.put(`/products/${id}`, data);
  return res.data;
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
}

export async function getMyProducts(): Promise<{ products: Product[] }> {
  const res = await apiClient.get('/products/my/products');
  return res.data;
}

export async function getProductsByFarmer(farmerId: string): Promise<{ products: Product[] }> {
  const res = await apiClient.get(`/products/farmer/${farmerId}`);
  return res.data;
}
