import { GLOBAL, NATIVE } from '../helpers/constants';

QUnit.test('Object.preventExtensions', function (assert) {
  var preventExtensions = Object.preventExtensions;
  var keys = Object.keys;
  var isExtensible = Object.isExtensible;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var ownKeys = (GLOBAL.Reflect || {}).ownKeys;
  assert.isFunction(preventExtensions);
  assert.arity(preventExtensions, 1);
  assert.name(preventExtensions, 'preventExtensions');
  assert.looksNative(preventExtensions);
  assert.nonEnumerable(Object, 'preventExtensions');
  var data = [42, 'foo', false, null, undefined, {}];
  for (var i = 0, length = data.length; i < length; ++i) {
    var value = data[i];
    assert.ok(function () {
      try {
        preventExtensions(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + {}.toString.call(value).slice(8, -1));
    assert.same(preventExtensions(value), value, 'returns target on ' + {}.toString.call(value).slice(8, -1));
  }
  if (NATIVE) assert.ok(!isExtensible(preventExtensions({})));
  var results = [];
  for (var key in preventExtensions({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(preventExtensions({})), []);
  assert.arrayEqual(getOwnPropertyNames(preventExtensions({})), []);
  if (getOwnPropertySymbols) assert.arrayEqual(getOwnPropertySymbols(preventExtensions({})), []);
  if (ownKeys) assert.arrayEqual(ownKeys(preventExtensions({})), []);
});
