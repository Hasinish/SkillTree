import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { submitReflection } from "../controllers/reflectionsController.js";

const router = express.Router();
router.use(protect);

router.post("/", submitReflection); // call when a weekly reflection is submitted

export default router;
