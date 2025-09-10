import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { XP_PER_TASK } from "../config/xp.js";
import { COINS_PER_TASK, MILESTONE_BONUSES } from "../config/coins.js";
import { getRankForXp } from "../config/ranks.js";

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_env_secret";

function computeXpFromLearning(user) {
  if (!user?.learningSkills?.length) return 0;
  let doneTasks = 0;
  for (const e of user.learningSkills) {
    if (Array.isArray(e.completedTasks)) doneTasks += e.completedTasks.filter(Boolean).length;
  }
  return doneTasks * XP_PER_TASK;
}

function computeCoinsFromLearning(user) {
  let base = 0;
  let milestoneSum = 0;
  for (const e of user.learningSkills) {
    if (!e || !Array.isArray(e.completedTasks)) continue;
    const total = e.completedTasks.length;
    const done  = e.completedTasks.filter(Boolean).length;
    base += done * COINS_PER_TASK;

    const pct = total ? Math.round((done / total) * 100) : 0;
    if (!e.milestones) e.milestones = new Map();
    for (const t of [25,50,75,100]) {
      const k = String(t);
      const already = e.milestones.get(k) || false;
      if (pct >= t && !already) {
        milestoneSum += (MILESTONE_BONUSES[t] || 0);
        e.milestones.set(k, true);
      }
    }
  }
  return { totalCoins: base + milestoneSum };
}

export async function register(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Missing fields" });
    if (await User.findOne({ username })) return res.status(409).json({ message: "Username taken" });

    const user = await new User({ username, password }).save();
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "7d" });
    const rank = getRankForXp(user.xp || 0);

    res.status(201).json({
      username: user.username,
      token,
      isAdmin: user.isAdmin,
      xp: user.xp,
      xpPerTask: XP_PER_TASK,
      coins: user.coins,
      rank,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reconcile XP and baseline coins (no caps)
    const computedXp = computeXpFromLearning(user);
    if (user.xp !== computedXp) user.xp = computedXp;

    const { totalCoins: baseline } = computeCoinsFromLearning(user);
    if (user.coins < baseline) user.coins = baseline;

    await user.save();

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "7d" });
    const rank = getRankForXp(user.xp || 0);

    res.json({
      username: user.username,
      token,
      isAdmin: user.isAdmin,
      xp: user.xp,
      xpPerTask: XP_PER_TASK,
      coins: user.coins,
      rank,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
