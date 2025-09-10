import User from "../models/User.js";
import { STREAK_MAX_DAILY_BONUS } from "../config/coins.js";
import { COINS_DAILY_CAP } from "../config/coins.js";

// helper
function coinsEarnedToday(user) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return user.coinTransactions
    .filter(tx => tx.type === "earn" && tx.createdAt >= start)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export async function tickStreak(req, res) {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date();
    const last = user.lastStreakDate ? new Date(user.lastStreakDate) : null;

    const isSameDay =
      last &&
      last.getFullYear() === today.getFullYear() &&
      last.getMonth() === today.getMonth() &&
      last.getDate() === today.getDate();

    if (isSameDay) {
      // already counted today; return current values without double-award
      return res.json({ streakCount: user.streakCount, coins: user.coins, deltaCoins: 0 });
    }

    // compute day diff
    let nextCount = 1;
    if (last) {
      const diffDays = Math.floor((today - new Date(last.getFullYear(), last.getMonth(), last.getDate())) / 86400000);
      nextCount = diffDays === 1 ? user.streakCount + 1 : 1;
    }

    // award coins with daily cap
    const todayEarned = coinsEarnedToday(user);
    let room = Math.max(0, COINS_DAILY_CAP - todayEarned);

    const bonus = Math.min(nextCount, STREAK_MAX_DAILY_BONUS);
    const add = Math.min(bonus, room);

    let deltaCoins = 0;
    if (add > 0) {
      user.coins += add;
      deltaCoins += add;
      user.coinTransactions.push({
        type: "earn",
        amount: add,
        reason: "streak_bonus",
        skill: null,
        meta: { streakCount: nextCount },
        createdAt: new Date(),
      });
    }

    user.streakCount = nextCount;
    user.lastStreakDate = today;

    await user.save();

    res.json({ streakCount: user.streakCount, coins: user.coins, deltaCoins });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
