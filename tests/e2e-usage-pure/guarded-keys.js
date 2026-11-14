/* eslint-disable no-sequences, @stylistic/no-extra-parens -- Nested source prefixes are the subject. */
import { withWindowPresence } from './unbacked-window-host.cjs';

QUnit.test('guarded symbol key keeps its nullable value', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const list = { undefined: 23, [Symbol.iterator]() { return 31; } };
    const direct = list[globalThis.window?.Symbol.iterator];
    const { [globalThis.window?.Symbol.iterator]: extracted } = list;

    let assigned;
    // eslint-disable-next-line prefer-const -- Keep the assignment-pattern twin.
    ({ [globalThis.window?.Symbol.iterator]: assigned } = list);
    assert.strictEqual(typeof direct, present ? 'function' : 'number');
    assert.strictEqual(extracted, direct);
    assert.strictEqual(assigned, direct);
    assert.strictEqual(present ? direct() : direct, present ? 31 : 23);
  });
});

QUnit.test('nested symbol receiver effects retain source order', assert => {
  const effects = [];
  const list = [7];
  const it = list[(effects.push(1), (effects.push(2), globalThis[(effects.push(3), 'Symbol')])).iterator];
  assert.strictEqual(it.call(list).next().value, 7);
  assert.deepEqual(effects, [1, 2, 3]);
  // eslint-disable-next-line unicorn/consistent-function-style -- The expression-bodied return is the subject.
  const get = () => (effects.push(6), globalThis);
  const called = list[(effects.push(4), (effects.push(5), get()))[(effects.push(7), 'Symbol')].iterator];
  assert.strictEqual(called.call(list).next().value, 7);
  assert.deepEqual(effects, [1, 2, 3, 4, 5, 6, 7]);
});

QUnit.test('guarded statics keep nested prefixes and missing reads', assert => {
  function read(choice) {
    const effects = [];
    let C = Map;
    if (choice) C = Set;
    const result = typeof (effects.push(1), (effects.push(2), C)).groupBy;
    return [result, effects];
  }
  assert.deepEqual(read(false), ['function', [1, 2]]);
  assert.deepEqual(read(true), ['undefined', [1, 2]]);
  function throwing(choice) {
    let C = Map;
    if (choice) C = Set;
    // eslint-disable-next-line no-undef, sonarjs/no-reference-error -- An unresolved read must precede the identity test.
    return (0, (missingGuardedPrefix, C)).groupBy;
  }
  assert.throws(() => throwing(false), ReferenceError);
  assert.throws(() => throwing(true), ReferenceError);
});

QUnit.test('delete owns the live guarded continuation', assert => {
  for (const choice of [false, true]) {
    const effects = [];
    const obj = { k: 1 };
    const result = delete (choice ? Object : null)?.fromEntries((effects.push('args'), [['k', obj]])).k[(effects.push('key'), 'k')];
    assert.true(result);
    assert.strictEqual('k' in obj, !choice);
    assert.deepEqual(effects, choice ? ['args', 'key'] : []);
  }
});

QUnit.test('delete retains optional calls and claimed keys', assert => {
  function optional(choice) {
    return delete (choice ? Object : null).fromEntries?.([]);
  }
  assert.true(optional(true));
  assert.throws(() => optional(false), TypeError);
  for (const choice of [false, true]) {
    const effects = [];
    const obj = { k: 1 };
    const result = delete (choice ? Object : null)?.fromEntries([['k', obj]]).k[(effects.push([7].at(-1)), 'k')];
    assert.true(result);
    assert.strictEqual('k' in obj, !choice);
    assert.deepEqual(effects, choice ? [7] : []);
  }
});
