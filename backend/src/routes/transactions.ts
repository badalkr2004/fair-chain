import express from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createTransactionSchema, updateTransactionSchema } from '../lib/validation/transaction.schema.js';

const router = express.Router();
const transactionController = new TransactionController();

// Get all transactions
router.get('/', authenticate, transactionController.getAllTransactions);

// Get transaction by ID
router.get('/:id', authenticate, transactionController.getTransactionById);

// Create transaction (requires authentication)
router.post('/', authenticate, validateRequest(createTransactionSchema), transactionController.createTransaction);

// Update transaction (requires authentication)
router.put('/:id', authenticate, validateRequest(updateTransactionSchema), transactionController.updateTransaction);

// Get transactions by user ID (sender or receiver)
router.get('/user/:userId', authenticate, transactionController.getTransactionsByUserId);

// Get transactions by product ID
router.get('/product/:productId', authenticate, transactionController.getTransactionsByProductId);

// Process payment
router.post('/:id/process-payment', authenticate, transactionController.processPayment);

// Record delivery
router.post('/:id/record-delivery', authenticate, transactionController.recordDelivery);

export default router;
