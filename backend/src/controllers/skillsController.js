import Skill from "../models/Skill.js";


export async function getAllSkills(req, res) {
  try {
    const skills = await Skill.find().sort({ createdAt: -1 });
    res.json(skills);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function getSkillById(req, res) {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json(skill);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function createSkill(req, res) {
  try {
    const { name, category, tasks } = req.body;
    const created = await new Skill({ name, category, tasks }).save();
    res.status(201).json(created);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function updateSkill(req, res) {
  try {
    const { name, category, tasks } = req.body;
    const updated = await Skill.findByIdAndUpdate(
      req.params.id,
      { name, category, tasks },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Skill not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}


export async function deleteSkill(req, res) {
  try {
    const deleted = await Skill.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Skill not found" });
    res.json({ message: "Skill deleted" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}
