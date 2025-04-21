import { API_BASE_URL, API_ENDPOINTS } from './config';
import type { 
  LoginCredentials, 
  AuthResponse, 
  Product, 
  Order, 
  Transaction, 
  SupplyChain, 
  Forecast, 
  Traceability,
  RegistrationFormData,
  User 
} from './types';
import { useAuthStore } from '../store';

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    const token = useAuthStore.getState().token;
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    try {
      console.log('Making request to:', `${this.baseUrl}${endpoint}`);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          useAuthStore.getState().clearAuth();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'An error occurred');
      }

      return {
        data: data.data || data,
        message: data.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: credentials
    });
    
    const { user: apiUser, token, refreshToken } = response.data;
    
    // Transform API user to match store User type
    const storeUser: User = {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: apiUser.role,
      farmerProfile: apiUser.farmerProfile ? {
        farmSize: apiUser.farmerProfile.farmSize,
        location: apiUser.farmerProfile.location,
        cropTypes: apiUser.farmerProfile.cropTypes,
        certifications: apiUser.farmerProfile.certifications
      } : undefined,
      buyerProfile: apiUser.buyerProfile ? {
        businessName: apiUser.buyerProfile.businessName,
        businessType: apiUser.buyerProfile.businessType,
        location: apiUser.buyerProfile.location
      } : undefined
    };
    
    useAuthStore.getState().setAuth(storeUser, token, refreshToken);
    
    // Set the token in a cookie
    document.cookie = `auth-token=${token}; path=/; max-age=2592000; SameSite=Lax`; // 30 days expiry
    
    // Set the user role in a cookie
    document.cookie = `user-role=${storeUser.role}; path=/; max-age=2592000; SameSite=Lax`; // 30 days expiry
    
    return response;
  }

  async register(data: RegistrationFormData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: {
        ...data.user,
        role: data.role.toString(),
        profile: data.profile
      },
    });
    
    const { user: apiUser, token, refreshToken } = response.data;
    
    // Transform API user to match store User type
    const storeUser: User = {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: apiUser.role,
      farmerProfile: apiUser.farmerProfile ? {
        farmSize: apiUser.farmerProfile.farmSize,
        location: apiUser.farmerProfile.location,
        cropTypes: apiUser.farmerProfile.cropTypes,
        certifications: apiUser.farmerProfile.certifications
      } : undefined,
      buyerProfile: apiUser.buyerProfile ? {
        businessName: apiUser.buyerProfile.businessName,
        businessType: apiUser.buyerProfile.businessType,
        location: apiUser.buyerProfile.location
      } : undefined
    };
    
    useAuthStore.getState().setAuth(storeUser, token, refreshToken);
    
    return response;
  }

  async getFarmerProfile(): Promise<ApiResponse<any>> {
    return this.request<any>(API_ENDPOINTS.auth.profile);
  }

  // Product methods
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>(API_ENDPOINTS.products.list);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<ApiResponse<Product>> {
    return this.request<Product>(API_ENDPOINTS.products.create, {
      method: 'POST',
      body: product,
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request<Product>(API_ENDPOINTS.products.update(id), {
      method: 'PUT',
      body: product,
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.products.delete(id), {
      method: 'DELETE',
    });
  }

  // Produce methods
  async getProduce(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>(API_ENDPOINTS.produce.list);
  }

  async getMyProduce(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>(API_ENDPOINTS.produce.myProduce);
  }

  async createProduce(data: FormData): Promise<ApiResponse<Product>> {
    const headers = new Headers();
    const token = useAuthStore.getState().token;
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    // Don't set Content-Type for FormData, let the browser set it with boundary

    try {
      console.log('Sending request to:', `${this.baseUrl}${API_ENDPOINTS.produce.create}`);
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.produce.create}`, {
        method: 'POST',
        headers,
        body: data,
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        // If there's a validation error, try to get more details from the response
        const errorMessage = responseData.message || 
                           (responseData.errors ? JSON.stringify(responseData.errors) : 'Validation error');
        throw new Error(errorMessage);
      }

      return {
        data: responseData,
        message: responseData.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }

  async updateProduce(id: string, produce: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request<Product>(API_ENDPOINTS.produce.update(id), {
      method: 'PUT',
      body: produce,
    });
  }

  async deleteProduce(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.produce.delete(id), {
      method: 'DELETE',
    });
  }

  // Order methods
  async getOrders(): Promise<ApiResponse<Order[]>> {
    return this.request<Order[]>(API_ENDPOINTS.orders.list);
  }

  async createOrder(order: Omit<Order, 'id'>): Promise<ApiResponse<Order>> {
    return this.request<Order>(API_ENDPOINTS.orders.create, {
      method: 'POST',
      body: order,
    });
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<ApiResponse<Order>> {
    return this.request<Order>(API_ENDPOINTS.orders.update(id), {
      method: 'PUT',
      body: order,
    });
  }

  // Supply Chain methods
  async trackSupplyChain(id: string): Promise<ApiResponse<SupplyChain>> {
    return this.request<SupplyChain>(API_ENDPOINTS.supplyChain.track(id));
  }

  // Forecast methods
  async getForecast(): Promise<ApiResponse<Forecast>> {
    return this.request<Forecast>(API_ENDPOINTS.forecast.get);
  }

  // Traceability methods
  async getTraceability(id: string): Promise<ApiResponse<Traceability>> {
    return this.request<Traceability>(API_ENDPOINTS.traceability.get(id));
  }
}

export const apiClient = new ApiClient(); 