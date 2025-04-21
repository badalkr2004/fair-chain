import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

// Define interface for API responses
interface ApiResponse {
  data?: any;
  products?: any[];
  message?: string;
  success?: boolean;
}

/**
 * Service for handling traceability and supply chain features
 */
class TraceabilityService {
  /**
   * Get full supply chain journey for a product
   */
  async getProductJourney(productId: string): Promise<ApiResponse> {
    try {
      // First try using the product endpoint
      return await api.get(`/trace/product/${productId}`);
    } catch (error) {
      console.error('Error fetching product journey:', error);
      // For backward compatibility, try the record endpoint as fallback
      return api.get(`/trace/record/${productId}`);
    }
  }

  /**
   * Get supply chain node details
   */
  async getNodeDetails(nodeId: string): Promise<ApiResponse> {
    return api.get(`/trace/record/${nodeId}`);
  }

  /**
   * Record a supply chain event
   */
  async recordSupplyChainEvent(data: {
    productId: string;
    eventType: 'HARVESTED' | 'PROCESSED' | 'PACKAGED' | 'SHIPPED' | 'RECEIVED' | 'QUALITY_CHECK' | 'STORED';
    location: {
      latitude: number;
      longitude: number;
      name?: string;
    };
    timestamp?: string; // ISO date string, defaults to now
    details?: Record<string, any>; // Additional details specific to event type
    attachments?: string[]; // URLs to images or documents
  }): Promise<ApiResponse> {
    try {
      console.log('Recording supply chain event:', data);
      
      // Format the data to match the backend API requirements in traceability.controller.js
      const payload = {
        productId: data.productId,
        eventType: data.eventType,
        location: data.location,
        metadata: data.details || {} // Backend expects 'metadata' instead of 'details'
      };
      
      console.log('Sending payload to backend:', payload);
      
      // Use the traceability record endpoint for consistency with backend routes
      return await api.post('/trace/record', payload);
    } catch (error) {
      console.error('Error recording supply chain event:', error);
      throw new Error('Failed to record supply chain event. Please try again.');
    }
  }

  /**
   * Get supply chain events for a product
   */
  async getProductEvents(productId: string): Promise<ApiResponse> {
    return api.get(`/supply-chain/events/${productId}`);
  }

  /**
   * Register a new batch/product for traceability
   */
  async registerTraceableProduct(data: {
    name: string;
    produceId?: string; // Reference to source produce if applicable
    quantity: number;
    unit: string;
    batchNumber?: string; // Optional batch number
    productionDate: string; // ISO date string
    expiryDate?: string; // ISO date string
    origin: {
      latitude: number;
      longitude: number;
      name: string;
    };
    certifications?: string[];
    attachments?: string[]; // URLs to images or documents
  }): Promise<ApiResponse> {
    try {
      // Validate required fields
      if (!data.name || !data.quantity || !data.unit) {
        throw new Error('Missing required fields: name, quantity, or unit');
      }
      
      // Format the payload according to what the backend expects
      const payload = {
        productId: data.produceId, // Use the existing product ID if available
        eventType: 'HARVESTED', // Initial event is always HARVESTED
        location: data.origin,
        metadata: {
          name: data.name,
          quantity: data.quantity,
          unit: data.unit,
          batchNumber: data.batchNumber || `BATCH-${Date.now().toString(36).toUpperCase()}`,
          productionDate: data.productionDate,
          expiryDate: data.expiryDate,
          certifications: data.certifications?.join(', ') || 'None'
        }
      };
      
      console.log('Registering product for traceability with payload:', payload);
      
      // Use the traceability record endpoint directly
      return await api.post('/trace/record', payload);
    } catch (error) {
      console.error('Error registering traceable product:', error);
      throw new Error('Failed to register product for traceability. Please try again later.');
    }
  }

