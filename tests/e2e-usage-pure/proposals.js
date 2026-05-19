// esnext proposals: various stages
QUnit.test('esnext: Array#filterReject', assert => {
  assert.deepEqual([1, 2, 3, 4].filterReject(x => x % 2), [2, 4]);
});

QUnit.test('esnext: Array#uniqueBy', assert => {
  assert.deepEqual([1, 2, 3, 2, 1].uniqueBy(), [1, 2, 3]);
  assert.deepEqual(
    [{ id: 1 }, { id: 2 }, { id: 1 }].uniqueBy(x => x.id),
    [{ id: 1 }, { id: 2 }],
  );
});

QUnit.test('esnext: Number#clamp', assert => {
  assert.same((2).clamp(4, 6), 4);
  assert.same((5).clamp(2, 8), 5);
  assert.same((10).clamp(2, 8), 8);
});

QUnit.test('esnext: Function#demethodize', assert => {
  const push = [].push.demethodize();
  const arr = [1, 2];
  push(arr, 3);
  assert.deepEqual(arr, [1, 2, 3]);
});

QUnit.test('esnext: String.cooked', assert => {
  assert.same(String.cooked(['Hi\\n', '!'], 'Bob'), 'Hi\\nBob!');
});

QUnit.test('esnext: Set.from', assert => {
  assert.deepEqual(Array.from(Set.from([1, 2, 3, 2, 1])), [1, 2, 3]);
});

QUnit.test('esnext: Map.from', assert => {
  const m = Map.from([[1, 'a'], [2, 'b']]);
  assert.same(m.get(1), 'a');
  assert.same(m.get(2), 'b');
});

QUnit.test('esnext: WeakMap.from', assert => {
  const k1 = {},
        k2 = {};
  const wm = WeakMap.from([[k1, 1], [k2, 2]]);
  assert.same(wm.get(k1), 1);
  assert.same(wm.get(k2), 2);
});

QUnit.test('esnext: Iterator.zip', assert => {
  assert.deepEqual(Array.from(Iterator.zip([[1, 2, 3], [4, 5, 6]])), [[1, 4], [2, 5], [3, 6]]);
});

QUnit.test('esnext: Iterator#chunks', assert => {
  assert.deepEqual(Array.from(Iterator.from([1, 2, 3, 4, 5]).chunks(2)), [[1, 2], [3, 4], [5]]);
});

QUnit.test('esnext: Iterator#windows', assert => {
  assert.deepEqual(Array.from(Iterator.from([1, 2, 3, 4]).windows(2)), [[1, 2], [2, 3], [3, 4]]);
});

QUnit.test('esnext: Set.of', assert => {
  const set = Set.of(1, 2, 3);
  assert.same(set.size, 3);
  assert.true(set.has(2));
});

QUnit.test('esnext: Map.of', assert => {
  const map = Map.of(['a', 1], ['b', 2]);
  assert.same(map.size, 2);
  assert.same(map.get('a'), 1);
});

QUnit.test('esnext: WeakSet.from', assert => {
  const obj1 = {};
  const obj2 = {};
  const ws = WeakSet.from([obj1, obj2]);
  assert.true(ws.has(obj1));
  assert.true(ws.has(obj2));
});

QUnit.test('esnext: WeakSet.of', assert => {
  const obj1 = {};
  const obj2 = {};
  const ws = WeakSet.of(obj1, obj2);
  assert.true(ws.has(obj1));
});

QUnit.test('esnext: WeakMap.of', assert => {
  const k1 = {};
  const wm = WeakMap.of([k1, 42]);
  assert.same(wm.get(k1), 42);
});

QUnit.test('esnext: Error.isError', assert => {
  assert.true(Error.isError(new Error('test')));
  assert.true(Error.isError(new TypeError('test')));
  assert.false(Error.isError({}));
});

QUnit.test('esnext: Symbol.isRegisteredSymbol', assert => {
  assert.true(Symbol.isRegisteredSymbol(Symbol.for('test')));
});

QUnit.test('esnext: Symbol.isWellKnownSymbol', assert => {
  assert.true(Symbol.isWellKnownSymbol(Symbol.iterator));
});

QUnit.test('esnext: Iterator.range', assert => {
  assert.deepEqual(Array.from(Iterator.range(0, 5)), [0, 1, 2, 3, 4]);
});

