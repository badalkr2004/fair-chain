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
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

// Protected routes (must be BEFORE /:id to avoid being caught by param route)
router.get("/my/products", asyncHandler(authenticate), isFarmer, asyncHandler(getMyProducts));

// Public routes - specific paths before parameterized
router.get("/", asyncHandler(getProducts));
router.get("/farmer/:farmerId", asyncHandler(getProductsByFarmer));
router.get("/:id", asyncHandler(getProductById)); // Must be LAST among GET routes

// Farmer only routes
router.post("/", asyncHandler(authenticate), isFarmer, asyncHandler(createProduct));
router.put("/:id", asyncHandler(authenticate), isFarmer, asyncHandler(updateProduct));
router.delete("/:id", asyncHandler(authenticate), isFarmer, asyncHandler(deleteProduct));

export default router;