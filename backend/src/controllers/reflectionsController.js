import User from "../models/User.js";
import { WEEKLY_REFLECTION_BONUS, COINS_DAILY_CAP } from "../config/coins.js";

// helpers
function coinsEarnedToday(user) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return user.coinTransactions
    .filter(tx => tx.type === "earn" && tx.createdAt >= start)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

function isoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Thursday in current week decides the year
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  // First day of year
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  // Calculate week number
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export async function submitReflection(req, res) {
  try {
    const user = await User.findById(req.user.id);
    const wk = isoWeekKey(new Date());

    if (user.reflectionWeeks.includes(wk)) {
      return res.json({ coins: user.coins, deltaCoins: 0, week: wk, alreadySubmitted: true });
    }

    const todayEarned = coinsEarnedToday(user);
    const room = Math.max(0, COINS_DAILY_CAP - todayEarned);
    const add = Math.min(WEEKLY_REFLECTION_BONUS, room);

    let deltaCoins = 0;
    if (add > 0) {
      user.coins += add;
      deltaCoins = add;
      user.coinTransactions.push({
        type: "earn",
        amount: add,
        reason: "weekly_reflection",
        skill: null,
        meta: { week: wk },
        createdAt: new Date(),
      });
    }

    user.reflectionWeeks.push(wk);
    await user.save();

    res.json({ coins: user.coins, deltaCoins, week: wk });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
