// backend/src/controllers/shopController.js
import User from "../models/User.js";
import { SHOP_ITEMS } from "../config/shop.js";

export function getItems(req, res) {
  res.json(SHOP_ITEMS);
}

export async function buyItem(req, res) {
  try {
    const { itemId } = req.params;
    const item = SHOP_ITEMS.find((it) => it.id === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.coins < item.price) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    user.coins -= item.price;
    user.coinTransactions.push({
      type: "spend",
      amount: item.price,
      reason: "shop_purchase",
      skill: null,
      meta: { itemId: item.id, itemName: item.name },
      createdAt: new Date(),
    });

    const existing = user.inventory.find((i) => i.itemId === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      user.inventory.push({ itemId: item.id, qty: 1, acquiredAt: new Date() });
    }

    await user.save();
    res.json({
      message: `Purchased ${item.name}`,
      coins: user.coins,
      inventory: user.inventory,
      purchased: { itemId: item.id, name: item.name, price: item.price },
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
