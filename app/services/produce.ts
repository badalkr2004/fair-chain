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
    try {
      return await api.get(`/produce/available${query}`);
    } catch (error) {
      console.error('Error loading available produce:', error);
      // Return mock data as fallback
      return {
        success: true,
        data: this.getMockAvailableProduce()
      };
    }
  }
  
  /**
   * Generate mock produce data for development and testing
   * @private
   */
  private getMockAvailableProduce(): any[] {
    return [
      {
        id: 'p1',
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        quantity: 100,
        unit: 'kg',
        basePrice: 25,
        currentPrice: 25,
        harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        availableUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Fresh organic tomatoes grown without pesticides',
        certifications: ['Organic', 'Non-GMO'],
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea'],
        farmerId: 'f1',
        farmer: {
          name: 'John Smith',
          location: 'Bangalore Rural',
          rating: 4.8
        },
        location: {
          lat: 13.0827,
          lng: 77.5877
        },
        status: 'AVAILABLE'
      },
      {
        id: 'p2',
        name: 'Fresh Apples',
        category: 'Fruits',
        quantity: 200,
        unit: 'kg',
        basePrice: 80,
        currentPrice: 80,
        harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        availableUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Sweet and juicy apples from the hills',
        certifications: ['Pesticide-Free'],
        images: ['https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a'],
        farmerId: 'f2',
        farmer: {
          name: 'Rajesh Kumar',
          location: 'Shimla',
          rating: 4.6
        },
        location: {
          lat: 31.1048,
          lng: 77.1734
        },
        status: 'AVAILABLE'
      },
      {
        id: 'p3',
        name: 'Basmati Rice',
        category: 'Grains',
        quantity: 500,
        unit: 'kg',
        basePrice: 120,
        currentPrice: 120,
        harvestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        availableUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Premium long-grain aromatic rice',
        certifications: ['Organic', 'Export Quality'],
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e8ac'],
        farmerId: 'f3',
        farmer: {
          name: 'Amit Singh',
          location: 'Punjab',
          rating: 4.9
        },
        location: {
          lat: 30.9010,
          lng: 75.8573
        },
        status: 'AVAILABLE'
      }
    ];
  }
}

export default new ProduceService();