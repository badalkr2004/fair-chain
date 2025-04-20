import { API_BASE_URL, API_ENDPOINTS } from './config';
import type { LoginCredentials, AuthResponse, Product, Order, Bid, Transaction, SupplyChain, Forecast, Traceability } from './types';

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
  private token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    if (this.token) {
      headers.append('Authorization', `Bearer ${this.token}`);
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
        throw new Error(data.message || 'An error occurred');
      }

      // Handle the API response format
      return {
        data: data.products || data, // Handle both array and single object responses
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
      body: credentials,
    });
    if (typeof window !== 'undefined') {
      this.token = response.data.token;
      localStorage.setItem('token', response.data.token);
    }
    return response;
  }

  async register(data: any): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: data,
    });
    if (typeof window !== 'undefined') {
      this.token = response.data.token;
      localStorage.setItem('token', response.data.token);
    }
    return response;
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

  async createProduce(data: FormData): Promise<ApiResponse<Product>> {
    const headers = new Headers();
    if (this.token) {
      headers.append('Authorization', `Bearer ${this.token}`);
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

  // Bid methods
  async getBids(): Promise<ApiResponse<Bid[]>> {
    return this.request<Bid[]>(API_ENDPOINTS.bids.list);
  }

  async createBid(bid: Omit<Bid, 'id'>): Promise<ApiResponse<Bid>> {
    return this.request<Bid>(API_ENDPOINTS.bids.create, {
      method: 'POST',
      body: bid,
    });
  }

  async updateBid(id: string, bid: Partial<Bid>): Promise<ApiResponse<Bid>> {
    return this.request<Bid>(API_ENDPOINTS.bids.update(id), {
      method: 'PUT',
      body: bid,
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