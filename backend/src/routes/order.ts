import { Router } from "express";
import { 
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  getFarmerOrders
} from "../controllers/order.controller";
import { 
  authenticate, 
  isAdmin, 
  isConsumer, 
  isFarmer 
} from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

// Specific routes MUST come before /:id parameter routes
// Consumer routes
router.get("/my/orders", asyncHandler(authenticate), isConsumer, asyncHandler(getMyOrders));

// Farmer routes
router.get("/farmer/orders", asyncHandler(authenticate), isFarmer, asyncHandler(getFarmerOrders));

// Order CRUD
router.post("/", asyncHandler(authenticate), isConsumer, asyncHandler(createOrder));
router.get("/:id", asyncHandler(authenticate), asyncHandler(getOrderById)); // Must be AFTER specific paths
router.patch("/:id/status", asyncHandler(authenticate), asyncHandler(updateOrderStatus));

// Admin routes
router.get("/", asyncHandler(authenticate), isAdmin, asyncHandler(getAllOrders));

export default router;