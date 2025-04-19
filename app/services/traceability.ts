import api from './api';

/**
 * Service for handling traceability and supply chain features
 */
class TraceabilityService {
  /**
   * Get full supply chain journey for a product
   */
  async getProductJourney(productId: string): Promise<any> {
    return api.get(`/traceability/product/${productId}`);
  }

  /**
   * Get supply chain node details
   */
  async getNodeDetails(nodeId: string): Promise<any> {
    return api.get(`/traceability/node/${nodeId}`);
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
  }): Promise<any> {
    return api.post('/supplyChain/event', data);
  }

  /**
   * Get supply chain events for a product
   */
  async getProductEvents(productId: string): Promise<any> {
    return api.get(`/supplyChain/events/${productId}`);
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
  }): Promise<any> {
    return api.post('/supplyChain/register', data);
  }

  /**
   * Get all traceable products
   */
  async getMyTraceableProducts(): Promise<any> {
    return api.get('/supplyChain/my-products');
  }

  /**
   * Get QR code for a product
   */
  async getProductQRCode(productId: string): Promise<any> {
    return api.get(`/traceability/qr/${productId}`);
  }

  /**
   * Verify a product's authenticity
   */
  async verifyProduct(verificationCode: string): Promise<any> {
    return api.get(`/traceability/verify/${verificationCode}`);
  }
}

export default new TraceabilityService(); 