import User from "../models/User.js";
import { XP_PER_TASK } from "../config/xp.js";
import { COINS_PER_TASK, MILESTONE_BONUSES } from "../config/coins.js";
import { getRankForXp } from "../config/ranks.js";

/** ---------- Helpers to reconcile XP & Coins from learning state ---------- */
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

/** ---------- GET /api/users/me ---------- */
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const computedXp = computeXpFromLearning(user);
    if (user.xp !== computedXp) user.xp = computedXp;

    const { totalCoins: baseline } = computeCoinsFromLearning(user);
    if (user.coins < baseline) user.coins = baseline;

    await user.save();

    const rank = getRankForXp(user.xp || 0);

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      xp: user.xp,
      coins: user.coins,
      createdAt: user.createdAt,
      xpPerTask: XP_PER_TASK,
      rank,
      // NEW
      inventory: user.inventory ?? [],
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

/** ---------- GET /api/users/leaderboard ---------- */
export async function getLeaderboard(req, res) {
  try {
    const limit  = Math.min(parseInt(req.query.limit ?? "50", 10), 200);
    const offset = Math.max(parseInt(req.query.offset ?? "0", 10), 0);

    const users = await User.find({}, "username xp createdAt")
      .sort({ xp: -1, createdAt: 1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const decorated = users.map((u, i) => ({
      username: u.username,
      xp: u.xp ?? 0,
      rank: getRankForXp(u.xp ?? 0),
      position: offset + i + 1,
    }));

    const me = await User.findById(req.user.id, "xp").lean();
    let myPosition = null;
    if (me) {
      const ahead = await User.countDocuments({ xp: { $gt: me.xp ?? 0 } });
      myPosition = ahead + 1;
    }

    res.json({
      items: decorated,
      limit,
      offset,
      me: myPosition != null ? { position: myPosition, xp: me?.xp ?? 0, rank: getRankForXp(me?.xp ?? 0) } : null,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
