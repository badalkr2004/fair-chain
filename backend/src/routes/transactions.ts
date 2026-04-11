import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateRequest } from '../middleware/validation.middleware';
import { createTransactionSchema, updateTransactionSchema } from '../lib/validation/transaction.schema';

const router = Router();
const transactionController = new TransactionController();

// Specific routes MUST come before /:id parameter routes
// Get transactions by user ID (sender or receiver)
router.get('/user/:userId', asyncHandler(authenticate), asyncHandler(transactionController.getTransactionsByUserId.bind(transactionController)));

// Get transactions by product ID
router.get('/product/:productId', asyncHandler(authenticate), asyncHandler(transactionController.getTransactionsByProductId.bind(transactionController)));

// Get all transactions
router.get('/', asyncHandler(authenticate), asyncHandler(transactionController.getAllTransactions.bind(transactionController)));

// Get transaction by ID — MUST be after /user/ and /product/ routes
router.get('/:id', asyncHandler(authenticate), asyncHandler(transactionController.getTransactionById.bind(transactionController)));

// Create transaction (requires authentication)
router.post('/', asyncHandler(authenticate), validateRequest(createTransactionSchema), asyncHandler(transactionController.createTransaction.bind(transactionController)));

// Update transaction (requires authentication)
router.put('/:id', asyncHandler(authenticate), validateRequest(updateTransactionSchema), asyncHandler(transactionController.updateTransaction.bind(transactionController)));

// Process payment
router.post('/:id/process-payment', asyncHandler(authenticate), asyncHandler(transactionController.processPayment.bind(transactionController)));

// Record delivery
router.post('/:id/record-delivery', asyncHandler(authenticate), asyncHandler(transactionController.recordDelivery.bind(transactionController)));

export default router;
