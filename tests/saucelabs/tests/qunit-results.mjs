import { deepEqual, equal } from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { runInNewContext } from 'node:vm';

const dumpSource = await readFile(new URL('../../unit-browser/qunit-dump.js', import.meta.url), 'utf8');
const source = await readFile(new URL('../../unit-browser/qunit-results.js', import.meta.url), 'utf8');
const callbacks = {};
const QUnit = {
  dump: {
    depth: 1,
    parse(value) {
      if (typeof value === 'symbol' || typeof value === 'bigint') return String;
      this.depth++;
      const text = String(value);
      this.depth--;
      return text;
    },
  },
};
for (const event of ['log', 'testStart', 'testDone', 'done']) {
  QUnit[event] = listener => { callbacks[event] = listener; };
}
const window = { QUnit };
const context = { window, setTimeout: setImmediate, clearTimeout: clearImmediate };
runInNewContext(dumpSource, context);
runInNewContext(source, context);
const { qunitResults: results } = window;

const test = { module: 'values', name: 'compare' };
callbacks.testStart(test);
deepEqual({ ...results.currentTest }, { module: 'values', test: 'compare' });
callbacks.log({ ...test, result: false, expected: Symbol('expected'), actual: 1n });
const unreadable = { get toString() { throw new Error('getter failed'); } };
equal(QUnit.dump.parse(unreadable), '[unprintable]', 'the HTML reporter can print the failed assertion');
callbacks.log({ ...test, result: false, message: 'mismatch', actual: unreadable, expected: 42 });
deepEqual(structuredClone(results.failures), [
  { module: 'values', test: 'compare', message: '', actual: '1', expected: 'Symbol(expected)' },
  { module: 'values', test: 'compare', message: 'mismatch', actual: '[unprintable]', expected: '42' },
]);
equal(QUnit.dump.depth, 1);
callbacks.testDone();
equal(results.currentTest, null);
callbacks.done({ failed: 2, total: 2 });

callbacks.testStart(test);
await nextTurn();
equal(results.done, false, 'the previous timer cannot finish a running test');
callbacks.testDone();
callbacks.done({ failed: 2, total: 3 });
await nextTurn();
equal(results.done, true);

callbacks.done({ failed: 3, total: 4 });
equal(results.done, false, 'a late done withdraws a published result');
const between = nextTurn().then(() => results.done);
callbacks.done({ failed: 4, total: 5 });
equal(await between, false, 'a repeated done restarts the delay');
await nextTurn();
deepEqual([results.done, results.failed, results.total], [true, 4, 5]);
callbacks.testStart(test);
equal(results.done, false, 'starting a test withdraws a published result');

echo(chalk.green('Sauce Labs page reporter tested'));
