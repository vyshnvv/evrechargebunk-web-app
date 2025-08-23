import express from "express";
// Update the import to include getRecentUsers
import {
  getUserStats,
  getRecentUsers,
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../controllers/user.controller.js";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/users/stats - Get user statistics (admin only)
router.get("/stats", protectRoute, adminOnly, getUserStats);

// --- ADD THIS NEW ROUTE ---
// GET /api/users/recent - Get recent user registrations (admin only)
router.get("/recent", protectRoute, adminOnly, getRecentUsers);

router.get("/profile", protectRoute, getUserProfile);
router.put("/profile", protectRoute, updateUserProfile);
router.put("/change-password", protectRoute, changePassword);

export default router;
