import User from "../models/User.js";

export async function submitReflection(req, res) {
  try {
    const user = await User.findById(req.user.id);

    // Track week so users can't spam the endpoint, but we award no coins.
    const d = new Date();
    const wk = `${d.getUTCFullYear()}-W${String(
      Math.ceil((((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) -
        Date.UTC(d.getUTCFullYear(), 0, 1)) /
        86400000) +
        1) /
        7)
    ).padStart(2, "0")}`;

    if (!user.reflectionWeeks.includes(wk)) {
      user.reflectionWeeks.push(wk);
      await user.save();
    }

    res.json({ coins: user.coins, deltaCoins: 0, week: wk, reflectionsCoinsDisabled: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
