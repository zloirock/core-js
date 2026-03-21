/* eslint-disable prefer-destructuring -- intentionally testing non-destructuring member access */
// Polyfilled methods as callbacks, stored references, and higher-order usage

// callbacks
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
