import express from 'express';
import { SupplyChainController } from '../controllers/supplyChain.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createSupplyChainSchema, updateSupplyChainSchema } from '../lib/validation/supplyChain.schema.js';

const router = express.Router();
const supplyChainController = new SupplyChainController();

// Get all supply chains
router.get('/', supplyChainController.getAllSupplyChains);

// Get supply chain by ID
router.get('/:id', supplyChainController.getSupplyChainById);

// Create supply chain (requires authentication)
router.post('/', authenticate, validateRequest(createSupplyChainSchema), supplyChainController.createSupplyChain);

// Update supply chain (requires authentication)
router.put('/:id', authenticate, validateRequest(updateSupplyChainSchema), supplyChainController.updateSupplyChain);

// Delete supply chain (requires authentication)
router.delete('/:id', authenticate, supplyChainController.deleteSupplyChain);

// Add link to supply chain
router.post('/:id/links', authenticate, supplyChainController.addSupplyChainLink);

// Get product supply chain
router.get('/product/:productId', supplyChainController.getProductSupplyChain);

export default router;
