import User from "../models/User.js";
import Skill from "../models/Skill.js";

// Start learning: initialize completedTasks to all false
export async function startLearning(req, res) {
  try {
    const user = await User.findById(req.user.id);
    const skill = await Skill.findById(req.params.skillId);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    const exists = user.learningSkills.some(e =>
      e.skill.equals(skill._id)
    );
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

// List all your learning entries
export async function getLearningSkills(req, res) {
  try {
    const user = await User.findById(req.user.id).populate("learningSkills.skill");
    const payload = user.learningSkills.map(e => ({
      _id:            e.skill._id,
      name:           e.skill.name,
      category:       e.skill.category,
      tasks:          e.skill.tasks,
      completedTasks: e.completedTasks,
    }));
    res.json(payload);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

// Get one skill + your progress
export async function getLearningSkill(req, res) {
  try {
    const user = await User.findById(req.user.id).populate("learningSkills.skill");
    const entry = user.learningSkills.find(e =>
      e.skill._id.equals(req.params.skillId)
    );
    if (!entry) return res.status(404).json({ message: "Not learning this skill" });

    res.json({
      _id:            entry.skill._id,
      name:           entry.skill.name,
      category:       entry.skill.category,
      tasks:          entry.skill.tasks,
      completedTasks: entry.completedTasks,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

// Toggle one task’s completion
export async function toggleTask(req, res) {
  try {
    const idx = parseInt(req.params.taskIndex, 10);
    const user = await User.findById(req.user.id);
    const entry = user.learningSkills.find(e =>
      e.skill.equals(req.params.skillId)
    );
    if (!entry) return res.status(404).json({ message: "Not learning this skill" });
    if (isNaN(idx) || idx < 0 || idx >= entry.completedTasks.length) {
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
