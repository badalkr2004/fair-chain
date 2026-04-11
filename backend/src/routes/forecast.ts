import { Router } from "express";
import { 
  getDemandForecasts,
  createForecastModel,
  addPrediction,
  applyDemandPredictions,
  getMarketPriceTrends,
  addMarketPrice
} from "../controllers/forecast.controller";
import { authenticate, isAdmin } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

// Public routes
router.get("/demand", asyncHandler(getDemandForecasts));
router.get("/market-trends", asyncHandler(getMarketPriceTrends));

// Admin only routes
router.post("/models", asyncHandler(authenticate), isAdmin, asyncHandler(createForecastModel));
router.post("/models/:modelId/predictions", asyncHandler(authenticate), isAdmin, asyncHandler(addPrediction));
router.post("/models/:modelId/apply", asyncHandler(authenticate), isAdmin, asyncHandler(applyDemandPredictions));
router.post("/market-prices", asyncHandler(authenticate), isAdmin, asyncHandler(addMarketPrice));

export default router;
