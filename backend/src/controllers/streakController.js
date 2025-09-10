import User from "../models/User.js";

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
      return res.json({ streakCount: user.streakCount, coins: user.coins, deltaCoins: 0 });
    }

    // Keep count for fun, but award no coins
    let nextCount = 1;
    if (last) {
      const diffDays = Math.floor(
        (today - new Date(last.getFullYear(), last.getMonth(), last.getDate())) / 86400000
      );
      nextCount = diffDays === 1 ? user.streakCount + 1 : 1;
    }

    user.streakCount = nextCount;
    user.lastStreakDate = today;
    await user.save();

    res.json({ streakCount: user.streakCount, coins: user.coins, deltaCoins: 0 });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
