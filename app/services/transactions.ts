import api from './api';

/**
 * Service for handling transactions, bids, and orders
 */
class TransactionsService {
  // ======= BIDS ========
  /**
   * Get all bids received (for farmers)
   */
  async getMyReceivedBids(): Promise<any> {
    return api.get('/bid/received');
  }

  /**
   * Get all bids placed (for buyers)
   */
  async getMyPlacedBids(): Promise<any> {
    return api.get('/bid/placed');
  }

  /**
   * Place a bid on a produce
   */
  async placeBid(data: {
    produceId: string;
    price: number;
    quantity: number;
    message?: string;
    deliveryDetails?: {
      address: string;
      date: string;
      instructions?: string;
    };
  }): Promise<any> {
    return api.post('/bid', data);
  }

  /**
   * Accept a bid
   */
  async acceptBid(bidId: string): Promise<any> {
    return api.post(`/bid/${bidId}/accept`, {});
  }

  /**
   * Reject a bid
   */
  async rejectBid(bidId: string, reason?: string): Promise<any> {
    return api.post(`/bid/${bidId}/reject`, { reason });
  }

  /**
   * Withdraw a bid
   */
  async withdrawBid(bidId: string): Promise<any> {
    return api.post(`/bid/${bidId}/withdraw`, {});
  }

  /**
   * Get bid by ID
   */
  async getBidById(bidId: string): Promise<any> {
    return api.get(`/bid/${bidId}`);
  }

  // ======= ORDERS ========
  /**
   * Get all orders (for buyer or seller)
   */
  async getMyOrders(): Promise<any> {
    return api.get('/order/my-orders');
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<any> {
    return api.get(`/order/${orderId}`);
  }

  /**
   * Update order status (for seller)
   */
  async updateOrderStatus(orderId: string, status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'): Promise<any> {
    return api.put(`/order/${orderId}/status`, { status });
  }

  /**
   * Confirm order delivery (for buyer)
   */
  async confirmDelivery(orderId: string): Promise<any> {
    return api.post(`/order/${orderId}/confirm-delivery`, {});
  }

  // ======= TRANSACTIONS ========
  /**
   * Get all transactions
   */
  async getMyTransactions(): Promise<any> {
    return api.get('/transactions/my-transactions');
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<any> {
    return api.get(`/transactions/${transactionId}`);
  }

  /**
   * Make a payment (dummy implementation for demo)
   */
  async makePayment(orderId: string, paymentDetails: {
    method: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'WALLET';
    amount: number;
  }): Promise<any> {
    return api.post(`/transactions/pay/${orderId}`, paymentDetails);
  }
}

export default new TransactionsService(); 