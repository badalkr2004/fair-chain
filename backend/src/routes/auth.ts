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

const router = Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes (require authentication)
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);
router.post("/change-password", authenticate, changePassword);

export default router;
