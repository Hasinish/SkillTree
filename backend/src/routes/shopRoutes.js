// backend/src/routes/shopRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getItems, buyItem } from "../controllers/shopController.js";

const router = express.Router();
router.use(protect);

router.get("/items", getItems);
router.post("/buy/:itemId", buyItem);

export default router;
