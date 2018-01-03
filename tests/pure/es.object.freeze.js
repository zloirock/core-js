import { freeze, keys, getOwnPropertyNames, getOwnPropertySymbols } from '../../packages/core-js-pure/fn/object';
import ownKeys from '../../packages/core-js-pure/fn/reflect/own-keys';

QUnit.test('Object.freeze', assert => {
  assert.isFunction(freeze);
  assert.arity(freeze, 1);
  const data = [42, 'foo', false, null, undefined, {}];
  for (const value of data) {
    assert.notThrows(() => freeze(value) || true, `accept ${ {}.toString.call(value).slice(8, -1) }`);
    assert.same(freeze(value), value, `returns target on ${ {}.toString.call(value).slice(8, -1) }`);
  }
  const results = [];
  for (const key in freeze({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(freeze({})), []);
  assert.arrayEqual(getOwnPropertyNames(freeze({})), []);
  assert.arrayEqual(getOwnPropertySymbols(freeze({})), []);
  assert.arrayEqual(ownKeys(freeze({})), []);
});
