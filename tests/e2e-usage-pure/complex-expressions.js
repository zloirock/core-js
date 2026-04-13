// Complex expressions: nested calls, method calls on results, IIFE, ternary
QUnit.test('complex: Array.from on Set result', assert => {
  assert.deepEqual(Array.from(new Set([3, 1, 2, 1])), [3, 1, 2]);
});

QUnit.test('complex: Object.entries + Object.fromEntries roundtrip', assert => {
  const obj = { a: 1, b: 2, c: 3 };
  const filtered = Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v > 1),
  );
  assert.deepEqual(filtered, { b: 2, c: 3 });
});

QUnit.test('complex: Promise.all with map', assert => {
  const async = assert.async();
  Promise.all([1, 2, 3].map(x => Promise.resolve(x * 2))).then(r => {
    assert.deepEqual(r, [2, 4, 6]);
    async();
  });
});

QUnit.test('complex: nested Array.from + flat', assert => {
  assert.deepEqual(
    Array.from(new Map([['a', [1, 2]], ['b', [3, 4]]])).flatMap(([, v]) => v),
    [1, 2, 3, 4],
  );
});

QUnit.test('complex: Object.assign with spread-like usage', assert => {
  const defaults = { color: 'red', size: 10 };
  const overrides = { size: 20, weight: 5 };
  const result = Object.assign({}, defaults, overrides);
  assert.deepEqual(result, { color: 'red', size: 20, weight: 5 });
});

QUnit.test('complex: Array.from with generator-like iterable', assert => {
  const range = {
    [Symbol.iterator]() {
      let i = 0;
      return { next() { return i < 3 ? { value: i++, done: false } : { done: true }; } };
    },
  };
  assert.deepEqual(Array.from(range), [0, 1, 2]);
});

QUnit.test('complex: structuredClone preserves Map/Set', assert => {
  const original = { map: new Map([['k', 'v']]), set: new Set([1, 2]) };
  const clone = structuredClone(original);
  assert.true(clone.map instanceof Map);
  assert.same(clone.map.get('k'), 'v');
  assert.true(clone.set instanceof Set);
  assert.true(clone.set.has(1));
  assert.notSame(clone.map, original.map);
});

QUnit.test('complex: Number.isFinite + parseFloat', assert => {
  assert.true(Number.isFinite(parseFloat('3.14')));
  assert.true(Number.isFinite(parseFloat('100')));
});

QUnit.test('complex: chained string transforms', assert => {
  assert.same(
    '  Hello, World!  '
      .trim()
      .replaceAll('!', '?')
      .padEnd(20, '.'),
    'Hello, World?.......',
  );
});
QUnit.test('complex: polyfill in default parameter', assert => {
  function process(items = Array.from([1, 2, 3])) {
    return items.filter(x => x > 1);
  }
  assert.deepEqual(process(), [2, 3]);
  assert.deepEqual(process([5, 6]), [5, 6]);
});

QUnit.test('complex: Promise.all with Array.from', assert => {
  const async = assert.async();
  Promise.all(Array.from([1, 2, 3], x => Promise.resolve(x * 10))).then(r => {
    assert.deepEqual(r, [10, 20, 30]);
    async();
  });
});

QUnit.test('complex: structuredClone preserves polyfilled result', assert => {
  const original = { items: Array.from([1, 2, 3]) };
  const cloned = structuredClone(original);
  assert.deepEqual(cloned.items, [1, 2, 3]);
  assert.true(cloned.items.includes(2));
});

QUnit.test('complex: Iterator.from chained with instance method', assert => {
  const result = Iterator.from([1, 2, 3, 4]).filter(x => x > 2).toArray();
  assert.deepEqual(result, [3, 4]);
});

QUnit.test('complex: structuredClone preserves Map', assert => {
  const map = new Map([['a', 1]]);
  const clone = structuredClone(map);
  assert.same(clone.get('a'), 1);
  assert.true(clone instanceof Map);
});

QUnit.test('complex: queueMicrotask with polyfill inside', assert => {
  const async = assert.async();
  queueMicrotask(() => {
    assert.deepEqual(Array.from([1, 2, 3]).filter(x => x > 1), [2, 3]);
    async();
  });
});

QUnit.test('complex: polyfill in array destructuring', assert => {
  const [first, ...rest] = Array.from([10, 20, 30]);
  assert.same(first, 10);
  assert.deepEqual(rest, [20, 30]);
});

QUnit.test('complex: polyfill in object shorthand', assert => {
  const keys = Object.keys({ x: 1, y: 2 });
  const entries = Object.entries({ x: 1 });
  const result = { keys, entries };
  assert.deepEqual(result.keys, ['x', 'y']);
  assert.deepEqual(result.entries, [['x', 1]]);
});
