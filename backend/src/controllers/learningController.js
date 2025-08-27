import User from "../models/User.js";
import Skill from "../models/Skill.js";

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
    const user = await User.findById(req.user.id).populate(
      "learningSkills.skill"
    );

    // Clean up any entries whose Skill doc was deleted (orphaned refs)
    const before = user.learningSkills.length;
    user.learningSkills = user.learningSkills.filter((e) => !!e.skill);
    if (user.learningSkills.length !== before) {
      await user.save();
    }

    const payload = user.learningSkills.map((e) => ({
      _id: e.skill._id,
      name: e.skill.name,
      category: e.skill.category,
      tasks: e.skill.tasks,
      completedTasks: e.completedTasks,
    }));

    res.json(payload);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getLearningSkill(req, res) {
  try {
    const user = await User.findById(req.user.id).populate(
      "learningSkills.skill"
    );

    // Ensure the populated skill exists and matches the requested id
    const entry = user.learningSkills.find(
      (e) => e.skill && e.skill._id.equals(req.params.skillId)
    );
    if (!entry)
      return res.status(404).json({ message: "Not learning this skill" });

    res.json({
      _id: entry.skill._id,
      name: entry.skill.name,
      category: entry.skill.category,
      tasks: entry.skill.tasks,
      completedTasks: entry.completedTasks,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

export async function toggleTask(req, res) {
  try {
    const idx = parseInt(req.params.taskIndex, 10);
    const user = await User.findById(req.user.id);

    // Find learning entry by skill id (may exist even if the Skill doc was deleted)
    const entry = user.learningSkills.find((e) =>
      e.skill.equals(req.params.skillId)
    );
    if (!entry)
      return res.status(404).json({ message: "Not learning this skill" });

    // If the Skill doc still exists, optionally realign completedTasks length
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

    entry.completedTasks[idx] = !entry.completedTasks[idx];
    entry.lastUpdated = new Date();
    await user.save();

    res.json({ completedTasks: entry.completedTasks });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
