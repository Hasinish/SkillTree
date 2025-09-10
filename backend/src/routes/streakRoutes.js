import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { tickStreak } from "../controllers/streakController.js";

const router = express.Router();
router.use(protect);

router.post("/tick", tickStreak); // call once after first task completion of the day

export default router;
