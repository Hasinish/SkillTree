// backend/src/server.js
import { app, ensureDB } from "./app.js";

const PORT = process.env.PORT || 5001;
ensureDB().then(() => {
  app.listen(PORT, () => console.log("Server running on port", PORT));
});
