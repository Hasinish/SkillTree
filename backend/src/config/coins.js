// Single source of truth for COINS values (simple mode, no caps)
export const COINS_PER_TASK = 2; // base reward per completed task

// One-time per skill when crossing these completion % thresholds.
export const MILESTONE_BONUSES = {
  25: 3,
  50: 5,
  75: 7,
  100: 10,
};

// NOTE: No daily caps, no streak bonuses, no reflection bonuses.
