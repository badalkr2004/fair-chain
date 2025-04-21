import api from './api';
import { BidStatus } from '../types/bid';

interface CreateBidRequest {
  productId: string;
  price: number;
  quantity: number;
  serviceType: string;
  description: string;
  validUntil: string;
  terms?: string;
}

/**
 * Service for handling bid-related API calls
 */
class BidService {
  /**
   * Get all bids for the logged-in intermediary
   * @param status Optional status filter
   */
  async getMyBids(status?: string): Promise<any> {
    const endpoint = status ? `/bids/my-bids?status=${status}` : '/bids/my-bids';
    return api.get(endpoint);
  }

  /**
   * Get bids by product ID
   */
  async getBidsByProduct(productId: string): Promise<any> {
    return api.get(`/bids/product/${productId}`);
  }

  /**
   * Place a new bid on a product
   */
  async createBid(data: CreateBidRequest): Promise<any> {
    return api.post('/bids', data);
  }

  /**
   * Update an existing bid
   */
  async updateBid(bidId: string, data: Partial<CreateBidRequest>): Promise<any> {
    return api.put(`/bids/${bidId}`, data);
  }

  /**
   * Cancel a bid
   */
  async cancelBid(bidId: string): Promise<any> {
    return api.post(`/bids/${bidId}/cancel`, {});
  }

  /**
   * Get a single bid by ID
   */
  async getBidById(bidId: string): Promise<any> {
    return api.get(`/bids/${bidId}`);
  }

  /**
   * For farmers to accept a bid
   */
  async acceptBid(bidId: string, reason?: string): Promise<any> {
    return api.post(`/bids/${bidId}/accept`, { reason });
  }

  /**
   * For farmers to reject a bid
   */
  async rejectBid(bidId: string, reason?: string): Promise<any> {
    return api.post(`/bids/${bidId}/reject`, { reason });
  }

  /**
   * Update a bid's status
   */
  async updateBidStatus(bidId: string, status: string, notes?: string): Promise<any> {
    return api.post(`/bids/${bidId}/status`, { status, notes });
  }
}

export default new BidService();