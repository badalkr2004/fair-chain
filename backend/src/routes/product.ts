import { Router } from "express";
import { 
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByFarmer,
  getMyProducts
} from "../controllers/product.controller";
import { authenticate, isFarmer } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/farmer/:farmerId", getProductsByFarmer);

// Protected routes (require authentication)
// Farmer only routes
router.post("/", authenticate, isFarmer, createProduct);
router.put("/:id", authenticate, isFarmer, updateProduct);
router.delete("/:id", authenticate, isFarmer, deleteProduct);
router.get("/my-products", authenticate, isFarmer, getMyProducts);

export default router; 