import express from "express";
import {
  startLearning,
  getLearningSkills,
  getLearningSkill,
  toggleTask,
} from "../controllers/learningController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

// List all your learning entries
router.get("/", getLearningSkills);

// Get one skill + your progress
router.get("/:skillId", getLearningSkill);

// Start learning a new skill
router.post("/:skillId", startLearning);

// Toggle a task complete/incomplete
router.patch("/:skillId/task/:taskIndex", toggleTask);

export default router;