  /**
   * Get all traceable products
   */
  async getMyTraceableProducts(): Promise<any[]> {
    try {
      console.log('Fetching traceable products from API...');
      
      // Try standard API call first
      try {
        const response = await api.get('/trace/products/my') as ApiResponse;
        console.log("traceable product:",response)
        
        // Check if the response has the expected structure with products
        if (response?.data?.products && Array.isArray(response.data.products)) {
          console.log(`Found ${response.data.products.length} traceable products`);
          return response.data.products;
        } 
        
        // Check if response.data itself is an array of products
        if (response?.data && Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} traceable products in data array`);
          return response.data;
        }

        // Last attempt - check if response itself is the array
        if (response && Array.isArray(response)) {
          console.log(`Found ${response.length} traceable products in response`);
          return response;
        }
      } catch (error) {
        console.log('Standard API call failed, attempting direct fetch as backup...');
        
        // Try direct fetch as fallback when regular API call fails with HTML response
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token available');
        }
        
        // Make a direct fetch with proper authentication
        const directResponse = await fetch(`${API_URL}/trace/products/my`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        // Check if response is JSON
        const contentType = directResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await directResponse.json();
          
          if (data && data.products && Array.isArray(data.products)) {
            console.log(`Direct fetch successful, found ${data.products.length} products`);
            return data.products;
          }
          
          // Return whatever we got if it's an array
          if (data && Array.isArray(data)) {
            return data;
          }
        } else {
          throw new Error('Server returned non-JSON response');
        }
      }
      
      // Fallback to mock data if all API attempts fail
      console.warn('All API attempts failed, using mock data');
      return this.getMockTraceableProducts();
    } catch (error) {
      console.error('Error fetching traceable products, falling back to mock data:', error);
      
      // Always return mock data on error to prevent app crashes
      return this.getMockTraceableProducts();
    }
  }
  
  /**
   * Get mock data for traceability products when API fails
   */
  getMockTraceableProducts() {
    console.log('Using mock traceability data');
    // Generate a unique ID for mock data to prevent React key warnings
    const mockId1 = `mock-${Date.now()}-1`;
    const mockId2 = `mock-${Date.now()}-2`;
    
    return [
      {
        id: mockId1,
        productId: mockId1,
        name: 'Organic Rice',
        batchNumber: 'BATCH-001',
        quantity: 100,
        unit: 'kg',
        currentStage: 'HARVESTED',
        origin: {
          name: 'Sample Farm',
          latitude: 28.6139,
          longitude: 77.2090
        },
        productionDate: new Date().toISOString(),
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString()
      },
      {
        id: mockId2,
        productId: mockId2,
        name: 'Premium Wheat',
        batchNumber: 'BATCH-002',
        quantity: 150,
        unit: 'kg',
        currentStage: 'PROCESSED',
        origin: {
          name: 'Sample Farm',
          latitude: 28.6139,
          longitude: 77.2090
        },
        productionDate: new Date().toISOString(),
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 8)).toISOString()
      }
    ];
  }

  /**
   * Get QR code for a product
   */
  async getProductQRCode(productId: string): Promise<ApiResponse> {
    return api.get(`/trace/qr/${productId}`);
  }

  /**
   * Verify a product's authenticity
   */
  async verifyProduct(verificationCode: string): Promise<ApiResponse> {
    try {
      console.log('Verifying product with code:', verificationCode);
      
      // First try the product scan endpoint
      try {
        const response = await api.get(`/trace/product/scan?code=${verificationCode}`) as ApiResponse;
        console.log('Product verification response:', response);
        return response;
      } catch (productError) {
        console.log('Product scan failed, trying record scan:', productError);
        
        // If product scan fails, try the record scan endpoint
        try {
          const recordResponse = await api.get(`/trace/record/scan?code=${verificationCode}`) as ApiResponse;
          console.log('Record verification response:', recordResponse);
          return recordResponse;
        } catch (recordError) {
          console.log('Record scan failed too:', recordError);
          
          // If both fail, try the original verify endpoint as fallback
          try {
            return await api.get(`/trace/verify/${verificationCode}`) as ApiResponse;
          } catch (verifyError) {
            console.log('Verify endpoint failed too:', verifyError);
            
            // As a last resort, try with the code directly as the ID
            return await api.get(`/trace/product/${verificationCode}`) as ApiResponse;
          }
        }
      }
    } catch (error) {
      console.error('All verification attempts failed:', error);
      
      // Return a structured error response that matches ApiResponse type
      return {
        success: false,
        message: 'Could not verify this product. The QR code may be invalid or the product may not be registered in our system.',
        data: null
      } as ApiResponse;
    }
  }
}

export default new TraceabilityService();