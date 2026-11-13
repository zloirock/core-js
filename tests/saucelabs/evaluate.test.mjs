import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluate } from './evaluate.mjs';

test('reports an assertion logged after QUnit has finished as a failure', () => {
  const result = evaluate({
    done: true, failed: 0, total: 2,
    failures: [{ test: 'leaky', message: 'late failure of leaky' }],
  });
  assert.equal(result.passed, false);
  assert.equal(result.summary, '1 of 2 assertions failed');
  assert.deepEqual(result.details, ['    leaky: late failure of leaky']);
});

test('reports regular failures and rejects a page that ran no assertions', () => {
  assert.equal(evaluate({ done: true, failed: 2, total: 10, failures: [] }).passed, false);
  assert.deepEqual(evaluate({ done: true, failed: 0, total: 0, failures: [] }), {
    passed: false, summary: 'no assertions ran', details: [],
  });
  assert.equal(evaluate({ done: true, failed: 0, total: 10, failures: [] }).passed, true);
});
