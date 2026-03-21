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
