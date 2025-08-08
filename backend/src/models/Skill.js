import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  content: { type: String, required: true },
});

const skillSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    category: { type: String, required: true },      
    tasks:    { type: [taskSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Skill", skillSchema);
