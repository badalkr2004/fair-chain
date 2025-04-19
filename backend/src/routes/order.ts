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

const router = Router();

// Protected routes (require authentication)
// Order routes
router.post("/", authenticate, isConsumer, createOrder);
router.get("/:id", authenticate, getOrderById);
router.patch("/:id/status", authenticate, updateOrderStatus);

// Consumer routes
router.get("/my/orders", authenticate, isConsumer, getMyOrders);

// Farmer routes
router.get("/farmer/orders", authenticate, isFarmer, getFarmerOrders);

// Admin routes
router.get("/", authenticate, isAdmin, getAllOrders);

export default router;