QUnit.test('esnext: Iterator.zipKeyed', assert => {
  const result = Iterator.zipKeyed({ a: [1, 2], b: [3, 4] });
  assert.deepEqual(Array.from(result), [{ a: 1, b: 3 }, { a: 2, b: 4 }]);
});

QUnit.test('esnext: Promise.allKeyed', assert => {
  const async = assert.async();
  Promise.allKeyed({ a: Promise.resolve(1), b: Promise.resolve(2) }).then(result => {
    assert.same(result.a, 1);
    assert.same(result.b, 2);
    async();
  });
});

QUnit.test('esnext: Promise.allSettledKeyed', assert => {
  const async = assert.async();
  Promise.allSettledKeyed({ a: Promise.resolve(1), b: Promise.reject(2) }).then(result => {
    assert.same(result.a.status, 'fulfilled');
    assert.same(result.a.value, 1);
    assert.same(result.b.status, 'rejected');
    assert.same(result.b.reason, 2);
    async();
  });
});

QUnit.test('esnext: String.dedent', assert => {
  assert.isFunction(String.dedent);
});

QUnit.test('esnext: RegExp.escape', assert => {
  const escaped = RegExp.escape('a.b');
  assert.true(new RegExp(escaped).test('a.b'));
  assert.false(new RegExp(escaped).test('axb'));
});

QUnit.test('esnext: Object.keysLength', assert => {
  assert.same(Object.keysLength({ a: 1, b: 2 }), 2);
  assert.same(Object.keysLength({}), 0);
});

QUnit.test('esnext: Object.groupBy by parity, then toReversed / map each group', assert => {
  const grouped = Object.groupBy([1, 2, 3, 4, 5, 6], x => x % 2 === 0 ? 'even' : 'odd');
  assert.deepEqual(grouped.even.toReversed(), [6, 4, 2]);
  assert.deepEqual(grouped.odd.map(x => x * 10), [10, 30, 50]);
});

QUnit.test('esnext: Map.groupBy with object keys, Array.from over result Map', assert => {
  const A = { t: 'a' };
  const B = { t: 'b' };
  const items = [{ k: A, v: 1 }, { k: B, v: 2 }, { k: A, v: 3 }];
  const g = Map.groupBy(items, it => it.k);
  const sums = Array.from(g, ([, xs]) => xs.reduce((a, b) => a + b.v, 0));
  assert.deepEqual(sums.toSorted(), [2, 4]);
});

// Array.fromAsync direct call. existing tests (chaining.js / destructuring.js)
// exercise it through destructured aliases; this covers the full-qualified
// `Array.fromAsync(...)` static-call path AND the async-iterable input branch
QUnit.test('esnext: Array.fromAsync over sync iterable', assert => {
  const async = assert.async();
  Array.fromAsync([1, 2, 3]).then(arr => {
    assert.deepEqual(arr, [1, 2, 3]);
    async();
  });
});

QUnit.test('esnext: Array.fromAsync over async iterable with map callback', assert => {
  const async = assert.async();
  // async-iterable input via `AsyncIterator.from([...])` (pure-mode entry to the
  // async-helper pipeline; wraps a sync iterable so each value resolves through
  // Promise.resolve per spec). avoids `async function*` syntax that the e2e
  // lint policy forbids. each yielded value awaits through iteration before the
  // map callback applies
  const asyncIt = AsyncIterator.from([1, 2, 3]);
  Array.fromAsync(asyncIt, x => x * 10).then(arr => {
    assert.deepEqual(arr, [10, 20, 30]);
    async();
  });
});

// AggregateError + cause: covers the polyfilled AggregateError constructor's
// cause-wrapper (`wrap-error-constructor-with-cause`). `Error.cause` itself is
// NOT injected in pure mode - the `Error` entry in `built-in-definitions.mjs` is
// `{ global: ... }`, meaning it only triggers under usage-global; in pure mode
// `new Error('msg', { cause })` falls back to the native runtime. `instanceof
// AggregateError` IS reliable here because both sides resolve to the same
// polyfilled default-import; `instanceof Error` would cross the polyfill /
// native constructor boundary and is intentionally omitted
QUnit.test('esnext: AggregateError with cause option', assert => {
  const a = new Error('a');
  const b = new Error('b');
  const root = new Error('root');
  const aggregate = new AggregateError([a, b], 'multi', { cause: root });
  assert.true(aggregate instanceof AggregateError);
  assert.same(aggregate.cause, root);
  assert.same(aggregate.errors.length, 2);
  assert.same(aggregate.errors[0], a);
});

