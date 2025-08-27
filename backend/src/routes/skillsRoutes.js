import express from "express";
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  createCustomSkill, 
} from "../controllers/skillsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllSkills);


router.post("/custom", protect, createCustomSkill);

router.get("/:id", getSkillById);

router.post("/", protect, admin, createSkill);
router.put("/:id", protect, admin, updateSkill);
router.delete("/:id", protect, admin, deleteSkill);

export default router;
