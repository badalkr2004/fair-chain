/**
 * @deprecated Use `bids.ts` instead. This file re-exports for backward compatibility.
 */
import api from './api';
import { 
  createBid, 
  getBidsForProduct, 
  getMyBids, 
  updateBid, 
  cancelBid, 
  respondToBid,
  type CreateBidDTO 
} from './bids';

/**
 * Legacy BidService class — wraps the new exported functions
 * for backward compat with screens that use `bidService.method()` pattern.
 */
class BidService {
  async getMyBids(status?: string): Promise<any> {
    return getMyBids(status);
  }

  async getBidsByProduct(productId: string): Promise<any> {
    return getBidsForProduct(productId);
  }

  async createBid(data: CreateBidDTO): Promise<any> {
    return createBid(data);
  }

  async updateBid(bidId: string, data: Partial<CreateBidDTO>): Promise<any> {
    return updateBid(bidId, data);
  }

  async cancelBid(bidId: string): Promise<any> {
    return cancelBid(bidId);
  }

  async getBidById(bidId: string): Promise<any> {
    return api.get(`/bids/${bidId}`);
  }

  async acceptBid(bidId: string, reason?: string): Promise<any> {
    return respondToBid(bidId, { status: 'ACCEPTED', responseReason: reason });
  }

  async rejectBid(bidId: string, reason?: string): Promise<any> {
    return respondToBid(bidId, { status: 'REJECTED', responseReason: reason });
  }
}

export default new BidService();