import { GLOBAL, NATIVE } from '../helpers/constants';

QUnit.test('Object.seal', assert => {
  const { seal, isSealed, keys, getOwnPropertyNames, getOwnPropertySymbols } = Object;
  const { ownKeys } = GLOBAL.Reflect || {};
  assert.isFunction(seal);
  assert.arity(seal, 1);
  assert.name(seal, 'seal');
  assert.looksNative(seal);
  assert.nonEnumerable(Object, 'seal');
  const data = [42, 'foo', false, null, undefined, {}];
  for (const value of data) {
    assert.notThrows(() => seal(value) || true, `accept ${ {}.toString.call(value).slice(8, -1) }`);
    assert.same(seal(value), value, `returns target on ${ {}.toString.call(value).slice(8, -1) }`);
  }
  if (NATIVE) assert.ok(isSealed(seal({})));
  const results = [];
  for (const key in seal({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(seal({})), []);
  assert.arrayEqual(getOwnPropertyNames(seal({})), []);
  if (getOwnPropertySymbols) assert.arrayEqual(getOwnPropertySymbols(seal({})), []);
  if (ownKeys) assert.arrayEqual(ownKeys(seal({})), []);
});
