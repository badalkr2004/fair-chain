import api from './api';

/**
 * Service for handling produce-related API calls
 */
class ProduceService {
  /**
   * Get all produce for the logged-in farmer
   */
  async getMyProduce(): Promise<any> {
    return api.get('/produce/my-produce');
  }

  /**
   * Get a single produce by ID
   */
  async getProduceById(id: string): Promise<any> {
    return api.get(`/produce/${id}`);
  }

  /**
   * Add a new produce
   */
  async addProduce(data: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    price: number;
    harvestDate: string;
    expiryDate: string;
    description?: string;
    certifications?: string[];
    images?: string[];
    location?: {
      latitude: number;
      longitude: number;
    };
  }): Promise<any> {
    // Convert the location format to what the backend expects (lat/lng)
    const backendData = {
      ...data,
      basePrice: data.price,
      availableUntil: data.expiryDate,
      location: data.location ? {
        lat: data.location.latitude,
        lng: data.location.longitude
      } : undefined
    };
    
    return api.post('/produce', backendData);
  }

  /**
   * Update an existing produce
   */
  async updateProduce(id: string, data: any): Promise<any> {
    return api.put(`/produce/${id}`, data);
  }

  /**
   * Delete a produce
   */
  async deleteProduce(id: string): Promise<any> {
    return api.delete(`/produce/${id}`);
  }

  /**
   * Mark produce as available for sale
   */
  async markAvailableForSale(id: string): Promise<any> {
    return api.post(`/produce/${id}/available`, {});
  }

  /**
   * Mark produce as sold out
   */
  async markSoldOut(id: string): Promise<any> {
    return api.post(`/produce/${id}/sold-out`, {});
  }

  /**
   * Get all available produce (for buyers)
   */
  async getAvailableProduce(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: {
      latitude: number;
      longitude: number;
      radius: number; // in km
    };
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.location) {
        queryParams.append('lat', filters.location.latitude.toString());
        queryParams.append('lng', filters.location.longitude.toString());
        queryParams.append('radius', filters.location.radius.toString());
      }
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return api.get(`/produce/available${query}`);
  }
}

export default new ProduceService(); 