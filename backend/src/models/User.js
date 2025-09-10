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
  // NEW: track one-time milestone awards per skill
  milestones: {
    type: Map,
    of: Boolean,
    default: {},   // keys: "25","50","75","100"
  },
  startedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const coinTxnSchema = new mongoose.Schema({
  type: { type: String, enum: ["earn","spend"], default: "earn" },
  amount: { type: Number, required: true },  // positive values
  reason: { type: String, required: true },  // e.g., "task_complete", "milestone_25", "streak_bonus"
  skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", default: null },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    username:       { type: String, required: true, unique: true },
    password:       { type: String, required: true },
    isAdmin:        { type: Boolean, default: false },

    learningSkills: [learningSkillSchema],

    // XP already exists
    xp:             { type: Number, default: 0 },

    // NEW: coin economy (earn-only for now)
    coins:          { type: Number, default: 0 },
    coinTransactions: { type: [coinTxnSchema], default: [] },

    // NEW: streak & reflections (earn-only helpers)
    streakCount:     { type: Number, default: 0 },
    lastStreakDate:  { type: Date, default: null },
    reflectionWeeks: { type: [String], default: [] }, // ISO week keys like "2025-W37"
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
