import { Router } from 'express';
import { SupplyChainController } from '../controllers/supplyChain.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateRequest } from '../middleware/validation.middleware';
import { createSupplyChainSchema, updateSupplyChainSchema } from '../lib/validation/supplyChain.schema';

const router = Router();
const supplyChainController = new SupplyChainController();

// Specific routes before parameter routes
// Get product supply chain
router.get('/product/:productId', asyncHandler(supplyChainController.getProductSupplyChain.bind(supplyChainController)));

// Get all supply chains
router.get('/', asyncHandler(supplyChainController.getAllSupplyChains.bind(supplyChainController)));

// Get supply chain by ID — AFTER /product/:productId
router.get('/:id', asyncHandler(supplyChainController.getSupplyChainById.bind(supplyChainController)));

// Create supply chain (requires authentication)
router.post('/', asyncHandler(authenticate), validateRequest(createSupplyChainSchema), asyncHandler(supplyChainController.createSupplyChain.bind(supplyChainController)));

// Update supply chain (requires authentication)
router.put('/:id', asyncHandler(authenticate), validateRequest(updateSupplyChainSchema), asyncHandler(supplyChainController.updateSupplyChain.bind(supplyChainController)));

// Delete supply chain (requires authentication)
router.delete('/:id', asyncHandler(authenticate), asyncHandler(supplyChainController.deleteSupplyChain.bind(supplyChainController)));

// Add link to supply chain
router.post('/:id/links', asyncHandler(authenticate), asyncHandler(supplyChainController.addSupplyChainLink.bind(supplyChainController)));

export default router;
