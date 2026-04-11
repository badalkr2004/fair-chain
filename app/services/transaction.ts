/**
 * @deprecated Use `transactions.ts` instead. This file re-exports for backward compatibility.
 */
import {
  getMyTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  getProductTransactions,
  processPayment,
  type Transaction,
  type CreateTransactionDTO,
  type UpdateTransactionDTO
} from './transactions';

export type { Transaction, CreateTransactionDTO, UpdateTransactionDTO };

export default {
  getMyTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus: async (id: string, status: string, notes?: string) => {
    return updateTransaction(id, { 
      status: status as UpdateTransactionDTO['status'], 
      notes 
    });
  },
  getProductTransactions,
  getMyTransactionStats: async () => {
    // Backend doesn't have a stats endpoint — return transactions instead
    return getMyTransactions();
  }
};
