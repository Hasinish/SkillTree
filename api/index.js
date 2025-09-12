// api/index.js
import { app, ensureDB } from "../backend/src/app.js";

export default async function handler(req, res) {
  try {
    await ensureDB();
    return app(req, res);
  } catch (err) {
    console.error("API error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
