// backend/src/config/db.js
import mongoose from "mongoose";

const redact = (uri = "") => {
  try {
    const u = new URL(uri);
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is missing. Set it in your Render Backend service → Environment.");
    throw new Error("MONGO_URI not set");
  }

  console.log("🟡 Connecting to MongoDB:", redact(uri));
  const opts = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    retryWrites: true,
  };

  let attempts = 0;
  while (true) {
    try {
      await mongoose.connect(uri, opts);
      console.log("✅ MongoDB connected");
      break;
    } catch (err) {
      attempts++;
      console.error(`❌ MongoDB connection failed (attempt ${attempts})`);
      console.error("   name:", err?.name);
      console.error("   code:", err?.code);
      console.error("   reason:", err?.reason?.message || err?.message);
      console.error("   HINTS: check Atlas IP allowlist, username/password, and DB access for the user.");
      if (attempts >= 5) throw err;
      await new Promise(r => setTimeout(r, Math.min(3000 * attempts, 15000)));
    }
  }
};
