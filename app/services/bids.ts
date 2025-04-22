import api from './api';

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
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  responseReason?: string;
  createdAt: string;
  updatedAt: string;
  product?: any;
  intermediary?: any;
}

export interface CreateBidDTO {
  productId: string;
  price: number;
  quantity: number;
  serviceType: string;
  description: string;
  validUntil: string;
  terms?: string;
}

export interface UpdateBidDTO {
  price?: number;
  quantity?: number;
  serviceType?: string;
  description?: string;
  validUntil?: string;
  terms?: string;
}

export interface RespondToBidDTO {
  status: 'ACCEPTED' | 'REJECTED';
  responseReason?: string;
}

export const createBid = async (bidData: CreateBidDTO) => {
  try {
    return await api.post('/bids', bidData);
  } catch (error) {
    console.error('Error creating bid:', error);
    throw error;
  }
};

export const getBidsForProduct = async (productId: string) => {
  try {
    return await api.get(`/bids/product/${productId}`);
  } catch (error) {
    console.error(`Error fetching bids for product ${productId}:`, error);
    throw error;
  }
};

export const getMyBids = async () => {
  try {
    return await api.get('/bids/my-bids');
  } catch (error) {
    console.error('Error fetching my bids:', error);
    throw error;
  }
};

export const updateBid = async (id: string, bidData: UpdateBidDTO) => {
  try {
    return await api.put(`/bids/${id}`, bidData);
  } catch (error) {
    console.error(`Error updating bid ${id}:`, error);
    throw error;
  }
};

export const cancelBid = async (id: string) => {
  try {
    return await api.post(`/bids/${id}/cancel`, {});
  } catch (error) {
    console.error(`Error cancelling bid ${id}:`, error);
    throw error;
  }
};

export const respondToBid = async (id: string, responseData: RespondToBidDTO) => {
  try {
    return await api.post(`/bids/${id}/respond`, responseData);
  } catch (error) {
    console.error(`Error responding to bid ${id}:`, error);
    throw error;
  }
}; 