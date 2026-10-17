import test from 'node:test';
import assert from 'node:assert/strict';
import { nextScores } from '../src/assessment.js';

test('simulated scores remain 5 to 9 and a final report equalizes every cumulative average', () => {
  for (const length of [1, 2, 3, 6, 17, 50]) {
    const totals = [0, 0, 0, 0, 0, 0];
    for (let report = 0; report < length; report++) {
      const scores = nextScores(totals, report, report === length - 1);
      assert.equal(scores.reduce((a, b) => a + b, 0), 42);
      scores.forEach((score, i) => { assert.ok(score >= 5 && score <= 9); totals[i] += score; });
    }
    assert.deepEqual(totals, Array(6).fill(7 * length));
  }
  assert.throws(() => nextScores([0, 0], 0));
});
