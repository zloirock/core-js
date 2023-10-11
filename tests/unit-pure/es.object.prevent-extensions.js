import ownKeys from '@core-js/pure/es/reflect/own-keys';
import keys from '@core-js/pure/es/object/keys';
import getOwnPropertyNames from '@core-js/pure/es/object/get-own-property-names';
import getOwnPropertySymbols from '@core-js/pure/es/object/get-own-property-symbols';
import preventExtensions from '@core-js/pure/es/object/prevent-extensions';

QUnit.test('Object.preventExtensions', assert => {
  assert.isFunction(preventExtensions);
  assert.arity(preventExtensions, 1);
  const data = [42, 'foo', false, null, undefined, {}];
  for (const value of data) {
    assert.notThrows(() => preventExtensions(value) || true, `accept ${ {}.toString.call(value).slice(8, -1) }`);
    assert.same(preventExtensions(value), value, `returns target on ${ {}.toString.call(value).slice(8, -1) }`);
  }
  const results = [];
  for (const key in preventExtensions({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(preventExtensions({})), []);
  assert.arrayEqual(getOwnPropertyNames(preventExtensions({})), []);
  assert.arrayEqual(getOwnPropertySymbols(preventExtensions({})), []);
  assert.arrayEqual(ownKeys(preventExtensions({})), []);
});
