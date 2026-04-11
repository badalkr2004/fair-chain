import api from './api';

export interface Transaction {
  id: string;
  productId?: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency?: string;
  quantity?: number;
  unit?: string;
  type: 'SALE' | 'PURCHASE' | 'PAYMENT' | 'REFUND';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  product?: any;
  sender?: any;
  receiver?: any;
}

export interface CreateTransactionDTO {
  productId: string;
  receiverId: string;
  amount: number;
  currency?: string;
  quantity: number;
  unit: string;
  type: 'SALE' | 'PURCHASE' | 'PAYMENT' | 'REFUND';
  metadata?: any;
}

export interface UpdateTransactionDTO {
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

/**
 * Get all transactions for the current user
 */
export const getMyTransactions = async (status?: string) => {
  try {
    // Backend route: GET /transactions (returns user's transactions based on auth)
    const endpoint = status ? `/transactions?status=${status}` : '/transactions';
    return await api.get(endpoint);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (id: string) => {
  try {
    return await api.get(`/transactions/${id}`);
  } catch (error) {
    console.error(`Error fetching transaction with id ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new transaction
 */
export const createTransaction = async (data: CreateTransactionDTO) => {
  try {
    return await api.post('/transactions', data);
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Update transaction
 */
export const updateTransaction = async (id: string, data: UpdateTransactionDTO) => {
  try {
    return await api.put(`/transactions/${id}`, data);
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    throw error;
  }
};

/**
 * Get transactions for a specific product
 */
export const getProductTransactions = async (productId: string) => {
  try {
    return await api.get(`/transactions/product/${productId}`);
  } catch (error) {
    console.error(`Error fetching transactions for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Get transactions by user ID
 */
export const getTransactionsByUser = async (userId: string) => {
  try {
    return await api.get(`/transactions/user/${userId}`);
  } catch (error) {
    console.error(`Error fetching transactions for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Process payment for a transaction
 */
export const processPayment = async (transactionId: string, paymentDetails: {
  method: string;
  amount: number;
}) => {
  try {
    return await api.post(`/transactions/${transactionId}/process-payment`, paymentDetails);
  } catch (error) {
    console.error(`Error processing payment for ${transactionId}:`, error);
    throw error;
  }
};

/**
 * Record delivery for a transaction
 */
export const recordDelivery = async (transactionId: string, deliveryDetails: {
  location?: any;
  notes?: string;
}) => {
  try {
    return await api.post(`/transactions/${transactionId}/record-delivery`, deliveryDetails);
  } catch (error) {
    console.error(`Error recording delivery for ${transactionId}:`, error);
    throw error;
  }
};