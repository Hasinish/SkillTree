import express from "express";
import {
  startLearning,
  getLearningSkills,
  getLearningSkill,
  toggleTask,
  getDecorations,   // NEW
  saveDecorations,  // NEW
} from "../controllers/learningController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/", getLearningSkills);
router.get("/:skillId", getLearningSkill);
router.post("/:skillId", startLearning);
router.patch("/:skillId/task/:taskIndex", toggleTask);

// NEW: decorations
router.get("/:skillId/decorations", getDecorations);
router.put("/:skillId/decorations", saveDecorations);

export default router;
