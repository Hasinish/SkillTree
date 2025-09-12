// backend/src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import skillsRoutes from "./routes/skillsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import learningRoutes from "./routes/learningRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import streakRoutes from "./routes/streakRoutes.js";
import reflectionsRoutes from "./routes/reflectionsRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";

dotenv.config();

let didConnect = false;
export async function ensureDB() {
  if (!didConnect) {
    await connectDB();
    didConnect = true;
  }
}

export const app = express();

// If you know your production origin, set CORS_ORIGIN in Vercel env.
// Otherwise, same-origin `/api` calls from your SPA will work fine.
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json());

// Routes (same as your current server)
app.use("/api/skills", skillsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/reflections", reflectionsRoutes);
app.use("/api/shop", shopRoutes);
