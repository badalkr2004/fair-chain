import express from 'express';
import { ProduceController } from '../controllers/produce.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { createProduceSchema, updateProduceSchema } from '../lib/validation/produce.schema.js';

const router = express.Router();
const produceController = new ProduceController();

// Get all produce
router.get('/', produceController.getAllProduce);

// Get produce for logged-in farmer (requires authentication)
router.get('/my-produce', authenticate, produceController.getMyProduce);

// Get produce by farmer ID
router.get('/farmer/:farmerId', produceController.getProduceByFarmerId);

// Get produce by ID
router.get('/:id', produceController.getProduceById);

// Create produce (requires authentication)
router.post('/', authenticate, validateRequest(createProduceSchema), produceController.createProduce);

// Update produce (requires authentication)
router.put('/:id', authenticate, validateRequest(updateProduceSchema), produceController.updateProduce);

// Delete produce (requires authentication)
router.delete('/:id', authenticate, produceController.deleteProduce);

export default router;
