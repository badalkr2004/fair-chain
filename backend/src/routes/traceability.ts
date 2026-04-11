import { Router } from "express";
import { 
  getTraceabilityRecord,
  getProductTraceability,
  verifyTraceability,
  addTraceabilityRecord,
  getMyTraceableProducts
} from "../controllers/traceability.controller";
import { authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

// Public routes
router.get("/record/:identifier", asyncHandler(getTraceabilityRecord));
router.get("/product/:productId", asyncHandler(getProductTraceability));
router.get("/verify/:recordId", asyncHandler(verifyTraceability));

// Protected routes (require authentication)
router.post("/record", asyncHandler(authenticate), asyncHandler(addTraceabilityRecord));
router.get("/products/my", asyncHandler(authenticate), asyncHandler(getMyTraceableProducts));

export default router;