// Complex interactions between polyfills and babel syntax transforms
// Each test exercises multiple transforms simultaneously

/* eslint-disable es/no-async-functions -- transpiled by babel */

// --- destructuring inside bodyless if/while/for ---

QUnit.test('transform: destructuring in conditional block', assert => {
  let from;
  const cond = Math.random() > -1; // always true, not constant
  if (cond) {
    ({ from } = Array);
  }
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// --- catch clause: two sequential catches ---

QUnit.test('transform: two sequential catch clauses', assert => {
  let msg1, msg2;
  try {
    throw new Error('first');
  } catch (error) {
    msg1 = error.message.includes('first');
  }
  try {
    throw new Error('second');
  } catch (error) {
    msg2 = error.message.at(0);
  }
  assert.true(msg1);
  assert.same(msg2, 's');
});

// --- super: two calls in same class ---

QUnit.test('transform: super two static calls in one class', assert => {
  class MyPromise extends Promise {
    static both(a, b) {
      return Promise.all([super.resolve(a), super.resolve(b)]);
    }
  }
  const async = assert.async();
  MyPromise.both(1, 2).then(r => {
    assert.deepEqual(r, [1, 2]);
    async();
  });
});

// --- class inheritance chain + polyfill ---

QUnit.test('transform: class chain Base -> Child with polyfills', assert => {
  class Base {
    process(arr) { return arr.toSorted(); }
  }
  class Child extends Base {
    process(arr) { return super.process(arr).toReversed().at(0); }
  }
  assert.same(new Child().process([2, 1, 3]), 3);
});

// --- for-of + destructuring + break + polyfill ---

QUnit.test('transform: for-of + destructuring + early break', assert => {
  const map = new Map([['a', [1, 2]], ['b', [3, 4]], ['c', [5, 6]]]);
  let found;
  for (const [k, v] of map) {
    if (v.includes(3)) {
      found = k;
      break;
    }
  }
  assert.same(found, 'b');
});

// --- spread + for-of + Set + polyfill ---

QUnit.test('transform: spread + for-of over polyfilled Set', assert => {
  const s = new Set([3, 1, 4, 1, 5]);
  const result = [];
  for (const v of s) result.push(v);
  assert.deepEqual([...s].toSorted(), [1, 3, 4, 5]);
  assert.same(result.at(-1), 5);
});

// --- optional chaining + nullish + destructuring ---

QUnit.test('transform: optional + nullish + destructuring combo', assert => {
  const config = { options: { items: [1, 2, 3] } };
  const items = config?.options?.items ?? Array.from([4, 5]);
  const { length } = items;
  assert.same(length, 3);
  assert.true(items.includes(2));
});

// --- generator + for-of + spread + polyfill ---

QUnit.test('transform: generator + spread + for-of', assert => {
  function * pairs(obj) {
    for (const [k, v] of Object.entries(obj)) yield `${ k }:${ v }`;
  }
  assert.deepEqual([...pairs({ a: 1, b: 2 })], ['a:1', 'b:2']);
});

// --- async + optional + polyfill ---

QUnit.test('transform: async + optional chaining + polyfill', assert => {
  const async = assert.async();
  (async () => {
    const data = await Promise.resolve({ items: [3, 1, 2] });
    assert.deepEqual(data?.items?.toSorted(), [1, 2, 3]);
    assert.same(null?.items?.toSorted(), undefined);
    async();
  })();
});

// --- destructuring + logical assignment + polyfill ---

QUnit.test('transform: destructuring + logical assignment', assert => {
  let { from } = Array;
  from ??= () => [];
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// --- multiple destructuring: static + instance + rest ---

QUnit.test('transform: multi-decl destructuring static + instance rest', assert => {
  const { from } = Array;
  const { includes, ...rest } = [];
  assert.deepEqual(from([1]), [1]);
  assert.same(typeof includes, 'function');
  assert.false('includes' in rest);
});

// --- class + optional + for-of + template ---

QUnit.test('transform: class + optional + for-of + template literal', assert => {
  class Formatter {
    format(items) {
      const result = [];
      for (const item of items?.toSorted() ?? []) result.push(`[${ item }]`);
      return result;
    }
  }
  assert.deepEqual(new Formatter().format([3, 1, 2]), ['[1]', '[2]', '[3]']);
  assert.deepEqual(new Formatter().format(null), []);
});

// --- promise chain + array polyfill chain ---

QUnit.test('transform: Promise.all + Array.from + filter + at', assert => {
  const async = assert.async();
  Promise.all([
    Promise.resolve(5),
    Promise.resolve(2),
    Promise.resolve(8),
  ]).then(results => {
    assert.same(Array.from(results).findLast(x => x > 3), 8);
    async();
  });
});

// --- computed Symbol.iterator + spread + for-of ---

QUnit.test('transform: custom iterable + spread + for-of', assert => {
  const range = {
    [Symbol.iterator]() {
      let i = 0;
      return { next() { return i < 3 ? { value: i++, done: false } : { done: true }; } };
    },
  };
  assert.deepEqual([...range], [0, 1, 2]);
  const result = [];
  for (const v of range) result.push(v * 10);
  assert.deepEqual(result, [0, 10, 20]);
});

// --- nested async + destructuring + polyfill ---

QUnit.test('transform: nested async calls + destructuring', assert => {
  const async = assert.async();
  (async () => {
    const { resolve } = Promise;
    const [a, b] = await Promise.all([resolve(10), resolve(20)]);
    assert.same(a + b, 30);
    async();
  })();
});
