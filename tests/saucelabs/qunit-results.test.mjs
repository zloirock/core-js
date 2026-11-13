import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../unit-browser/qunit-results.js', import.meta.url), 'utf8');

test('publishes the active QUnit test until it completes', () => {
  const callbacks = {};
  const QUnit = {
    log: listener => { callbacks.log = listener; },
    testStart: listener => { callbacks.testStart = listener; },
    testDone: listener => { callbacks.testDone = listener; },
    done: listener => { callbacks.done = listener; },
  };
  const window = { QUnit };
  runInNewContext(source, { window });
  const { qunitResults: results } = window;
  callbacks.testStart({ module: 'Promises', name: 'pending callback' });
  assert.deepEqual({ ...results.currentTest }, { module: 'Promises', test: 'pending callback' });
  callbacks.testDone();
  assert.equal(results.currentTest, null);
  callbacks.done({ failed: 0, total: 1 });
  assert.equal(results.done, true);
});
