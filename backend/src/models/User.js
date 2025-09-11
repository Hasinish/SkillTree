import mongoose from "mongoose";
import bcrypt from "bcrypt";

const decorationSchema = new mongoose.Schema({
  id:    { type: String, required: true },  // client UUID
  itemId:{ type: String, required: true },  // SHOP_ITEMS.id
  xPct:  { type: Number, required: true },  // 0..100
  yPct:  { type: Number, required: true },  // 0..100
}, { _id: false });

const learningSkillSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
  completedTasks: { type: [Boolean], default: [] },
  milestones: { type: Map, of: Boolean, default: {} }, // "25","50","75","100"
  startedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },

  // NEW: saved layout for this skill’s tree
  decorations: { type: [decorationSchema], default: [] },
});

const coinTxnSchema = new mongoose.Schema({
  type: { type: String, enum: ["earn", "spend"], default: "earn" },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", default: null },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const inventoryItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  qty: { type: Number, default: 1 },
  acquiredAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin:  { type: Boolean, default: false },

    learningSkills: [learningSkillSchema],

    xp:    { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    coinTransactions: { type: [coinTxnSchema], default: [] },

    inventory: { type: [inventoryItemSchema], default: [] },

    streakCount:     { type: Number, default: 0 },
    lastStreakDate:  { type: Date, default: null },
    reflectionWeeks: { type: [String], default: [] },
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
