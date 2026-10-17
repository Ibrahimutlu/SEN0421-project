import { randomInt } from 'node:crypto';

export function nextScores(previousTotals: number[], reportCount: number, final = false): number[] {
  if (previousTotals.length !== 6 || previousTotals.some(total => !Number.isInteger(total) || Math.abs(total - 7 * reportCount) > 2)) {
    throw new Error('The ledger cannot be balanced without reviewing its previous entries.');
  }
  const previous = previousTotals.map(total => total - 7 * reportCount);
  if (final) return previous.map(deviation => 7 - deviation);
  for (let attempt = 0; attempt < 1000; attempt++) {
    const desired = [-2, -1, 0, 0, 1, 2];
    for (let i = desired.length - 1; i > 0; i--) {
      const j = randomInt(i + 1); [desired[i], desired[j]] = [desired[j], desired[i]];
    }
    const scores = desired.map((deviation, i) => 7 + deviation - previous[i]);
    if (scores.every(score => score >= 5 && score <= 9)) return scores;
  }
  return previous.map(deviation => 7 - deviation);
}
