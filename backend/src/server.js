// backend/src/server.js
import { app, ensureDB } from "./app.js";

const PORT = process.env.PORT || 10000;

(async () => {
  try {
    await ensureDB();
    app.listen(PORT, () => console.log("HTTP server listening on", PORT));
  } catch (err) {
    console.error("❌ Failed to start server due to DB error:", err?.message);
    process.exit(1);
  }
})();
