import ownKeys from '@core-js/pure/es/reflect/own-keys';
import keys from '@core-js/pure/es/object/keys';
import getOwnPropertyNames from '@core-js/pure/es/object/get-own-property-names';
import getOwnPropertySymbols from '@core-js/pure/es/object/get-own-property-symbols';
import freeze from '@core-js/pure/es/object/freeze';

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
