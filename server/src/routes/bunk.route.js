import express from "express";
import {
  createBunk,
  getBunks,
  updateBunk,
  deleteBunk,
  getUserBunks,
  createReservation,
  cancelReservation,
} from "../controllers/bunk.controller.js";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, adminOnly, createBunk);
router.get("/", protectRoute, adminOnly, getBunks);
router.get("/user/bunks", protectRoute, getUserBunks);
router.patch("/:id", protectRoute, adminOnly, updateBunk);
router.delete("/:id", protectRoute, adminOnly, deleteBunk);

// NEW: Route for creating a reservation
router.post("/:bunkId/reserve", protectRoute, createReservation);

+router.patch(
  "/:bunkId/reservations/:reservationId/cancel",
  protectRoute,
  cancelReservation
);

export default router;
