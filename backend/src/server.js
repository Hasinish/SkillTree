import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import skillsRoutes from "./routes/skillsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import learningRoutes from "./routes/learningRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/skills", skillsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/learning", learningRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Server running on port", PORT));
