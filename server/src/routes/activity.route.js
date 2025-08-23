import express from "express";
import { getRecentActivity } from "../controllers/activity.controller.js";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/activity/recent - Get a combined list of recent activities
router.get("/recent", protectRoute, adminOnly, getRecentActivity);

export default router;
