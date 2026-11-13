import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../unit-browser/qunit-results.js', import.meta.url), 'utf8');

test('serializes Symbol and BigInt failure values as text', () => {
  const callbacks = {};
  const QUnit = {
    dump: { parse: value => typeof value === 'symbol' || typeof value === 'bigint' ? () => String(value) : String(value) },
    log: listener => { callbacks.log = listener; },
    testStart: listener => { callbacks.testStart = listener; },
    testDone: listener => { callbacks.testDone = listener; },
    done: listener => { callbacks.done = listener; },
  };
  const window = { QUnit };
  runInNewContext(source, { window });
  callbacks.log({ result: false, module: 'values', name: 'compare', expected: Symbol('expected'), actual: 1n });
  assert.equal(window.qunitResults.failures[0].expected, 'Symbol(expected)');
  assert.equal(window.qunitResults.failures[0].actual, '1');
});

test('publishes the active QUnit test until it completes', () => {
  const callbacks = {};
  const QUnit = {
    log: listener => { callbacks.log = listener; },
    testStart: listener => { callbacks.testStart = listener; },
    testDone: listener => { callbacks.testDone = listener; },
    done: listener => { callbacks.done = listener; },
  };
  const window = { QUnit };
  const timers = new Set();
  runInNewContext(source, { window, setTimeout: handler => timers.add(handler) && handler, clearTimeout: handler => timers.delete(handler) });
  const { qunitResults: results } = window;
  callbacks.testStart({ module: 'Promises', name: 'pending callback' });
  assert.deepEqual({ ...results.currentTest }, { module: 'Promises', test: 'pending callback' });
  callbacks.testDone();
  assert.equal(results.currentTest, null);
  callbacks.done({ failed: 0, total: 1 });
  assert.equal(results.done, false);
  callbacks.done({ failed: 1, total: 2 });
  assert.equal(timers.size, 1);
  for (const handler of timers) handler();
  assert.equal(results.done, true);
  assert.equal(results.failed, 1);
  assert.equal(results.total, 2);
});
