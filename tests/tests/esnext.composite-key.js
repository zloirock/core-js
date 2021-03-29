/* eslint-disable no-self-compare -- required for testing */
const { getPrototypeOf, isFrozen } = Object;

QUnit.test('compositeKey', assert => {
  assert.isFunction(compositeKey);
  assert.name(compositeKey, 'compositeKey');
  assert.looksNative(compositeKey);

  const key = compositeKey({});
  assert.same(typeof key, 'object');
  assert.same({}.toString.call(key), '[object Object]');
  assert.same(getPrototypeOf(key), null);
  assert.ok(isFrozen(key));

  const a = ['a'];
  const b = ['b'];
  const c = ['c'];

  assert.ok(compositeKey(a) === compositeKey(a));
  assert.ok(compositeKey(a) !== compositeKey(['a']));
  assert.ok(compositeKey(a) !== compositeKey(a, 1));
  assert.ok(compositeKey(a) !== compositeKey(a, b));
  assert.ok(compositeKey(a, 1) === compositeKey(a, 1));
  assert.ok(compositeKey(a, b) === compositeKey(a, b));
  assert.ok(compositeKey(a, b) !== compositeKey(b, a));
  assert.ok(compositeKey(a, b, c) === compositeKey(a, b, c));
  assert.ok(compositeKey(a, b, c) !== compositeKey(c, b, a));
  assert.ok(compositeKey(a, b, c) !== compositeKey(a, c, b));
  assert.ok(compositeKey(a, b, c, 1) !== compositeKey(a, b, c));
  assert.ok(compositeKey(a, b, c, 1) === compositeKey(a, b, c, 1));
  assert.ok(compositeKey(1, a) === compositeKey(1, a));
  assert.ok(compositeKey(1, a) !== compositeKey(a, 1));
  assert.ok(compositeKey(1, a, 2, b) === compositeKey(1, a, 2, b));
  assert.ok(compositeKey(1, a, 2, b) !== compositeKey(1, a, b, 2));
  assert.ok(compositeKey(1, 2, a, b) === compositeKey(1, 2, a, b));
  assert.ok(compositeKey(1, 2, a, b) !== compositeKey(1, a, b, 2));
  assert.ok(compositeKey(a, a) === compositeKey(a, a));
  assert.ok(compositeKey(a, a) !== compositeKey(a, ['a']));
  assert.ok(compositeKey(a, a) !== compositeKey(a, b));

  assert.throws(() => compositeKey(), TypeError);
  assert.throws(() => compositeKey(1, 2), TypeError);
  assert.throws(() => compositeKey('foo', null, true), TypeError);
});
