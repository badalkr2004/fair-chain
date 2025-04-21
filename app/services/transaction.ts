import api from './api';

export interface Transaction {
  id: string;
  productId: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency?: string;
  quantity: number;
  unit: string;
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

export interface UpdateTransactionStatusDTO {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

/**
 * Get all transactions for the current user
 */
const getMyTransactions = async (status?: string) => {
  try {
    const endpoint = status ? `/transactions/my?status=${status}` : '/transactions/my';
    return await api.get(endpoint);
  } catch (error) {
    console.error('Error fetching my transactions:', error);
    throw error;
  }
};

/**
 * Get transaction by ID
 */
const getTransactionById = async (id: string) => {
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
const createTransaction = async (data: CreateTransactionDTO) => {
  try {
    return await api.post('/transactions', data);
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Update transaction status
 */
const updateTransactionStatus = async (id: string, status: string, notes?: string) => {
  try {
    const data: UpdateTransactionStatusDTO = { 
      status: status as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED',
    };
    
    if (notes) data.notes = notes;
    
    return await api.post(`/transactions/${id}/status`, data);
  } catch (error) {
    console.error(`Error updating transaction status ${id}:`, error);
    throw error;
  }
};

/**
 * Get transactions for a specific product
 */
const getProductTransactions = async (productId: string) => {
  try {
    return await api.get(`/transactions/product/${productId}`);
  } catch (error) {
    console.error(`Error fetching transactions for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Get transaction statistics for the current user
 */
const getMyTransactionStats = async () => {
  try {
    return await api.get('/transactions/my/stats');
  } catch (error) {
    console.error('Error fetching transaction statistics:', error);
    throw error;
  }
};

export default {
  getMyTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  getProductTransactions,
  getMyTransactionStats
};
