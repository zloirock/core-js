/* eslint-disable prefer-destructuring -- intentionally testing non-destructuring member access */
// Polyfilled methods as callbacks, stored references, and higher-order usage

// callbacks
QUnit.test('local method result: static calls preserve receiver and argument effects', assert => {
  const events = [];
  const source = { read() {
    events.push('method');
    return Map;
  } };
  const result = source.read(events.push('receiver-argument')).groupBy((events.push('static-argument'), [1, 2, 1]), value => value);
  assert.deepEqual(result.get(1), [1, 1]);
  assert.deepEqual(events, ['receiver-argument', 'method', 'static-argument']);
});

QUnit.test('local method result: stored and destructured statics remain usable', assert => {
  let calls = 0;
  const source = { read() {
    calls++;
    return Map;
  } };
  const Constructor = source.read();
  const { groupBy } = source.read();
  assert.deepEqual(Constructor.groupBy([1], value => value).get(1), [1]);
  assert.deepEqual(groupBy([2], value => value).get(2), [2]);
  assert.same(calls, 2);
});

QUnit.test('callback: Number.isFinite as filter', assert => {
  assert.deepEqual([1, Infinity, 2, NaN, 3].filter(Number.isFinite), [1, 2, 3]);
});

QUnit.test('callback: Number.isNaN as filter', assert => {
  assert.deepEqual([1, NaN, 2, NaN, 3].filter(Number.isNaN), [NaN, NaN]);
});

QUnit.test('callback: Object.keys in map', assert => {
  const objs = [{ a: 1 }, { b: 2, c: 3 }];
  assert.deepEqual(objs.map(Object.keys), [['a'], ['b', 'c']]);
});

QUnit.test('callback: String.fromCodePoint in map', assert => {
  assert.deepEqual([65, 66, 67].map(cp => String.fromCodePoint(cp)), ['A', 'B', 'C']);
});

QUnit.test('callback: Promise.resolve in map + Promise.all', assert => {
  const async = assert.async();
  Promise.all([1, 2, 3].map(Promise.resolve, Promise)).then(r => {
    assert.deepEqual(r, [1, 2, 3]);
    async();
  });
});

// stored references (non-destructuring member access)
QUnit.test('stored: Array.from in variable', assert => {
  const from = Array.from;
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
});

QUnit.test('stored: Object.keys in variable', assert => {
  const keys = Object.keys;
  assert.deepEqual(keys({ a: 1 }), ['a']);
});

QUnit.test('stored: Math.sign in variable', assert => {
  const sign = Math.sign;
  assert.same(sign(-5), -1);
  assert.same(sign(5), 1);
});

QUnit.test('stored: static method as default parameter', assert => {
  function process(transform = Array.from) {
    return transform('abc');
  }
  assert.deepEqual(process(), ['a', 'b', 'c']);
});

QUnit.test('stored: instance method via destructuring', assert => {
  const { includes } = [];
  assert.true(includes.call([1, 2, 3], 2));
  assert.false(includes.call([1, 2, 3], 4));
});

// polyfill stored as callback - wrap to avoid extra args from .map(fn, i, arr)
QUnit.test('callback: Array.from wrapped as callback', assert => {
  const items = [[1, 2], [3, 4]];
  const result = items.map(x => Array.from(x));
  assert.deepEqual(result, [[1, 2], [3, 4]]);
});

// polyfill in setTimeout callback
QUnit.test('callback: polyfill in setTimeout', assert => {
  const async = assert.async();
  setTimeout(() => {
    assert.deepEqual([3, 1, 2].toSorted(), [1, 2, 3]);
    async();
  }, 0);
});

// polyfill as property value
QUnit.test('reference: polyfill as object property', assert => {
  const utils = {
    fromArray: Array.from,
    getKeys: Object.keys,
  };
  assert.deepEqual(utils.fromArray([1, 2]), [1, 2]);
  assert.deepEqual(utils.getKeys({ a: 1 }), ['a']);
});

QUnit.test('callback: Array.from mapFn using polyfilled method per element', assert => {
  const r = Array.from({ length: 3 }, (_, i) => [i, i * 2]).flat();
  assert.deepEqual(r, [0, 0, 1, 2, 2, 4]);
});

// member-binding for multi-word static names. mirrors the destructure form's kebab->camel
// path through staticPairFromPolyfillEntry's segment.at(-1) lookup. without conversion the
// non-destructure alias chain would miss multi-word polyfill entries entirely

QUnit.test('stored: Object.setPrototypeOf in variable', assert => {
  const setProto = Object.setPrototypeOf;
  const obj = {};
  setProto(obj, { tag: 'stored' });
  assert.same(obj.tag, 'stored');
});

QUnit.test('stored: Number.isInteger in variable', assert => {
  const isInt = Number.isInteger;
  assert.true(isInt(42));
  assert.false(isInt(1.5));
});

QUnit.test('stored: String.fromCodePoint as map callback', assert => {
  const fromCp = String.fromCodePoint;
  assert.deepEqual([65, 66, 67].map(cp => fromCp(cp)), ['A', 'B', 'C']);
});

// A parameter shadowing a proxy global is the PARAMETER: the call runs, the argument it was given is
// what the body reads, and no static of the realm is substituted for what that argument holds.
QUnit.test('callbacks: a body reading a shadowing parameter keeps the call and its own read', assert => {
  const fake = { Array: { from: () => 'FAKE' }, Promise: { resolve: () => 'FAKE' } };
  assert.same((globalThis => globalThis.Array)(fake).from([1]), 'FAKE');
  assert.same((function (window) { return window.Array; })(fake).from([2]), 'FAKE');
  assert.same((self => self.Promise)(fake).resolve(3), 'FAKE');
  // ... and an absent argument keeps the native throw the read owes
  assert.throws(() => (globalThis => globalThis.Array)(undefined).from([4]));
});
