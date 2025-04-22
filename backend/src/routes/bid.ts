import express from 'express';
import { BidController } from '../controllers/bid.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createBidSchema, updateBidSchema, respondToBidSchema } from '../lib/validation/bid.schema.js';

const router = express.Router();
const bidController = new BidController();

// Create a new bid (requires authentication)
router.post('/', authenticate, validateRequest(createBidSchema), bidController.createBid);

// Get bids for a specific product
router.get('/product/:productId', authenticate, bidController.getProductBids);

// Get bids made by the current intermediary
router.get('/my-bids', authenticate, bidController.getMyBids);

// Update an existing bid
router.put('/:id', authenticate, validateRequest(updateBidSchema), bidController.updateBid);

// Cancel a bid
router.post('/:id/cancel', authenticate, bidController.cancelBid);

// Respond to a bid (accept or reject)
router.post('/:id/respond', authenticate, validateRequest(respondToBidSchema), bidController.respondToBid);

export default router; 