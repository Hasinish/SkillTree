import express from "express";
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skillsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public read
router.get("/", getAllSkills);
router.get("/:id", getSkillById);

// Admin-only write
router.post("/", protect, admin, createSkill);
router.put("/:id", protect, admin, updateSkill);
router.delete("/:id", protect, admin, deleteSkill);

export default router;
