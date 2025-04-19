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

const router = Router();

// Public routes
router.get("/demand", getDemandForecasts);
router.get("/market-trends", getMarketPriceTrends);

// Admin only routes
router.post("/models", authenticate, isAdmin, createForecastModel);
router.post("/models/:modelId/predictions", authenticate, isAdmin, addPrediction);
router.post("/models/:modelId/apply", authenticate, isAdmin, applyDemandPredictions);
router.post("/market-prices", authenticate, isAdmin, addMarketPrice);

export default router;
