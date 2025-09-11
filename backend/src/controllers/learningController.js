import User from "../models/User.js";
import Skill from "../models/Skill.js";
import { XP_PER_TASK } from "../config/xp.js";
import { COINS_PER_TASK, MILESTONE_BONUSES } from "../config/coins.js";
import crypto from "crypto";

/* ----------------- Helpers ----------------- */
function isSkillCompleted(entry, skillDoc) {
  const total = skillDoc?.tasks?.length ?? entry.completedTasks.length;
  if (!total) return false;
  if (!entry.completedTasks || entry.completedTasks.length !== total) return false;
  return entry.completedTasks.every(Boolean);
}
function countByItem(list = []) {
  const m = new Map();
  for (const d of list) m.set(d.itemId, (m.get(d.itemId) || 0) + 1);
  return m;
}

/* ----------------- Start / Read ----------------- */
export async function startLearning(req, res) {
  try {
    const user = await User.findById(req.user.id);
    const skill = await Skill.findById(req.params.skillId);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    const exists = user.learningSkills.some((e) => e.skill.equals(skill._id));
    if (!exists) {
      user.learningSkills.push({
        skill: skill._id,
        completedTasks: Array(skill.tasks.length).fill(false),
        milestones: {},
        decorations: [],
      });
      await user.save();
    }
    res.json({ message: "Skill added" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getLearningSkills(req, res) {
  try {
    const user = await User.findById(req.user.id).populate("learningSkills.skill");

    const before = user.learningSkills.length;
    user.learningSkills = user.learningSkills.filter((e) => !!e.skill);
    if (user.learningSkills.length !== before) await user.save();

    const payload = user.learningSkills.map((e) => ({
      _id: e.skill._id,
      name: e.skill.name,
      category: e.skill.category,
      tasks: e.skill.tasks,
      completedTasks: e.completedTasks,
      xpPerTask: XP_PER_TASK,
    }));
    res.json(payload);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getLearningSkill(req, res) {
  try {
    const user = await User.findById(req.user.id).populate("learningSkills.skill");
    const entry = user.learningSkills.find(
      (e) => e.skill && e.skill._id.equals(req.params.skillId)
    );
    if (!entry) return res.status(404).json({ message: "Not learning this skill" });

    res.json({
      _id: entry.skill._id,
      name: entry.skill.name,
      category: entry.skill.category,
      tasks: entry.skill.tasks,
      completedTasks: entry.completedTasks,
      xpPerTask: XP_PER_TASK,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

/* ----------------- Toggle task (existing) ----------------- */
export async function toggleTask(req, res) {
  try {
    const idx = parseInt(req.params.taskIndex, 10);
    const user = await User.findById(req.user.id);
    const entry = user.learningSkills.find((e) => e.skill.equals(req.params.skillId));
    if (!entry) return res.status(404).json({ message: "Not learning this skill" });

    const skillDoc = await Skill.findById(req.params.skillId);
    if (skillDoc) {
      const needed = skillDoc.tasks.length;
      if (entry.completedTasks.length !== needed) {
        entry.completedTasks = Array(needed)
          .fill(false)
          .map((_, i) => entry.completedTasks[i] || false);
      }
    }
    if (Number.isNaN(idx) || idx < 0 || idx >= entry.completedTasks.length) {
      return res.status(400).json({ message: "Invalid task index" });
    }

    const wasCompleted = !!entry.completedTasks[idx];
    entry.completedTasks[idx] = !wasCompleted;
    entry.lastUpdated = new Date();

    let deltaXp = 0;
    if (!wasCompleted) {
      deltaXp = XP_PER_TASK;
      user.xp += XP_PER_TASK;
    } else {
      deltaXp = -XP_PER_TASK;
      user.xp = Math.max(0, user.xp - XP_PER_TASK);
    }

    let deltaCoins = 0;
    let awardedMilestones = [];

    if (!wasCompleted) {
      user.coins += COINS_PER_TASK;
      deltaCoins += COINS_PER_TASK;
      user.coinTransactions.push({
        type: "earn",
        amount: COINS_PER_TASK,
        reason: "task_complete",
        skill: entry.skill,
        meta: { taskIndex: idx },
        createdAt: new Date(),
      });
    } else {
      const sub = COINS_PER_TASK;
      user.coins = Math.max(0, user.coins - sub);
      deltaCoins -= sub;
      user.coinTransactions.push({
        type: "earn",
        amount: 0,
        reason: "unmark_task",
        skill: entry.skill,
        meta: { taskIndex: idx, reversed: COINS_PER_TASK },
        createdAt: new Date(),
      });
    }

    const total = entry.completedTasks.length || (skillDoc ? skillDoc.tasks.length : 0);
    const done = entry.completedTasks.filter(Boolean).length;
    const pct  = total ? Math.round((done / total) * 100) : 0;

    if (!wasCompleted && total > 0) {
      for (const t of [25, 50, 75, 100]) {
        const already = entry.milestones?.get(String(t)) || false;
        if (pct >= t && !already) {
          const bonus = MILESTONE_BONUSES[t] || 0;
          if (bonus > 0) {
            user.coins += bonus;
            deltaCoins += bonus;
            awardedMilestones.push(t);
            user.coinTransactions.push({
              type: "earn",
              amount: bonus,
              reason: `milestone_${t}`,
              skill: entry.skill,
              meta: { percent: t },
              createdAt: new Date(),
            });
          }
          entry.milestones.set(String(t), true);
        }
      }
    }

    await user.save();

    res.json({
      completedTasks: entry.completedTasks,
      xp: user.xp,
      deltaXp,
      coins: user.coins,
      deltaCoins,
      awardedMilestones,
      coinsPerTask: COINS_PER_TASK,
      milestoneBonuses: MILESTONE_BONUSES,
      xpPerTask: XP_PER_TASK,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

/* ----------------- Decorations (NEW) ----------------- */
// GET /api/learning/:skillId/decorations
export async function getDecorations(req, res) {
  try {
    const user = await User.findById(req.user.id).populate("learningSkills.skill");
    const entry = user.learningSkills.find(e => e.skill && e.skill._id.equals(req.params.skillId));
    if (!entry) return res.status(404).json({ message: "Not learning this skill" });
    res.json({ decorations: entry.decorations || [] });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/learning/:skillId/decorations { decorations: [{id,itemId,xPct,yPct}] }
export async function saveDecorations(req, res) {
  try {
    const user = await User.findById(req.user.id).populate("learningSkills.skill");
    const entry = user.learningSkills.find(e => e.skill && e.skill._id.equals(req.params.skillId));
    if (!entry) return res.status(404).json({ message: "Not learning this skill" });

    const skillDoc = entry.skill;
    if (!isSkillCompleted(entry, skillDoc)) {
      return res.status(403).json({ message: "Decorations allowed only when the tree is 100% complete" });
    }

    const incoming = Array.isArray(req.body?.decorations) ? req.body.decorations : [];
    for (const d of incoming) {
      d.id    = String(d.id || crypto.randomUUID());
      d.itemId= String(d.itemId);
      d.xPct  = Math.max(0, Math.min(100, Number(d.xPct)));
      d.yPct  = Math.max(0, Math.min(100, Number(d.yPct)));
    }

    const prev = entry.decorations || [];
    const prevCounts = countByItem(prev);
    const nextCounts = countByItem(incoming);

    // Validate: need enough inventory for net-new placements
    for (const [itemId, nextCount] of nextCounts.entries()) {
      const old = prevCounts.get(itemId) || 0;
      const delta = nextCount - old; // >0 means take from inventory
      if (delta > 0) {
        const inv = user.inventory.find(i => i.itemId === itemId);
        if ((inv?.qty ?? 0) < delta) {
          return res.status(400).json({ message: `Not enough "${itemId}" in inventory (${delta} more needed)` });
        }
      }
    }

    // Return removed items
    for (const [itemId, oldCount] of prevCounts.entries()) {
      const nextCount = nextCounts.get(itemId) || 0;
      const delta = nextCount - oldCount; // negative => return
      if (delta < 0) {
        const inv = user.inventory.find(i => i.itemId === itemId);
        if (inv) inv.qty += Math.abs(delta); else user.inventory.push({ itemId, qty: Math.abs(delta) });
      }
    }
    // Consume new items
    for (const [itemId, nextCount] of nextCounts.entries()) {
      const oldCount = prevCounts.get(itemId) || 0;
      const delta = nextCount - oldCount; // positive => spend
      if (delta > 0) {
        const inv = user.inventory.find(i => i.itemId === itemId);
        if (inv) { inv.qty -= delta; if (inv.qty < 0) inv.qty = 0; }
      }
    }

    entry.decorations = incoming;
    entry.lastUpdated = new Date();
    await user.save();

    res.json({ decorations: entry.decorations, inventory: user.inventory });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
