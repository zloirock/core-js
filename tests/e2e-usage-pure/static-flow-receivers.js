import { withWindowPresence } from './unbacked-window-host.cjs';

QUnit.test('nested static extraction keeps the method and the nullable source', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    function length() {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed source must throw
      const { of: { length: arity } } = (globalThis.window?.self).Array;
      return arity;
    }
    function name() {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the pattern must reject an absent receiver
      const { allSettled: { name: method } } = globalThis.window?.Promise;
      return method;
    }
    function fallback() {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the seal throws before fallback selection
      const { resolve } = (globalThis.window?.self).Promise ?? {};
      return typeof resolve;
    }
    if (live) {
      assert.same(length(), 0);
      assert.same(name(), 'allSettled');
      assert.same(fallback(), 'function');
    } else {
      assert.throws(length, TypeError);
      assert.throws(name, TypeError);
      assert.throws(fallback, TypeError);
    }
  });
});

QUnit.test('rewritten assignments preserve both receiver families at a branch join', assert => {
  function stringArm(flag) {
    // eslint-disable-next-line no-useless-assignment -- the complete join must discard this receiver family
    let value = [1];
    if (flag) value = 'ab'.padStart(3);
    else value = [2];
    return value.at(-1);
  }
  function arrayArm(flag) {
    // eslint-disable-next-line no-useless-assignment -- the complete join must discard this receiver family
    let value = '';
    if (flag) value = [1, [7]].flat();
    else value = 'str';
    return value.at(-1);
  }
  function nestedArm(flag, other) {
    let value;
    if (flag) value = other ? [1, [7]].flat() : 'ab'.padStart(3);
    else value = 'str';
    return value.at(-1);
  }
  assert.deepEqual([stringArm(true), stringArm(false)], ['b', 2]);
  assert.deepEqual([arrayArm(true), arrayArm(false)], [7, 'r']);
  assert.deepEqual([nestedArm(true, true), nestedArm(true, false), nestedArm(false, false)], [7, 'b', 'r']);
});

QUnit.test('nested static mirrors keep source effects before keys and bindings', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const effects = [];
    let result;
    try {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the seal must reject before the key
      const { [(effects.push('key'), 'groupBy')]: { length } } = (effects.push('source'), (globalThis.window?.self).Map);
      result = length;
    } catch (error) {
      result = error.name;
    }
    assert.same(result, live ? 2 : 'TypeError');
    assert.deepEqual(effects, live ? ['source', 'key'] : ['source']);
  });
});
