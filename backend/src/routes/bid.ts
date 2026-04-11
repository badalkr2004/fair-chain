import { Router } from 'express';
import { BidController } from '../controllers/bid.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateRequest } from '../middleware/validation.middleware';
import { createBidSchema, updateBidSchema, respondToBidSchema } from '../lib/validation/bid.schema';

const router = Router();
const bidController = new BidController();

// Specific routes BEFORE parameter routes
// Get bids made by the current intermediary
router.get('/my-bids', asyncHandler(authenticate), asyncHandler(bidController.getMyBids.bind(bidController)));

// Get bids for a specific product
router.get('/product/:productId', asyncHandler(authenticate), asyncHandler(bidController.getProductBids.bind(bidController)));

// Create a new bid (requires authentication)
router.post('/', asyncHandler(authenticate), validateRequest(createBidSchema), asyncHandler(bidController.createBid.bind(bidController)));

// Update an existing bid
router.put('/:id', asyncHandler(authenticate), validateRequest(updateBidSchema), asyncHandler(bidController.updateBid.bind(bidController)));

// Cancel a bid
router.post('/:id/cancel', asyncHandler(authenticate), asyncHandler(bidController.cancelBid.bind(bidController)));

// Respond to a bid (accept or reject)
router.post('/:id/respond', asyncHandler(authenticate), validateRequest(respondToBidSchema), asyncHandler(bidController.respondToBid.bind(bidController)));

export default router;