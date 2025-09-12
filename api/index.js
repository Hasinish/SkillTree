// api/index.js  (serverless function handler)
import { app, ensureDB } from "../backend/src/app.js";

export default async function handler(req, res) {
  try {
    await ensureDB();
    return app(req, res); // hand off to Express
  } catch (err) {
    console.error("API error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
