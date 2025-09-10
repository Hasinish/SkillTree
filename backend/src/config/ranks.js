// backend/src/config/ranks.js

// Ordered lowest -> highest
export const RANKS = [
  { key: "unranked", name: "Unranked", minXp: 0 },
  { key: "bronze",   name: "Bronze",   minXp: 100 },
  { key: "silver",   name: "Silver",   minXp: 200 },
  { key: "gold",     name: "Gold",     minXp: 500 },
  { key: "diamond",  name: "Diamond",  minXp: 750 },
  { key: "mythic",   name: "Mythic",   minXp: 1000 },
];

export function getRankForXp(xp = 0) {
  let current = RANKS[0];
  let next = null;

  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      current = RANKS[i];
      next = RANKS[i + 1] || null;
    }
  }

  const floor = current.minXp;
  const ceil  = next ? next.minXp : Math.max(floor + 1, xp); // avoid zero range
  const range = Math.max(1, ceil - floor);
  const raw   = ((xp - floor) / range) * 100;
  const progressToNext = Math.max(0, Math.min(100, Math.round(raw)));
  const toNext = next ? Math.max(0, next.minXp - xp) : 0;

  return { current, next, progressToNext, toNext };
}
