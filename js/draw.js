import { CAPSULES } from './capsules.js';

// Probabilities in percent; must sum to 100.
export const WEIGHTS = [['common', 45], ['uncommon', 28], ['rare', 18], ['legendary', 9]];

/** Stage 1: weighted rarity tier. */
export function pickRarity(rand = Math.random) {
  let roll = rand() * 100;
  for (const [tier, weight] of WEIGHTS) {
    if (roll < weight) return tier;
    roll -= weight;
  }
  return 'common';
}

/** Stage 2: uniform pick within the tier. Each draw is independent. */
export function pickCapsule(rand = Math.random) {
  const tier = pickRarity(rand);
  const pool = CAPSULES.filter(c => c.rarity === tier);
  return pool[Math.floor(rand() * pool.length)];
}
