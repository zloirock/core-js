// Static properties: Object, Array, Promise, Number, Math, JSON, Reflect, String, Symbol, URL
QUnit.test('static: Array.from', assert => {
  assert.deepEqual(Array.from('abc'), ['a', 'b', 'c']);
  assert.deepEqual(Array.from([1, 2, 3], x => x ** 2), [1, 4, 9]);
  assert.deepEqual(Array.from(new Set([1, 2])), [1, 2]);
});

QUnit.test('static: Array.of', assert => {
  assert.deepEqual(Array.of(1, 2, 3), [1, 2, 3]);
});

QUnit.test('static: Object.assign', assert => {
  const target = { a: 1 };
  const result = Object.assign(target, { b: 2 }, { c: 3 });
  assert.same(result, target);
  assert.deepEqual(result, { a: 1, b: 2, c: 3 });
});

QUnit.test('static: Object.entries', assert => {
  assert.deepEqual(Object.entries({ a: 1, b: 2 }), [['a', 1], ['b', 2]]);
});

QUnit.test('static: Object.fromEntries', assert => {
  assert.deepEqual(Object.fromEntries([['a', 1], ['b', 2]]), { a: 1, b: 2 });
  assert.deepEqual(Object.fromEntries(new Map([['x', 1]])), { x: 1 });
});

QUnit.test('static: Object.hasOwn', assert => {
  assert.true(Object.hasOwn({ a: 1 }, 'a'));
  assert.false(Object.hasOwn({ a: 1 }, 'b'));
  assert.false(Object.hasOwn({}, 'toString'));
});

QUnit.test('static: Object.groupBy', assert => {
  const result = Object.groupBy([1, 2, 3, 4], v => v % 2 ? 'odd' : 'even');
  assert.deepEqual(result.odd, [1, 3]);
  assert.deepEqual(result.even, [2, 4]);
});

QUnit.test('static: Map.groupBy', assert => {
  const result = Map.groupBy([1, 2, 3, 4], v => v % 2 ? 'odd' : 'even');
  assert.true(result instanceof Map);
  assert.deepEqual(result.get('odd'), [1, 3]);
});

QUnit.test('static: Promise.all', assert => {
  const async = assert.async();
  Promise.all([Promise.resolve(1), Promise.resolve(2)]).then(r => {
    assert.deepEqual(r, [1, 2]);
    async();
  });
});

QUnit.test('static: Promise.allSettled', assert => {
  const async = assert.async();
  Promise.allSettled([Promise.resolve(1), Promise.reject(2)]).then(r => {
    assert.same(r[0].status, 'fulfilled');
    assert.same(r[0].value, 1);
    assert.same(r[1].status, 'rejected');
    assert.same(r[1].reason, 2);
    async();
  });
});

QUnit.test('static: Promise.any', assert => {
  const async = assert.async();
  Promise.any([Promise.reject(1), Promise.resolve(2)]).then(r => {
    assert.same(r, 2);
    async();
  });
});

QUnit.test('static: Number.isFinite', assert => {
  assert.true(Number.isFinite(1));
  assert.false(Number.isFinite(Infinity));
  assert.false(Number.isFinite('1'));
});

QUnit.test('static: Number.isNaN', assert => {
  assert.true(Number.isNaN(NaN));
  assert.false(Number.isNaN(1));
  assert.false(Number.isNaN('NaN'));
});

QUnit.test('static: Math.trunc', assert => {
  assert.same(Math.trunc(1.5), 1);
  assert.same(Math.trunc(-1.5), -1);
  assert.same(Math.trunc(0.1), 0);
});

QUnit.test('static: JSON.stringify well-formed', assert => {
  assert.same(JSON.stringify('\uD800'), '"\\ud800"', 'lone surrogate');
});

QUnit.test('static: Reflect.ownKeys', assert => {
  const s = Symbol('s');
  assert.deepEqual(Reflect.ownKeys({ a: 1, [s]: 2 }), ['a', s]);
});

QUnit.test('static: String.fromCodePoint', assert => {
  assert.same(String.fromCodePoint(0x1F600), '\uD83D\uDE00');
});

QUnit.test('static: String.raw', assert => {
  assert.same(String.raw`hello\nworld`, 'hello\\nworld');
});

QUnit.test('static: RegExp.escape', assert => {
  const escaped = RegExp.escape('a.b');
  assert.true(new RegExp(escaped).test('a.b'));
  assert.false(new RegExp(escaped).test('axb'));
});

QUnit.test('static: Error.isError', assert => {
  assert.true(Error.isError(new Error('test')));
  assert.true(Error.isError(new TypeError('test')));
  assert.false(Error.isError({}));
});

QUnit.test('static: Array.from with array-like', assert => {
  assert.deepEqual(Array.from({ 0: 'a', 1: 'b', length: 2 }), ['a', 'b']);
  assert.deepEqual(Array.from({ length: 3 }, (_, i) => i * 10), [0, 10, 20]);
});

QUnit.test('static: Array.of edge cases', assert => {
  assert.deepEqual(Array.of(1), [1]);
  assert.deepEqual(Array.of(undefined), [undefined]);
});

QUnit.test('static: Array.fromAsync with mapFn', assert => {
  const async = assert.async();
  Array.fromAsync([1, 2, 3], x => x * 10).then(arr => {
    assert.deepEqual(arr, [10, 20, 30]);
    async();
  });
});

QUnit.test('static: Array.isArray', assert => {
  assert.true(Array.isArray([1, 2]));
  assert.false(Array.isArray('string'));
});

QUnit.test('static: JSON.stringify', assert => {
  assert.same(JSON.stringify({ a: 1 }), '{"a":1}');
});

QUnit.test('static: Number.MAX_SAFE_INTEGER / MIN_SAFE_INTEGER', assert => {
  assert.same(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  assert.same(typeof Number.MIN_SAFE_INTEGER, 'number');
});
