import { GLOBAL, NATIVE } from '../helpers/constants';

QUnit.test('Object.seal', function (assert) {
  var seal = Object.seal;
  var isSealed = Object.isSealed;
  var keys = Object.keys;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var ownKeys = (GLOBAL.Reflect || {}).ownKeys;
  assert.isFunction(seal);
  assert.arity(seal, 1);
  assert.name(seal, 'seal');
  assert.looksNative(seal);
  assert.nonEnumerable(Object, 'seal');
  var data = [42, 'foo', false, null, undefined, {}];
  for (var i = 0, length = data.length; i < length; ++i) {
    var value = data[i];
    assert.ok(function () {
      try {
        seal(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + {}.toString.call(value).slice(8, -1));
    assert.same(seal(value), value, 'returns target on ' + {}.toString.call(value).slice(8, -1));
  }
  if (NATIVE) assert.ok(isSealed(seal({})));
  var results = [];
  for (var key in seal({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(seal({})), []);
  assert.arrayEqual(getOwnPropertyNames(seal({})), []);
  if (getOwnPropertySymbols) assert.arrayEqual(getOwnPropertySymbols(seal({})), []);
  if (ownKeys) assert.arrayEqual(ownKeys(seal({})), []);
});
