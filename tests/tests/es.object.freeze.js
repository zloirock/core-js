import { GLOBAL, NATIVE } from '../helpers/constants';

QUnit.test('Object.freeze', function (assert) {
  var freeze = Object.freeze;
  var isFrozen = Object.isFrozen;
  var keys = Object.keys;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var ownKeys = (GLOBAL.Reflect || {}).ownKeys;
  assert.isFunction(freeze);
  assert.arity(freeze, 1);
  assert.name(freeze, 'freeze');
  assert.looksNative(freeze);
  assert.nonEnumerable(Object, 'freeze');
  var data = [42, 'foo', false, null, undefined, {}];
  for (var i = 0, length = data.length; i < length; ++i) {
    var value = data[i];
    assert.ok(function () {
      try {
        freeze(value);
        return true;
      } catch (e) { /* empty */ }
    }(), 'accept ' + {}.toString.call(value).slice(8, -1));
    assert.same(freeze(value), value, 'returns target on ' + {}.toString.call(value).slice(8, -1));
  }
  if (NATIVE) assert.ok(isFrozen(freeze({})));
  var results = [];
  for (var key in freeze({})) results.push(key);
  assert.arrayEqual(results, []);
  assert.arrayEqual(keys(freeze({})), []);
  assert.arrayEqual(getOwnPropertyNames(freeze({})), []);
  if (getOwnPropertySymbols) assert.arrayEqual(getOwnPropertySymbols(freeze({})), []);
  if (ownKeys) assert.arrayEqual(ownKeys(freeze({})), []);
});
