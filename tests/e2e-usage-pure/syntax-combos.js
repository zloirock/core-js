// Polyfills combined with syntax transforms (destructuring, spread, for-of, classes, etc.)
// Verifies pre() runs before @babel/transform-destructuring, transform-classes, etc.

/* eslint-disable es/no-async-functions -- transpiled by babel */

// --- destructuring + polyfill ---

QUnit.test('syntax: destructuring + rest excludes polyfilled', assert => {
  const { from, ...rest } = Array;
  assert.same(typeof from, 'function');
  assert.false('from' in rest);
});

QUnit.test('syntax: destructuring with default value', assert => {
  const { from = null } = Array;
  assert.deepEqual(from([1]), [1]);
});

QUnit.test('syntax: catch clause + instance method', assert => {
  try {
    throw new Error('test');
  } catch (err) {
    assert.true(err.message.includes('test'));
  }
});

QUnit.test('syntax: IIFE destructuring', assert => {
  (({ from }) => {
    assert.deepEqual(from([1, 2]), [1, 2]);
  })(Array);
});

// --- spread + polyfill ---

QUnit.test('syntax: spread Set into array', assert => {
  assert.deepEqual([...new Set([1, 2, 2, 3])], [1, 2, 3]);
});

QUnit.test('syntax: spread Map entries', assert => {
  const entries = [...new Map([['a', 1]])];
  assert.deepEqual(entries, [['a', 1]]);
});

// --- for-of + polyfill ---

QUnit.test('syntax: for-of Set', assert => {
  const result = [];
  for (const v of new Set([4, 5, 6])) result.push(v);
  assert.deepEqual(result, [4, 5, 6]);
});

QUnit.test('syntax: for-of Map destructuring', assert => {
  const result = [];
  for (const [k, v] of new Map([['a', 1], ['b', 2]])) result.push(`${ k }=${ v }`);
  assert.deepEqual(result, ['a=1', 'b=2']);
});

// --- class + polyfill ---

QUnit.test('syntax: class with polyfill in constructor + method', assert => {
  class Coll {
    constructor(items) {
      this.data = Array.from(items);
    }
    has(item) {
      return this.data.includes(item);
    }
  }
  const c = new Coll([1, 2, 3]);
  assert.true(c.has(2));
  assert.false(c.has(4));
});

QUnit.test('syntax: class extends + super.from', assert => {
  class MyArray extends Array {
    static create(src) {
      return super.from(src);
    }
  }
  assert.deepEqual(MyArray.create([1, 2]), [1, 2]);
});

// --- arrow + polyfill ---

QUnit.test('syntax: arrow with default param polyfill', assert => {
  const fn = (items = Array.from([1, 2, 3])) => items.filter(x => x > 1);
  assert.deepEqual(fn(), [2, 3]);
});

QUnit.test('syntax: arrow body with chained polyfills', assert => {
  const fn = arr => arr.filter(x => x > 0).map(x => x * 2).at(-1);
  assert.same(fn([1, -2, 3]), 6);
});

// --- template literal + polyfill ---

QUnit.test('syntax: template literal with polyfill result', assert => {
  const msg = `found ${ [1, 2, 3].findIndex(x => x > 2) } at index`;
  assert.same(msg, 'found 2 at index');
});

// --- computed property + polyfill ---

QUnit.test('syntax: computed property with Symbol.iterator', assert => {
  const iterable = { [Symbol.iterator]() { return [1, 2, 3][Symbol.iterator](); } };
  assert.deepEqual(Array.from(iterable), [1, 2, 3]);
});

// --- optional chaining + polyfill ---

QUnit.test('syntax: optional chaining + instance polyfill', assert => {
  const arr = [1, 2, 3];
  assert.true(arr?.includes(2));
  assert.same(null?.includes(2), undefined);
});

QUnit.test('syntax: optional chaining chain continuation', assert => {
  assert.deepEqual([1, [2]]?.flat().valueOf(), [1, 2]);
  assert.same(null?.flat().valueOf(), undefined);
});

// --- nullish coalescing + polyfill ---

QUnit.test('syntax: nullish coalescing fallback to polyfill', assert => {
  const getItems = x => x ?? Array.from([1, 2, 3]);
  assert.deepEqual(getItems(null), [1, 2, 3]);
  assert.deepEqual(getItems([4]), [4]);
});

// --- logical assignment + polyfill ---

QUnit.test('syntax: logical assignment with polyfill', assert => {
  let arr = null;
  arr ??= Array.from([1, 2]);
  assert.deepEqual(arr, [1, 2]);
  arr ??= [3, 4];
  assert.deepEqual(arr, [1, 2]);
});

// --- async + polyfill ---

QUnit.test('syntax: async function with Promise.all', assert => {
  const async = assert.async();
  (async () => {
    const r = await Promise.all([Promise.resolve(1), Promise.resolve(2)]);
    assert.deepEqual(r, [1, 2]);
    async();
  })();
});

// --- object rest/spread + polyfill ---

QUnit.test('syntax: object spread with polyfill result', assert => {
  const base = Object.freeze({ a: 1 });
  const extended = { ...base, b: 2 };
  assert.same(extended.a, 1);
  assert.same(extended.b, 2);
});

// --- for-of destructuring + polyfill ---

QUnit.test('syntax: for-of Map.entries destructuring', assert => {
  const map = new Map([['x', 10], ['y', 20]]);
  const result = [];
  for (const [k, v] of map.entries()) result.push(`${ k }=${ v }`);
  assert.deepEqual(result, ['x=10', 'y=20']);
});

// --- generator + polyfill ---

QUnit.test('syntax: generator yielding polyfill results', assert => {
  function * gen() {
    yield Array.from([1, 2]);
    yield Object.keys({ a: 1, b: 2 });
    yield [3, 1, 2].toSorted();
  }
  const results = Array.from(gen());
  assert.deepEqual(results, [[1, 2], ['a', 'b'], [1, 2, 3]]);
});

// --- multiple transforms in one expression ---

QUnit.test('syntax: spread + optional + chaining', assert => {
  const data = { items: [3, 1, 2] };
  const sorted = data?.items?.toSorted();
  assert.deepEqual([...sorted], [1, 2, 3]);
});

QUnit.test('syntax: destructuring + for-of + polyfill', assert => {
  const { from } = Array;
  const result = [];
  for (const item of from([10, 20])) result.push(item * 2);
  assert.deepEqual(result, [20, 40]);
});

QUnit.test('syntax: class + spread + optional', assert => {
  class DataStore {
    constructor(...items) {
      this.data = new Set(items);
    }
    has(item) {
      return this.data?.has(item) ?? false;
    }
    toArray() {
      return [...this.data];
    }
  }
  const store = new DataStore(1, 2, 3);
  assert.true(store.has(2));
  assert.deepEqual(store.toArray().toSorted(), [1, 2, 3]);
});
