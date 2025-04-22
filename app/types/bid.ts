/**
 * Enum representing the possible states of a bid
 */
export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

/**
 * Interface for Bid data structure
 */
export interface Bid {
  id: string;
  productId: string;
  intermediaryId: string;
  price: number;
  quantity: number;
  serviceType: string;
  description: string;
  validUntil: string;
  terms?: string;
  status: BidStatus;
  responseReason?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional when not populated)
  product?: any;
  intermediary?: any;
}

/**
 * Interface for creating a new bid
 */
export interface CreateBidRequest {
  productId: string;
  price: number;
  quantity: number;
  serviceType: string;
  description: string;
  validUntil: string;
  terms?: string;
}

/**
 * Interface for bid response from API
 */
export interface BidResponse {
  id: string;
  status: BidStatus;
  message: string;
  bid: Bid;
} 