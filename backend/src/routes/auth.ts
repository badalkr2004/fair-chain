import { Router } from "express";
import { 
  signup, 
  login, 
  refreshToken,
  getUserProfile, 
  updateUserProfile, 
  changePassword 
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

// Public routes
router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));
router.post("/refresh-token", asyncHandler(refreshToken));

// Protected routes (require authentication)
router.get("/profile", asyncHandler(authenticate), asyncHandler(getUserProfile));
router.put("/profile", asyncHandler(authenticate), asyncHandler(updateUserProfile));
router.post("/change-password", asyncHandler(authenticate), asyncHandler(changePassword));

export default router;
