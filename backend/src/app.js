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

/** CORS: allow one or multiple origins via env CORS_ORIGIN (CSV) */
function parseOrigins(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
const allowed = parseOrigins(process.env.CORS_ORIGIN);
const corsOrigin = allowed.length ? allowed : true;

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/skills", skillsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/reflections", reflectionsRoutes);
app.use("/api/shop", shopRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));
