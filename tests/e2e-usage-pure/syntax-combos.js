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

// --- destructuring: multiple declarators ---

QUnit.test('syntax: multiple destructuring declarators', assert => {
  const { from } = Array;
  const { resolve } = Promise;
  assert.deepEqual(from([1]), [1]);
  const async = assert.async();
  resolve(42).then(v => {
    assert.same(v, 42);
    async();
  });
});

// --- destructuring: assignment form ---

QUnit.test('syntax: assignment destructuring ({ keys } = Object)', assert => {
  let keys;
  ({ keys } = Object); // eslint-disable-line prefer-const -- assignment destructuring
  assert.deepEqual(keys({ a: 1 }), ['a']);
});

// --- destructuring: renamed ---

QUnit.test('syntax: destructuring renamed binding', assert => {
  const { from: arrayFrom } = Array;
  assert.deepEqual(arrayFrom([1, 2]), [1, 2]);
});

// --- destructuring: logical init ---

QUnit.test('syntax: const { from } = Array ?? null', assert => {
  const { from } = Array ?? null;
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// --- class: polyfill in getter ---

QUnit.test('syntax: class methods with polyfill chaining', assert => {
  class DataView {
    constructor(data) { this.data = data; }
    keys() { return Object.keys(this.data); }
    sorted() { return this.keys().toSorted(); }
  }
  const view = new DataView({ b: 2, a: 1 });
  assert.deepEqual(view.sorted(), ['a', 'b']);
});

// --- for-of: break / continue ---

QUnit.test('syntax: for-of with break after polyfill', assert => {
  let found;
  for (const item of new Set([10, 20, 30])) {
    if ([20, 30].includes(item)) {
      found = item;
      break;
    }
  }
  assert.same(found, 20);
});

// --- spread: in function call ---

QUnit.test('syntax: spread polyfilled array in call', assert => {
  const items = Array.from([1, 2, 3]);
  assert.same(Math.max(...items), 3);
});

// --- optional chaining: computed member ---

QUnit.test('syntax: optional chaining computed member', assert => {
  const obj = { items: [1, 2, 3] };
  assert.same(obj?.items?.at(-1), 3);
  assert.same(null?.items?.at(-1), undefined);
});

// --- optional chaining: call on result ---

QUnit.test('syntax: optional chaining call + instance method', assert => {
  const getData = () => [3, 1, 2];
  assert.deepEqual(getData()?.toSorted(), [1, 2, 3]);
});

// --- shorthand method + computed key ---

QUnit.test('syntax: object with computed key + polyfill in value', assert => {
  const prop = 'items';
  const obj = { [prop]: Array.from([1, 2, 3]) };
  assert.deepEqual(obj[prop], [1, 2, 3]);
});

// --- for-in + polyfill ---

QUnit.test('syntax: for-in + polyfill on values', assert => {
  const obj = { a: [1, 2], b: [3, 4] };
  const result = [];
  for (const k in obj) {
    if (Object.hasOwn(obj, k)) result.push(obj[k].at(-1));
  }
  assert.deepEqual(result, [2, 4]);
});

// --- exponentiation operator ---

QUnit.test('syntax: exponentiation + polyfill', assert => {
  const base = [1, 4, 9].at(1);
  assert.same(Math.sqrt(base), 2);
});

// --- tagged template literal ---

QUnit.test('syntax: tagged template + polyfill', assert => {
  function tag(strings, ...values) {
    return strings.map((s, i) => s + (values[i] ?? '')).join('');
  }
  assert.same(tag`sum=${ Math.sumPrecise([1, 2, 3]) }`, 'sum=6');
});

// --- nested destructuring + polyfill ---

QUnit.test('syntax: nested destructuring from Object.entries', assert => {
  const [[k1, v1], [k2]] = Object.entries({ a: 1, b: 2 });
  assert.same(k1, 'a');
  assert.same(v1, 1);
  assert.same(k2, 'b');
});

// --- class constructor init + polyfill ---

QUnit.test('syntax: class constructor init with polyfill', assert => {
  class Config {
    constructor() { this.keys = Object.keys({ debug: true, verbose: false }); }
  }
  assert.deepEqual(new Config().keys, ['debug', 'verbose']);
});

// --- promise + for-of ---

QUnit.test('syntax: async for-of array with polyfill', assert => {
  const async = assert.async();
  (async () => {
    const items = await Promise.resolve([10, 20, 30]);
    const result = [];
    for (const v of items) result.push(v);
    assert.same(result.at(-1), 30);
    async();
  })();
});

// --- optional chaining + nullish coalescing + polyfill ---

QUnit.test('syntax: optional chain + ?? + polyfill', assert => {
  const data = null;
  const keys = data?.keys ?? Object.keys({ fallback: true });
  assert.deepEqual(keys, ['fallback']);
});

// --- logical OR assignment + polyfill ---

QUnit.test('syntax: ||= with polyfill', assert => {
  let items = null;
  items ||= Array.from([1, 2, 3]);
  assert.deepEqual(items, [1, 2, 3]);
});

// --- logical AND assignment + polyfill ---

QUnit.test('syntax: &&= with polyfill', assert => {
  let items = [1, 2, 3];
  items &&= items.filter(x => x > 1);
  assert.deepEqual(items, [2, 3]);
});
