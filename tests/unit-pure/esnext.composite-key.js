import { getPrototypeOf, isFrozen } from '@core-js/pure/es/object';
import compositeKey from '@core-js/pure/full/composite-key';

QUnit.test('compositeKey', assert => {
  assert.isFunction(compositeKey);
  if (compositeKey.name) assert.name(compositeKey, 'compositeKey');

  const key = compositeKey({});
  assert.same(typeof key, 'object');
  assert.same({}.toString.call(key), '[object Object]');
  assert.same(getPrototypeOf(key), null);
  assert.true(isFrozen(key));

  const a = ['a'];
  const b = ['b'];
  const c = ['c'];

  assert.same(compositeKey(a), compositeKey(a));
  assert.notSame(compositeKey(a), compositeKey(['a']));
  assert.notSame(compositeKey(a), compositeKey(a, 1));
  assert.notSame(compositeKey(a), compositeKey(a, b));
  assert.same(compositeKey(a, 1), compositeKey(a, 1));
  assert.same(compositeKey(a, b), compositeKey(a, b));
  assert.notSame(compositeKey(a, b), compositeKey(b, a));
  assert.same(compositeKey(a, b, c), compositeKey(a, b, c));
  assert.notSame(compositeKey(a, b, c), compositeKey(c, b, a));
  assert.notSame(compositeKey(a, b, c), compositeKey(a, c, b));
  assert.notSame(compositeKey(a, b, c, 1), compositeKey(a, b, c));
  assert.same(compositeKey(a, b, c, 1), compositeKey(a, b, c, 1));
  assert.same(compositeKey(1, a), compositeKey(1, a));
  assert.notSame(compositeKey(1, a), compositeKey(a, 1));
  assert.same(compositeKey(1, a, 2, b), compositeKey(1, a, 2, b));
  assert.notSame(compositeKey(1, a, 2, b), compositeKey(1, a, b, 2));
  assert.same(compositeKey(1, 2, a, b), compositeKey(1, 2, a, b));
  assert.notSame(compositeKey(1, 2, a, b), compositeKey(1, a, b, 2));
  assert.same(compositeKey(a, a), compositeKey(a, a));
  assert.notSame(compositeKey(a, a), compositeKey(a, ['a']));
  assert.notSame(compositeKey(a, a), compositeKey(a, b));

  assert.throws(() => compositeKey(), TypeError);
  assert.throws(() => compositeKey(1, 2), TypeError);
  assert.throws(() => compositeKey('foo', null, true), TypeError);
});
