import { GLOBAL, NATIVE } from '../helpers/constants';

QUnit.test('Object.freeze', assert => {
  const { freeze, isFrozen, keys, getOwnPropertyNames, getOwnPropertySymbols } = Object;
  const { ownKeys } = GLOBAL.Reflect || {};
  assert.isFunction(freeze);
  assert.arity(freeze, 1);
  assert.name(freeze, 'freeze');
  assert.looksNative(freeze);
  assert.nonEnumerable(Object, 'freeze');
  const data = [42, 'foo', false, null, undefined, {}];
  for (const value of data) {
    assert.notThrows(() => freeze(value) || true, `accept ${ {}.toString.call(value).slice(8, -1) }`);
    assert.same(freeze(value), value, `returns target on ${ {}.toString.call(value).slice(8, -1) }`);
  }
  if (NATIVE) assert.ok(isFrozen(freeze({})));
  const results = [];
  for (const key in freeze({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(freeze({})), []);
  assert.arrayEqual(getOwnPropertyNames(freeze({})), []);
  if (getOwnPropertySymbols) assert.arrayEqual(getOwnPropertySymbols(freeze({})), []);
  if (ownKeys) assert.arrayEqual(ownKeys(freeze({})), []);
});
