// Single source of truth for COINS values
export const COINS_PER_TASK = 2;                 // base reward per completed task
export const COINS_DAILY_CAP = 30;               // max coins per (server) day from earns
export const MILESTONE_BONUSES = {               // one-time per skill
  25: 3,
  50: 5,
  75: 7,
  100: 10,
};
export const STREAK_MAX_DAILY_BONUS = 5;         // min(streakCount, 5)
export const WEEKLY_REFLECTION_BONUS = 3;        // (endpoint provided; call when you add UI)
