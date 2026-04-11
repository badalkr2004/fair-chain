import { Router } from 'express';
import { ProduceController } from '../controllers/produce.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateRequest } from '../middleware/validation.middleware';
import { createProduceSchema, updateProduceSchema } from '../lib/validation/produce.schema';

const router = Router();
const produceController = new ProduceController();

// Specific routes BEFORE parameter routes
// Get produce for logged-in farmer (requires authentication)
router.get('/my-produce', asyncHandler(authenticate), asyncHandler(produceController.getMyProduce.bind(produceController)));

// Get produce by farmer ID
router.get('/farmer/:farmerId', asyncHandler(produceController.getProduceByFarmerId.bind(produceController)));

// Get all produce
router.get('/', asyncHandler(produceController.getAllProduce.bind(produceController)));

// Get produce by ID — MUST be after /my-produce and /farmer/:farmerId
router.get('/:id', asyncHandler(produceController.getProduceById.bind(produceController)));

// Create produce (requires authentication)
router.post('/', asyncHandler(authenticate), validateRequest(createProduceSchema), asyncHandler(produceController.createProduce.bind(produceController)));

// Update produce (requires authentication)
router.put('/:id', asyncHandler(authenticate), validateRequest(updateProduceSchema), asyncHandler(produceController.updateProduce.bind(produceController)));

// Delete produce (requires authentication)
router.delete('/:id', asyncHandler(authenticate), asyncHandler(produceController.deleteProduce.bind(produceController)));

export default router;
