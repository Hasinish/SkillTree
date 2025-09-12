// backend/src/server.js
import { app, ensureDB } from "./app.js";

const PORT = process.env.PORT || 10000;
ensureDB().then(() => {
  app.listen(PORT, () => console.log("Server running on port", PORT));
});
