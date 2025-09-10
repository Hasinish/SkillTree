import User from "../models/User.js";
import { XP_PER_TASK } from "../config/xp.js";
import {
  COINS_PER_TASK,
  MILESTONE_BONUSES,
} from "../config/coins.js";

// Helper to compute XP from all existing completed tasks
function computeXpFromLearning(user) {
  if (!user?.learningSkills?.length) return 0;
  let doneTasks = 0;
  for (const e of user.learningSkills) {
    if (Array.isArray(e.completedTasks)) {
      doneTasks += e.completedTasks.filter(Boolean).length;
    }
  }
  return doneTasks * XP_PER_TASK;
}

// Helper to compute Coins (base + milestones only; not time-based streak/reflection)
function computeCoinsFromLearning(user) {
  let base = 0;
  let milestoneSum = 0;
  for (const e of user.learningSkills) {
    if (!e || !Array.isArray(e.completedTasks)) continue;
    const total = e.completedTasks.length;
    const done  = e.completedTasks.filter(Boolean).length;
    base += done * COINS_PER_TASK;

    const pct = total ? Math.round((done / total) * 100) : 0;
    // Mark and add one-time milestone bonuses when currently eligible
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

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Reconcile XP
    const computedXp = computeXpFromLearning(user);
    if (user.xp !== computedXp) user.xp = computedXp;

    // Reconcile COINS (base + milestones)
    const { totalCoins } = computeCoinsFromLearning(user);
    if (user.coins !== totalCoins) user.coins = totalCoins;

    await user.save();

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      xp: user.xp,
      coins: user.coins,
      createdAt: user.createdAt,
      xpPerTask: XP_PER_TASK,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
