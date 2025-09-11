import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMe, getLeaderboard } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.get("/leaderboard", protect, getLeaderboard);

export default router;
