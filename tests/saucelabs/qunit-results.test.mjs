import { deepEqual, equal } from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../unit-browser/qunit-results.js', import.meta.url), 'utf8');

{
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
  equal(window.qunitResults.failures[0].expected, 'Symbol(expected)', 'serializes Symbol and BigInt failure values as text #1');
  equal(window.qunitResults.failures[0].actual, '1', 'serializes Symbol and BigInt failure values as text #2');
}

{
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
  deepEqual({ ...results.currentTest }, { module: 'Promises', test: 'pending callback' }, 'publishes the active QUnit test until it completes #1');
  callbacks.testDone();
  equal(results.currentTest, null, 'publishes the active QUnit test until it completes #2');
  callbacks.done({ failed: 0, total: 1 });
  equal(results.done, false, 'publishes the active QUnit test until it completes #3');
  callbacks.done({ failed: 1, total: 2 });
  equal(timers.size, 1, 'publishes the active QUnit test until it completes #4');
  for (const handler of timers) handler();
  equal(results.done, true, 'publishes the active QUnit test until it completes #5');
  equal(results.failed, 1, 'publishes the active QUnit test until it completes #6');
  equal(results.total, 2, 'publishes the active QUnit test until it completes #7');
}
