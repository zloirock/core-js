// Object.create/defineProperty/defineProperties - have guard (symbol/constructor)
QUnit.test('Object.create', assert => {
  const proto = { greet() { return 'hello'; } };
  const obj = Object.create(proto);
  assert.same(obj.greet(), 'hello');
  assert.same(Object.getPrototypeOf(obj), proto);
});

QUnit.test('Object.defineProperty', assert => {
  const obj = {};
  Object.defineProperty(obj, 'x', { value: 42, writable: false });
  assert.same(obj.x, 42);
});

QUnit.test('Object.defineProperties', assert => {
  const obj = {};
  Object.defineProperties(obj, {
    a: { value: 1, enumerable: true },
    b: { value: 2, enumerable: true },
  });
  assert.deepEqual(Object.keys(obj), ['a', 'b']);
});

QUnit.test('Object.getOwnPropertyDescriptors', assert => {
  const obj = { a: 1 };
  const descs = Object.getOwnPropertyDescriptors(obj);
  assert.same(descs.a.value, 1);
  assert.true(descs.a.enumerable);
});

QUnit.test('Object.setPrototypeOf', assert => {
  const proto = { type: 'custom' };
  const obj = {};
  Object.setPrototypeOf(obj, proto);
  assert.same(obj.type, 'custom');
});

QUnit.test('Object.getOwnPropertySymbols', assert => {
  const s = Symbol('s');
  const obj = { [s]: 1, a: 2 };
  assert.deepEqual(Object.getOwnPropertySymbols(obj), [s]);
});

// test pins Object.is on NaN,NaN to exercise the Object.is polyfill (Number.isNaN has its
// own dedicated test); suppress `math/prefer-number-is-nan` rewrite here
/* eslint-disable math/prefer-number-is-nan -- see above */
QUnit.test('Object.is', assert => {
  assert.true(Object.is(NaN, NaN));
  assert.false(Object.is(0, -0));
  assert.true(Object.is(1, 1));
});
/* eslint-enable math/prefer-number-is-nan -- end of test-pinned block */

QUnit.test('Object.values', assert => {
  assert.deepEqual(Object.values({ a: 1, b: 2 }), [1, 2]);
});

QUnit.test('Object.preventExtensions + isExtensible', assert => {
  const obj = Object.preventExtensions({});
  assert.false(Object.isExtensible(obj));
  assert.true(Object.isExtensible({}));
});

QUnit.test('Object.seal + isSealed', assert => {
  const obj = Object.seal({ a: 1 });
  assert.true(Object.isSealed(obj));
  assert.false(Object.isSealed({}));
});

QUnit.test('Object.isFrozen', assert => {
  assert.true(Object.isFrozen(Object.freeze({})));
  assert.false(Object.isFrozen({}));
});

QUnit.test('JSON.parse: with reviver (2 args triggers polyfill)', assert => {
  const result = JSON.parse('{"a":1,"b":2}', (key, value) => typeof value === 'number' ? value * 2 : value);
  assert.same(result.a, 2);
  assert.same(result.b, 4);
});
