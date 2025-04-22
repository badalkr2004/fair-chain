import { Router } from "express";
import { 
  getTraceabilityRecord,
  getProductTraceability,
  verifyTraceability,
  addTraceabilityRecord,
  getMyTraceableProducts
} from "../controllers/traceability.controller";
import { authenticate, isFarmer, isAdmin } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/record/:identifier", getTraceabilityRecord);
router.get("/product/:productId", getProductTraceability);
router.get("/verify/:recordId", verifyTraceability);

// Protected routes (require authentication)
router.post("/record", authenticate, addTraceabilityRecord);
router.get("/products/my", authenticate, getMyTraceableProducts);

export default router; 