import User from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_env_secret";


export async function register(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Missing fields" });

    if (await User.findOne({ username }))
      return res.status(409).json({ message: "Username taken" });

    const user = await new User({ username, password }).save();
    
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      username: user.username,
      token,
      isAdmin: user.isAdmin,  
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      username: user.username,
      token,
      isAdmin: user.isAdmin,  // ← INCLUDE
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
