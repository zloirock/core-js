/* eslint-disable @stylistic/no-extra-parens -- Source boundaries and order are under test. */
import { withWindowPresence } from './unbacked-window-host.cjs';

QUnit.test('iterator extraction consumes the guarded receiver once', assert => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, Symbol.iterator);
  const reads = [];
  function iterate() {
    return { next() { return { done: true }; } };
  }
  Object.defineProperty(globalThis, Symbol.iterator, {
    configurable: true, get() { reads.push('iterator'); return iterate; },
  });
  try {
    for (const requested of [false, true]) withWindowPresence(requested, present => {
      function extract() {
        // eslint-disable-next-line no-unsafe-optional-chaining -- The nullish throw is asserted below.
        const { [Symbol.iterator]: method } = globalThis.window?.self;
        return method;
      }
      function extractName() {
        // eslint-disable-next-line no-unsafe-optional-chaining -- The nullish throw is asserted below.
        const { [Symbol.iterator]: { name } } = globalThis.window?.self;
        return name;
      }
      reads.length = 0;
      if (present) {
        assert.strictEqual(extract(), iterate);
        assert.deepEqual(reads, ['iterator']);
      } else {
        assert.throws(extract, TypeError);
        assert.deepEqual(reads, []);
      }
      reads.length = 0;
      if (present) {
        assert.strictEqual(extractName(), 'iterate');
        assert.deepEqual(reads, ['iterator']);
      } else {
        assert.throws(extractName, TypeError);
        assert.deepEqual(reads, []);
      }
    });
  } finally {
    if (saved) Object.defineProperty(globalThis, Symbol.iterator, saved);
    else delete globalThis[Symbol.iterator];
  }
});

QUnit.test('selected iterator keys retain conditional and prefix effects', assert => {
  for (const choice of [false, true]) {
    const effects = [];
    // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- Distinct realm aliases are under test.
    const realm = choice ? globalThis : self;
    const list = [3];
    assert.true(((effects.push('test'), choice) ? Symbol : Symbol).iterator in list);
    assert.true((effects.push('prefix'), Symbol.iterator) in list);
    assert.true(realm.Symbol.iterator in list);
    assert.deepEqual(effects, ['test', 'prefix']);
  }
});

QUnit.test('a stored selection retains imported realm aliases', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    for (const choice of [false, true]) {
      const g = globalThis;
      let held;
      const result = (held = choice ? g : globalThis).window?.Array.from([3]);
      assert.deepEqual(result, present ? [3] : undefined);
      assert.strictEqual(held, globalThis);
    }
  });
});

QUnit.test('an optional user member keeps its short-circuit', assert => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'iteratorTestBox');
  try {
    for (const choice of [false, true]) {
      globalThis.iteratorTestBox = choice ? { list: [7] } : null;
      const effects = [];
      const result = globalThis.iteratorTestBox?.[(effects.push('key'), 'list')][Symbol.iterator]().next().value;
      assert.strictEqual(result, choice ? 7 : undefined);
      assert.deepEqual(effects, choice ? ['key'] : []);
    }
  } finally {
    if (saved) Object.defineProperty(globalThis, 'iteratorTestBox', saved);
    else delete globalThis.iteratorTestBox;
  }
});

QUnit.test('a dead optional cannot hide a previous stored receiver throw', assert => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'iteratorTestList');
  globalThis.iteratorTestList = [7];
  try {
    for (const requested of [false, true]) withWindowPresence(requested, present => {
      const effects = [];
      let held;
      function read() {
        return (effects.push('prefix'), (held = globalThis.window)).self?.[(effects.push('key'), 'iteratorTestList')].at((effects.push('argument'), 0));
      }
      if (present) {
        assert.strictEqual(read(), 7);
        assert.deepEqual(effects, ['prefix', 'key', 'argument']);
      } else {
        assert.throws(read, TypeError);
        assert.deepEqual(effects, ['prefix']);
      }
      assert.strictEqual((held = globalThis.window)?.self?.iteratorTestList.at(0), present ? 7 : undefined);
      assert.strictEqual(held, present ? globalThis.window : undefined);
      const box = {
        get value() { throw new Error('unexpected read'); },
        set value(value) { effects.push('write'); },
      };
      function throughSetter() {
        return (box.value = globalThis.window).self?.[(effects.push('key'), 'iteratorTestList')].at(0);
      }
      effects.length = 0;
      if (present) {
        assert.strictEqual(throughSetter(), 7);
        assert.deepEqual(effects, ['write', 'key']);
      } else {
        assert.throws(throughSetter, TypeError);
        assert.deepEqual(effects, ['write']);
      }
    });
  } finally {
    if (saved) Object.defineProperty(globalThis, 'iteratorTestList', saved);
    else delete globalThis.iteratorTestList;
  }
});
