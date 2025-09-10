import User from "../models/User.js";
import Skill from "../models/Skill.js";
import { XP_PER_TASK } from "../config/xp.js";
import { COINS_PER_TASK, MILESTONE_BONUSES } from "../config/coins.js";

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
        milestones: {}, // initialize
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

    // Clean up orphaned refs
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

export async function toggleTask(req, res) {
  try {
    const idx = parseInt(req.params.taskIndex, 10);
    const user = await User.findById(req.user.id);
    const entry = user.learningSkills.find((e) => e.skill.equals(req.params.skillId));
    if (!entry) return res.status(404).json({ message: "Not learning this skill" });

    // Realign length if tasks array changed
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

    // ===== XP logic =====
    let deltaXp = 0;
    if (!wasCompleted) {
      deltaXp = XP_PER_TASK;
      user.xp += XP_PER_TASK;
    } else {
      deltaXp = -XP_PER_TASK;
      user.xp = Math.max(0, user.xp - XP_PER_TASK);
    }

    // ===== COINS logic (no caps; simple mode) =====
    let deltaCoins = 0;
    let awardedMilestones = [];

    // Base task coins (+2) when marking complete; remove when unmarking.
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
      // unmark: remove base task coins; do not go below 0
      const sub = COINS_PER_TASK;
      user.coins = Math.max(0, user.coins - sub);
      deltaCoins -= sub;
      user.coinTransactions.push({
        type: "earn",
        amount: 0, // keep earns positive; log reversal in meta
        reason: "unmark_task",
        skill: entry.skill,
        meta: { taskIndex: idx, reversed: COINS_PER_TASK },
        createdAt: new Date(),
      });
    }

    // Milestones (one-time awards; do NOT revoke on unmark)
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
          entry.milestones.set(String(t), true); // mark one-time
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
