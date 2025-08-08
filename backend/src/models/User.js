import mongoose from "mongoose";
import bcrypt from "bcrypt";

const learningSkillSchema = new mongoose.Schema({
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill",
    required: true,
  },
  completedTasks: {
    type: [Boolean],
    default: [],
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    username:       { type: String, required: true, unique: true },
    password:       { type: String, required: true },
    isAdmin:        { type: Boolean, default: false },
    learningSkills: [learningSkillSchema],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
