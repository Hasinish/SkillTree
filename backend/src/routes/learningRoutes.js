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

router.get("/", getLearningSkills);
router.get("/:skillId", getLearningSkill);
router.post("/:skillId", startLearning);
router.patch("/:skillId/task/:taskIndex", toggleTask);

export default router;
