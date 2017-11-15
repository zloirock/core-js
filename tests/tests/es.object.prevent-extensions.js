import { GLOBAL, NATIVE } from '../helpers/constants';

QUnit.test('Object.preventExtensions', assert => {
  const { preventExtensions, keys, isExtensible, getOwnPropertyNames, getOwnPropertySymbols } = Object;
  const { ownKeys } = GLOBAL.Reflect || {};
  assert.isFunction(preventExtensions);
  assert.arity(preventExtensions, 1);
  assert.name(preventExtensions, 'preventExtensions');
  assert.looksNative(preventExtensions);
  assert.nonEnumerable(Object, 'preventExtensions');
  const data = [42, 'foo', false, null, undefined, {}];
  for (const value of data) {
    assert.ok((() => {
      try {
        preventExtensions(value);
        return true;
      } catch (e) { /* empty */ }
    })(), `accept ${ {}.toString.call(value).slice(8, -1) }`);
    assert.same(preventExtensions(value), value, `returns target on ${ {}.toString.call(value).slice(8, -1) }`);
  }
  if (NATIVE) assert.ok(!isExtensible(preventExtensions({})));
  const results = [];
  for (const key in preventExtensions({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(preventExtensions({})), []);
  assert.arrayEqual(getOwnPropertyNames(preventExtensions({})), []);
  if (getOwnPropertySymbols) assert.arrayEqual(getOwnPropertySymbols(preventExtensions({})), []);
  if (ownKeys) assert.arrayEqual(ownKeys(preventExtensions({})), []);
});
